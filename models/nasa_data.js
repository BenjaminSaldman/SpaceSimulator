/**
 * @fileoverview This file contains the functions to fetch data from the NASA API and save it to the redis database.
 * It uses the axios library to fetch data from the NASA API.
 */
const axios = require('axios'); // Import the axios library.
const currentDate = new Date(); // Get the current date.
const oneMonthAgo = new Date(); 
const threWeeksAgo = new Date(); 
const twoWeeksAgo = new Date(); 
const oneWeekAgo = new Date(); 
oneMonthAgo.setDate(oneMonthAgo.getDate() - 28);
threWeeksAgo.setDate(threWeeksAgo.getDate() - 21);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
// Format the dates in the 'YYYY-MM-DD' format
const formatted_dates = [formatDate(oneMonthAgo),formatDate(threWeeksAgo),formatDate(twoWeeksAgo),formatDate(oneWeekAgo)];
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF'; // The API key to access the NASA API.
var sizes2 = []; 
var sizeCount = {};
for (let i = 5; i <= 500; i += 5) { // Create an array of sizes.
    sizes2.push(i);
  }
for (let i in sizes2){ // Create a hashmap of sizes.
    sizeCount[sizes2[i]] = 0;
}
/**
 * This function calls the NASA API and saves the data to the redis database.
 */
async function callAsteroidAPI() {
    for (let i in formatted_dates){ // Loop through the dates
        await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatted_dates[i]}&api_key=${API_KEY}`)
        .then(response => {
        // Process the response data and create the graph
        const asteroidData = response.data;
        createAsteroidGraph(asteroidData).then((res) => {
            for (const key in res) {
                sizeCount[key] += res[key]; // Add the values to the hashmap.
            }
        });
        
      })
      .catch(error => {
        console.error('Error retrieving NEO feed:', error);
      });
    }
}

// Helper function to format a date in 'YYYY-MM-DD' format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  /**
   * @param {*} asteroidData  The data from the NASA API.
   * @returns  The hashmap of asteroid sizes.
   */
  async function createAsteroidGraph(asteroidData) {
    const asteroids = asteroidData.near_earth_objects; // Get the near earth objects from the data.
    const asteroidSizes = []; 
  
    for (let date in asteroids) { 
      // Loop through the dates and get the asteroid sizes.
      asteroids[date].forEach(asteroid => {
        asteroidSizes.push(asteroid.estimated_diameter.meters.estimated_diameter_max);
      });
    }
    /**
     * @param {*} size  The size of the asteroid.
     * @returns  The nearest size.
     */
    function find_nearest(size){
      var nearest = 0;
      var diff = 1000000000;
      for (let i = 0; i < sizes2.length; i++) {
          if(Math.abs(size-sizes2[i]) < diff){
              diff = Math.abs(size-sizes2[i]);
              nearest = sizes2[i];
          }
          }
          return nearest;
          
    }
    var sizeCount = {};
    // Loop through the asteroid sizes and count the number of asteroids for each size.
    asteroidSizes.forEach(size => {
      k = find_nearest(size);
      if (sizeCount[k]) { // If the size is already in the hashmap, increment the count.
        sizeCount[k]++;
      } else { // If the size is not in the hashmap, add it to the hashmap.
        sizeCount[k] = 1;
      }
    });
    return sizeCount;
  }

const redis = require('redis'); // Import the redis library.
const client = redis.createClient('redis://localhost:6379'); // Create a redis client.
/**
 * @returns The data from the redis database or NASA API to update the near earth object graph.
 */
async function get_neo_graph_data(){
    var ret = {}; 
    await client.connect(); // Connect to the redis database.
    await client.get('last updated neo').then(async (reply, err) => {
      /**
       * If the data is not in the redis database, call the NASA API and save the data to the redis database.
       * If the data is in the redis database, get the data from the redis database.
       * If the data is in the redis database and the data is not up to date, call the NASA API and save the data to the redis database.
       */
        if (err) {
          console.log('Redis get error:', err);
        } else {
            rep = JSON.parse(reply); // Parse the reply.
            if (rep == null || (rep!=null && rep['last_updated'] != formatDate(currentDate))){
                client.quit(); // Disconnect from the redis database.
                await callAsteroidAPI().then(async (res) => { // Call the NASA API and save the data to the redis database.
                    const data = {
                        'last_updated': formatDate(currentDate),
                        'data': sizeCount
                    };
                  if (!client.connected){ // Connect to the redis database.
                    await client.connect(); 
                  }
                    await client.set('last updated neo', JSON.stringify(data)).then(() => { 
                      // Save the data to the redis database.
                        console.log('Redis set success');
                        ret = sizeCount;
                    });
                    
                });
            }else{
                if (rep['last_updated'] == formatDate(currentDate)){ // Get the data from the redis database.
                    console.log('Redis get success');
                    ret = rep['data'];
                }
            }
        }
      }
      );
      client.quit(); // Disconnect from the redis database.
      return ret; // Return the data.

}
/**
 * @returns The data from the redis database or NASA API to update the near earth object table.
 */
async function get_neo_data(){
    var ret = []; 
    const currentDate = new Date();
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the current date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // Format the date in the 'YYYY-MM-DD' format
    await client.connect(); // Connect to the redis database.
    /**
     * If the data is not in the redis database, call the NASA API and save the data to the redis database.
     * If the data is in the redis database, get the data from the redis database.
     * If the data is in the redis database and the data is not up to date, call the NASA API and save the data to the redis database.
     */
    await client.get('last updated table').then(async (reply, err) => {
        if (err) {
            console.log('Redis get error:', err);
        } else {
            rep = JSON.parse(reply);
            if (rep == null || (rep!=null && rep['last_updated'] != formatDate(currentDate))){
            client.quit();
            // Call the NASA API and save the data to the redis database.
            await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}`).then(async response => {                                               
            const nearEarthObjects = response.data.near_earth_objects; // Get the near earth objects from the data
            const neoData = [];
            // Loop through the near Earth objects and filter out the ones for the next 24 hours
            Object.entries(nearEarthObjects).forEach(([date, asteroids]) => {
            if (new Date(date) <= nextDate) {
                asteroids.forEach(asteroid => {
                const estimatedDiameterMin = asteroid.estimated_diameter.kilometers.estimated_diameter_min;
                const estimatedDiameterMax = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
                const name = asteroid.name;
                const closeApproachDate = asteroid.close_approach_data[0].close_approach_date_full;
                var valid = false; // Check if the close approach date is valid (i.e. it is in the future).
                if (new Date(closeApproachDate).getHours()<currentDate.getHours())
                {
                  valid = true;
                }
                else if (new Date(closeApproachDate).getHours()<=currentDate.getHours())
                {
                 if (new Date(closeApproachDate).getMinutes() <= currentDate.getMinutes()){
                    valid = true;
                  }else{
                    valid = false;
                  }
                }
                const isPotentiallyHazardous = asteroid.is_potentially_hazardous_asteroid; 
                if (new Date(closeApproachDate).getDate()>currentDate.getDate()) { // If the close approach date is in the future, add it to the data.
                  if (valid){ // If the close approach date is valid, add it to the data.
                    neoData.push({ name, estimatedDiameter: { min: estimatedDiameterMin, max: estimatedDiameterMax }, closeApproachDate,isPotentiallyHazardous });
                  }
                  // If the close approach date is not valid, do not add it to the data.
                }
                // If the close approach date is today, add it to the data.
                else if ((new Date(closeApproachDate).getHours() == currentDate.getHours() && new Date(closeApproachDate).getMinutes() >= currentDate.getMinutes() || new Date(closeApproachDate).getHours() > currentDate.getHours())){
                  neoData.push({ name, estimatedDiameter: { min: estimatedDiameterMin, max: estimatedDiameterMax }, closeApproachDate,isPotentiallyHazardous });
                }
                
            });
          }
        });
        ret = neoData; 
        const data = { // Save the data to the redis database.
            'last_updated': formatDate(currentDate),
            'data': neoData
        };
        if (!client.connected){ // Connect to the redis database.
          await client.connect();
        }
        await client.set('last updated table', JSON.stringify(data)).then(() => { // Save the data to the redis database.
            console.log('Redis set success');
        }
        );

        }).catch(error => { 
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred while fetching data from NASA API' });
        });

        }
        else{
          
            if (rep['last_updated'] == formatDate(currentDate)){ // Get the data from the redis database.
                ret = rep['data'];
            }
            
        }
    }

});
client.quit();
return ret;
}

module.exports = { get_neo_graph_data, get_neo_data }