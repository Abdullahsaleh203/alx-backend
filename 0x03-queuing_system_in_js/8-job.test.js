import sinon from 'sinon';
import { expect } from 'chai';
import { createQueue } from 'kue';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  let sandbox;
  let QUEUE;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    QUEUE = createQueue({ name: 'push_notification_code_test' });
    QUEUE.testMode.enter(true);
  });

  afterEach(() => {
    sandbox.restore();
    QUEUE.testMode.clear();
    QUEUE.testMode.exit();
  });

  it('throws an error if jobs is not an array', () => {
    const invalidJobs = {};
    expect(() => createPushNotificationsJobs(invalidJobs, QUEUE)).to.throw('Jobs is not an array');
  });

  it('adds jobs to the queue with the correct type', () => {
    const jobInfos = [
      {
        phoneNumber: '44556677889',
        message: 'Use the code 1982 to verify your account',
      },
      {
        phoneNumber: '98877665544',
        message: 'Use the code 1738 to verify your account',
      },
    ];
    createPushNotificationsJobs(jobInfos, QUEUE);

    expect(QUEUE.testMode.jobs.length).to.equal(2);
    expect(QUEUE.testMode.jobs[0].data).to.deep.equal(jobInfos[0]);
    expect(QUEUE.testMode.jobs[0].type).to.equal('push_notification_code_3');
  });

  it('registers event handlers for a job', () => {
    const jobInfos = [
      {
        phoneNumber: '44556677889',
        message: 'Use the code 1982 to verify your account',
      },
    ];
    const Push3 = {
      on: sandbox.stub(),
      save: sandbox.stub().callsArgWith(0, null),
    };
    const queueCreateStub = sandbox.stub(QUEUE, 'create').returns(Push3);

    createPushNotificationsJobs(jobInfos, QUEUE);

    sinon.assert.calledOnce(queueCreateStub);
    sinon.assert.calledWithExactly(queueCreateStub, 'push_notification_code_3', jobInfos[0]);
    sinon.assert.calledOnce(Push3.save);
    sinon.assert.calledThrice(Push3.on);
    sinon.assert.calledWithExactly(Push3.on.getCall(0), 'complete');
    sinon.assert.calledWithExactly(Push3.on.getCall(1), 'progress');
    sinon.assert.calledWithExactly(Push3.on.getCall(2), 'failed');
  });

});
