const redis = require('redis');

// Create a Redis client
const client = redis.createClient('redis://localhost:6379');

async function connect_and_publish(){
  await client.connect();
  console.log(":) Redis connection success!");
  await client.set('tom', "Soldier of gavnosi");
  console.log("Published to redis nrt info");
  await client.get('tom').then((reply, err) => {
    if (err) {
      console.log('Redis get error:', err);
    } else {
      console.log('Get operation result:', reply);
    }
  }
  );
  client.quit();
};
connect_and_publish();
// .then(() => {
//   console.log(":) Redis connection success!");
// })
// .catch((error) => {
//   console.log(":( Redis connection error!");
//   process.exit(1);
// });

// client.get('key', (err, reply) => {
//   if (err) {
//     console.error('Redis get error:', err);
//   } else {
//     console.log('Get operation result:', reply);
//   }
// }
// .then((reply, err) => {
//   if (err) {
//     console.log('Redis get error:', err);
//   } else {
//     console.log('Get operation result:', reply);
//   }
// });
// console.log("kakabuna");
// Perform Redis operations
// client.set('key', 'value', (err, reply) => {
//   if (err) {
//     console.error('Redis set error:', err);
//   } else {
//     console.log('Set operation result:', reply);
//   }
// });

// client.get('key', (err, reply) => {
//   if (err) {
//     console.error('Redis get error:', err);
//   } else {
//     console.log('Get operation result:', reply);
//   }
// });

// // Close the Redis connection when done
// client.quit();
