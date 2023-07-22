const redis = require('redis');

// Create a Redis client
const client = redis.createClient('redis://localhost:6379');
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
async function connect_and_publish(){
  await client.connect();
  console.log(":) Redis connection success!");
  const itzik = {1:4}
  itzik['last_updated'] = formatDate(new Date());
  console.log(formatDate(new Date()));
  await client.set('last updated neo', JSON.stringify(itzik));
  console.log("Published to redis nrt info");
  await client.del('last updated neo');
  await client.get('last updated neo').then((reply, err) => {
    if (err) {
      console.log('Redis get error:', err);
    } else {
      console.log('Get operation result:', (JSON.parse(reply)));
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
