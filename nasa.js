const axios = require('axios');
const express = require('express');
const path = require('path');
const app = express();
const ejs = require('ejs'); // Add this line to include EJS
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF';
const currentDate = new Date();
const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the current date
const year = nextDate.getFullYear();
const month = String(nextDate.getMonth() + 1).padStart(2, '0');
const day = String(nextDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the views folder path

app.get('/neotable', (req, res) => {
  axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}`)
    .then(response => {
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
            neoData.push({ name, estimatedDiameter: { min: estimatedDiameterMin, max: estimatedDiameterMax }, closeApproachDate });
          });
        }
      });

      res.render('neotable', { neoData }); // Render the EJS template with the NEO data
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while fetching data from NASA API' });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
