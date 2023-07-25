const axios = require('axios');
const currentDate = new Date();
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
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF';
var sizes2 = [];
var sizeCount = {};
for (let i = 5; i <= 500; i += 5) {
    sizes2.push(i);
  }
for (let i in sizes2){
    sizeCount[sizes2[i]] = 0;
}
async function callAsteroidAPI() {
    
    for (let i in formatted_dates){
        await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatted_dates[i]}&api_key=${API_KEY}`)
        .then(response => {
        // Process the response data and create the graph
        const asteroidData = response.data;
        createAsteroidGraph(asteroidData).then((res) => {
            for (const key in res) {
                sizeCount[key] += res[key];
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
  // Function to create the asteroid graph
  async function createAsteroidGraph(asteroidData) {
    const asteroids = asteroidData.near_earth_objects;
    const asteroidSizes = [];
  
    for (let date in asteroids) {
      asteroids[date].forEach(asteroid => {
        asteroidSizes.push(asteroid.estimated_diameter.meters.estimated_diameter_max);
      });
    }
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
    asteroidSizes.forEach(size => {
      k = find_nearest(size);
      if (sizeCount[k]) {
        sizeCount[k]++;
      } else {
        sizeCount[k] = 1;
      }
    });
    return sizeCount;
  }

const redis = require('redis');

const client = redis.createClient('redis://localhost:6379');
async function get_neo_graph_data(){
    var ret = {};
    await client.connect();
    await client.get('last updated neo').then(async (reply, err) => {
        if (err) {
          console.log('Redis get error:', err);
        } else {
            rep = JSON.parse(reply);
            if (rep == null || (rep!=null && rep['last_updated'] != formatDate(currentDate))){
                client.quit();
                await callAsteroidAPI().then(async (res) => {
                    const data = {
                        'last_updated': formatDate(currentDate),
                        'data': sizeCount
                    };
                  if (!client.connected){
                    await client.connect();
                  }
                    await client.set('last updated neo', JSON.stringify(data)).then(() => { 
                        console.log('Redis set success');
                        ret = sizeCount;
                    });
                    
                });
            }else{
                if (rep['last_updated'] == formatDate(currentDate)){
                    console.log('Redis get success');
                    ret = rep['data'];
                }
            }
        }
      }
      );
      client.quit();
      return ret;

}
async function get_neo_data(){
    var ret = [];
    const currentDate = new Date();
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the current date
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    await client.connect();
    await client.get('last updated table').then(async (reply, err) => {
        if (err) {
            console.log('Redis get error:', err);
        } else {
            rep = JSON.parse(reply);
            if (rep == null || (rep!=null && rep['last_updated'] != formatDate(currentDate))){
            client.quit();
            await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}`).then(async response => {                                               
            const nearEarthObjects = response.data.near_earth_objects;
            const neoData = [];
            // Loop through the near Earth objects and filter out the ones for the next 24 hours
            Object.entries(nearEarthObjects).forEach(([date, asteroids]) => {
            if (new Date(date) <= nextDate) {
                asteroids.forEach(asteroid => {
                const estimatedDiameterMin = asteroid.estimated_diameter.kilometers.estimated_diameter_min;
                const estimatedDiameterMax = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
                const name = asteroid.name;
                const closeApproachDate = asteroid.close_approach_data[0].close_approach_date_full;
                const isPotentiallyHazardous = asteroid.is_potentially_hazardous_asteroid;
                neoData.push({ name, estimatedDiameter: { min: estimatedDiameterMin, max: estimatedDiameterMax }, closeApproachDate,isPotentiallyHazardous });
            });
          }
        });
        ret = neoData;
        const data = {
            'last_updated': formatDate(currentDate),
            'data': neoData
        };
        if (!client.connected){
          await client.connect();
        }
        await client.set('last updated table', JSON.stringify(data)).then(() => { 
            console.log('Redis set success');
        }
        );

        }).catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred while fetching data from NASA API' });
        });

        }
        else{
          
            if (rep['last_updated'] == formatDate(currentDate)){
                console.log('Redis get success');
                ret = rep['data'];
            }
            
        }
    }

});
client.quit();
return ret;
}

module.exports = { get_neo_graph_data, get_neo_data }