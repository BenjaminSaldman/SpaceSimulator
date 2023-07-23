const express = require('express');
const path = require('path');
const app = express();
const ejs = require('ejs'); 
const bodyParser = require('body-parser');
const sun_info = require('./sun_info');
const fs = require('fs');
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF';
const currentDate = new Date();
const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the current date
const year = nextDate.getFullYear();
const month = String(nextDate.getMonth() + 1).padStart(2, '0');
const day = String(nextDate.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;
const axios = require('axios');
const connect_and_publish = require('./redis_data');
const es = require('./dashboards');


// Define the path to the views folder
const viewsFolder = path.join(__dirname, 'views');

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the views folder
app.use(express.static(viewsFolder));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Define a route to serve the gallery.html file
app.get('/', (req, res) => {
    const filePath = path.join(viewsFolder, 'sun_info.html');
    res.sendFile(filePath);
  //sun_info();
  
});
app.get('/dashboard', (req, res) => {
    const filePath = path.join(viewsFolder, 'dashboard.html');
    res.sendFile(filePath);
  });
  app.get('/neotable', async (req, res) => {
    const neoData = await connect_and_publish.get_neo_data();
    res.render('neotable', { neoData }); // Render the EJS template with the NEO data
  });
  app.get('/nasa_graph', async (req, res) => {
    try {
      // Generate the Chart.js graph and get the chart image buffer
      //await callAsteroidAPI();
      const sizes = await connect_and_publish.get_neo_graph_data();
      const labels = Object.keys(sizes).map(Number); // Array of x-axis labels
      const dataPoints = Object.values(sizes); // Array of y-axis data points
      const xAxisLabel = 'Maximum Estimated Diameter Meters'; // Customize the x-axis label
      const yAxisLabel = 'Quantity Of Asteroids'; // Customize the y-axis label
      const chartLabel = 'Distribution Of Near Earth Object In The Past Month By Diameter'; // The label for the chart
      // Read the EJS template file
      fs.readFile('views/neo_graph.ejs', 'utf8', (err, template) => {
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
  
        res.set('Content-Type', 'text/html');
        res.send(renderedChart);
      });
    } catch (error) {
      console.error('Error generating chart:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  app.get('/search_table', (req, res) => {
    res.render('temp', { entries: [] });
  });
  
  // Route to handle search form submission
  app.post('/search_table_post', async (req, res) => {
      const { startDate, endDate, event_type,telescope } = req.body;
      const dateObj = new Date(startDate);
      dateObj.setHours(0, 0, 0, 0);
      const format_startDate = dateObj.toISOString();
      const dateObj2 = new Date(endDate);
      dateObj2.setHours(0, 0, 0, 0);
      const format_endDate = dateObj2.toISOString();
      var query={};
      if (event_type){query['eventType']=event_type;}
      if (telescope){query['eventSource']=telescope;}
      console.log(format_startDate);
      console.log(format_endDate);
      const result = await es.read_within_dates(format_startDate, format_endDate,query);
      console.log(result);
      res.render('temp', { entries: result });
      
  });
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});