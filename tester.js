const axios = require('axios');
const { createCanvas } = require('canvas');
const Chart = require('chart.js');
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
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
        //console.log(createAsteroidGraph(asteroidData));
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


const app = express();
const port = 3000;
const redis = require('redis');
const client = redis.createClient('redis://localhost:6379');
async function connect_and_publish(){
    var ret = {};
    await client.connect();
    await client.get('last updated neo').then(async (reply, err) => {
        if (err) {
          console.log('Redis get error:', err);
        } else {
            rep = JSON.parse(reply);
            if (rep == null || (rep!=null && rep['last_updated'] != formatDate(currentDate))){
                await callAsteroidAPI().then(async (res) => {
                    const data = {
                        'last_updated': formatDate(currentDate),
                        'data': sizeCount
                    };
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
app.get('/', async (req, res) => {
  try {
    // Generate the Chart.js graph and get the chart image buffer
    //await callAsteroidAPI();
    
    const sizes = await connect_and_publish();
    const labels = Object.keys(sizes).map(Number); // Array of x-axis labels
    const dataPoints = Object.values(sizes); // Array of y-axis data points
    const xAxisLabel = 'Maximum Estimated Diameter Meters'; // Customize the x-axis label
    const yAxisLabel = 'Quantity Of Asteroids'; // Customize the y-axis label
    const chartLabel = 'Distribution Of Near Earth Object In The Past Month By Diameter'; // The label for the chart
    // Read the EJS template file
    fs.readFile('chart.ejs', 'utf8', (err, template) => {
      if (err) {
        console.error('Error reading template file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Render the EJS template with data
      const renderedChart = ejs.render(template, {
        labels,
        dataPoints,
        xAxisLabel,
        yAxisLabel,
        chartLabel,
      });

      // Serve the rendered chart as an HTML response
      res.set('Content-Type', 'text/html');
      res.send(renderedChart);
    });
  } catch (error) {
    console.error('Error generating chart:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


