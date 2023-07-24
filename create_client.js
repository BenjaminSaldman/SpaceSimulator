const redis = require('redis');

// Create a Redis client as a global variable
let redisClient;

// Function to create and return the Redis client instance
function getRedisClient() {
  if (!redisClient || !redisClient.connected) {
    // If the Redis client doesn't exist or is not connected, create a new one
    redisClient = redis.createClient('redis://localhost:6379');

    // Listen for the "ready" event to check if the client is already connected
    redisClient.on('ready', () => {
      console.log('Redis client is already connected.');
    });

    // Listen for the "connect" event, which fires when the client connects to Redis
    redisClient.on('connect', () => {
      console.log('Redis client has connected.');
    });

    // Listen for the "error" event to handle any connection errors
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  // Return the existing Redis client instance
  return redisClient;
}

// Export the function to be used in other files
module.exports = getRedisClient();
