const request = require('request-promise');
const cheerio = require('cheerio');
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF';

// async function main() {
//     const result = await request.get('https://theskylive.com/sun-info');
//     const $ = cheerio.load(result);
//     const scrapedData = [];
//     $('body > div.container > div > div.content > div.main_content > table > tbody > tr').each((index, element) => {
//         if (index === 0) return true;
//         const tds = $(element).find('td');
//         const date = $(tds[0]).text();
//         const right_ascension = $(tds[1]).text();
//         const declination = $(tds[2]).text();
//         const magnitude = $(tds[3]).text();
//         const apparent_diameter = $(tds[4]).text();
//         const constellation = $(tds[5]).text();
//         const tableRow = { date, right_ascension, declination, magnitude, apparent_diameter, constellation };
//         scrapedData.push(tableRow);
//     });
//     console.log(scrapedData);
// }
// main();
const axios = require('axios');
const puppeteer = require('puppeteer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { createCanvas, loadImage } = require('canvas');
// Get the current date and the date one month ago
const currentDate = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

// Format the dates in the 'YYYY-MM-DD' format
const formattedCurrentDate = formatDate(currentDate);
const formattedOneMonthAgo = formatDate(oneMonthAgo);

// Make the API request to retrieve the NEO feed for the last month
// axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedOneMonthAgo}&end_date=${formattedCurrentDate}&api_key=${API_KEY}`)
axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedOneMonthAgo}&api_key=${API_KEY}`)
  .then(response => {
    // Process the response data and create the graph
    const asteroidData = response.data;
    createAsteroidGraph(asteroidData);
  })
  .catch(error => {
    console.error('Error retrieving NEO feed:', error);
  });

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

  const sizeCount = {};
  asteroidSizes.forEach(size => {
    if (sizeCount[size]) {
      sizeCount[size]++;
    } else {
      sizeCount[size] = 1;
    }
  });

  const graphData = [];
  for (let size in sizeCount) {
    graphData.push({ x: parseFloat(size), y: sizeCount[size] });
  }

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  const configuration = {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Asteroids',
        data: graphData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Estimated Diameter (meters)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Asteroids'
          }
        }
      }
    }
  };

  const chart = new ChartJSNodeCanvas({ ChartJS: Chart, canvas });
  await chart.render(configuration);

  const imageBuffer = canvas.toBuffer('image/png');
  // Save the graph image to a file or perform any other desired operation
  // fs.writeFileSync('path/to/graph.png', imageBuffer);
}



// const puppeteer = require('puppeteer');
// const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const { createCanvas, loadImage } = require('canvas');

// const axios = require('axios');
// const API_KEY = 'vYstnb1vgnDQ36rGu1dKa38kSbLfyiTUY7IEWL3D';
// // const API_KEY = 'lMo9wDnJvB4KDhzXnPMB4oBheG9P2B64N2O3p2ig';

// // Get the current date and the date one week ago
// const currentDate = new Date();
// const oneMonthAgo = new Date();
// oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
// // console.log("oneMonthAgo ", oneMonthAgo)
// // Format the dates in the 'YYYY-MM-DD' format
// const formattedCurrentDate = formatDate(currentDate);
// const formattedOneMonthAgo = formatDate(oneMonthAgo);
// // console.log("13!!", formattedOneMonthAgo)
// // console.log("13!!", formattedCurrentDate)
// // Make the API request to retrieve the NEO feed for the last week
// // axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&api_key=${API_KEY}`)

// axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${(formatDate(oneMonthAgo))}&api_key=${API_KEY}`)
//   .then(response => {
//     // Process the response data to obtain the distribution of event types
//     // console.log("response!!!", response.data) 
//     createAsteroidGraph(response.data);

//     // Log the distribution of event types
//     // console.log(eventTypes);
//   })
//   .catch(error => {
//     console.error('Error retrieving NEO feed:', error);
//   });

// // Helper function to format a date in 'YYYY-MM-DD' format
// function formatDate(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// // function formatDate(date) {
// //   const year = date.getFullYear();
// //   const month = String(date.getMonth() + 1).padStart(2, '0');
// //   const day = String(date.getDate()).padStart(2, '0');
// //   return `${year}-${month}-${day}`;
// // }

// function createAsteroidGraph(asteroidData) {
//   // Extract asteroid information from the data
//   const asteroids = asteroidData.near_earth_objects;
//   const asteroidSizes = [];

//   // Iterate over the asteroids and store their estimated diameters
//   for (let date in asteroids) {
//     asteroids[date].forEach(asteroid => {
//       asteroidSizes.push(asteroid.estimated_diameter.meters.estimated_diameter_max);
//     });
//   }

//   // Count how many asteroids have similar sizes
//   const sizeCount = {};
//   asteroidSizes.forEach(size => {
//     if (sizeCount[size]) {
//       sizeCount[size]++;
//     } else {
//       sizeCount[size] = 1;
//     }
//   });

//   // Prepare data for the graph
//   const graphData = [];
//   for (let size in sizeCount) {
//     graphData.push({ x: parseFloat(size), y: sizeCount[size] });
//   }

//   // Create the graph using a library like Chart.js
//   const ctx = document.getElementById('asteroidGraph').getContext('2d');
//   new Chart(ctx, {
//     type: 'scatter',
//     data: {
//       datasets: [{
//         label: 'Asteroids',
//         data: graphData,
//         backgroundColor: 'rgba(54, 162, 235, 0.6)'
//       }]
//     },
//     options: {
//       scales: {
//         x: {
//           type: 'linear',
//           title: {
//             display: true,
//             text: 'Estimated Diameter (meters)'
//           }
//         },
//         y: {
//           title: {
//             display: true,
//             text: 'Number of Asteroids'
//           }
//         }
//       }
//     }
//   });
// }

// // // Example asteroid data
// // const asteroidData = {
// //   near_earth_objects: {
// //     '2023-07-01': [
// //       { estimated_diameter: { meters: { estimated_diameter_max: 10 } } },
// //       { estimated_diameter: { meters: { estimated_diameter_max: 20 } } },
// //       { estimated_diameter: { meters: { estimated_diameter_max: 30 } } }
// //     ],
// //     '2023-07-02': [
// //       { estimated_diameter: { meters: { estimated_diameter_max: 20 } } },
// //       { estimated_diameter: { meters: { estimated_diameter_max: 30 } } },
// //       { estimated_diameter: { meters: { estimated_diameter_max: 40 } } }
// //     ]
// //     // ...more dates and asteroids
// //   }
// // };

// // // Call the function with the asteroid data
// // createAsteroidGraph(asteroidData);

// // Helper function to calculate the distribution of event types
// // function getEventTypesDistribution(data) {
// //   const eventTypes = {};

// //   // Iterate over the NEOs in the response data
// //   for (const date in data.near_earth_objects) {
// //     const neoList = data.near_earth_objects[date];
// //     for (const neo of neoList) {
// //       const eventType = neo.hasOwnProperty('is_potentially_hazardous_asteroid') ? 'Potentially Hazardous' : 'Non-Hazardous';
      
// //       // Increment the count for the event type
// //       if (eventTypes.hasOwnProperty(eventType)) {
// //         eventTypes[eventType]++;
// //       } else {
// //         eventTypes[eventType] = 1;
// //       }
// //     }
// //     for(const neo of neoList){
// //       console.log(neo)
// //     }
// //   }

// //   return eventTypes;
// // }
// // const currentDate = new Date();
// // const year = currentDate.getFullYear();
// // const month = String(currentDate.getMonth() + 1).padStart(2, '0');
// // const day = String(currentDate.getDate()).padStart(2, '0');

// // const formattedDate = `${year}-${month}-${day}`;
// // console.log(formattedDate);
// // axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}`)
// //   .then(response => {
// //       const jsonData = response.data;
// //       // console.log(jsonData);
// //       const nearEarthObjects = response.data.near_earth_objects;
// //       const asteroidsForDate = nearEarthObjects['2023-07-02'];
  
// //       console.log('Near-Earth Objects for 2023-06-14:');
// //       // console.log(nearEarthObjects);
// //       console.log('Near-Earth Objects for 2023-06-14:');
// //       asteroidsForDate.forEach(asteroid => {
// //         const estimatedDiameter = asteroid.estimated_diameter.kilometers;
// //         console.log('Diameter:', estimatedDiameter, 'km');
// //       });
// //     })
// //     .catch(error => {
// //       console.error('Error:', error);
// //     });
  
// // axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}}`)
// //   .then(response => {
// //     const jsonData = response.data;
// //     console.log(jsonData);
// //     const nearEarthObjects = response.data.near_earth_objects;
// //     //const asteroidsForDate = nearEarthObjects['2023-07-02'];

// //     console.log('Near-Earth Objects for 2023-06-14:');
// //     console.log(nearEarthObjects);
// //     // console.log('Near-Earth Objects for 2023-06-14:');
// //     // asteroidsForDate.forEach(asteroid => {
// //     //   const estimatedDiameter = asteroid.estimated_diameter.kilometers;
// //     //   console.log('Diameter:', estimatedDiameter, 'km');
// //     // });
// //   })
// //   .catch(error => {
// //     console.error('Error:', error);
// //   });