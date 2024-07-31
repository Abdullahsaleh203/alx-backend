import redis from 'redis';
import util from 'util'; // Import the util module


const client = redis.createClient();

// client = redis.createClient();

client.on('error', (err) => console.log(`Redis client not connected to the server: ${err}`));

client.on('connect', () => {
    console.log('Redis client connected to the server');
}).on('error', (err) => {
    console.log(`Redis client not connected to the server: ${err}`);
});

function setNewSchool(schoolName, value) {
    client.set(schoolName, value, (error, response) => {
        redis.print(`Reply: ${response}`);
    });
}

let displaySchoolValue = async schoolName => {
    const getAsync = util.promisify(client.get).bind(client);
    console.log(await getAsync(schoolName));
};
displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
