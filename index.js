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
app.get('/dashboard', async (req, res) => {
    var urgencies = {'1':0,'2':0,'3':0,'4':0,'5':0};
    var events ={'GRB':0,'ABR':0,'UVR':0,'XRR':0,'CMT':0}
    dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 7);
    dateObj.setHours(0, 0, 0, 0);
    const format_startDate = dateObj.toISOString();
    dateObj2 = new Date();
    dateObj2.setHours(23, 59, 0, 0);
    const format_endDate = dateObj2.toISOString();
    await es.read_within_dates(format_startDate, format_endDate,{}).then((hits) => {
        for (var i = 0; i < hits.length; i++) {
            urgencies[hits[i].urgency] += 1;
            events[hits[i].eventType] += 1;
        }
      }); 
    console.log(urgencies);
    console.log(events);
    const data3Values = Object.values(urgencies);
    const data1Values = Object.values(events);
    const today = new Date();
    today.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0);
    const todayFormat = today.toISOString();
    today.setHours(23, 59, 0, 0);
    const todayFormat2 = today.toISOString();
    var hours = {'00:00': 0, '01:00': 0, '02:00': 0, '03:00': 0, '04:00': 0, '05:00': 0, '06:00': 0, '07:00': 0, '08:00': 0, '09:00': 0, '10:00': 0, '11:00': 0, '12:00': 0, '13:00': 0, '14:00': 0, '15:00': 0, '16:00': 0, '17:00': 0, '18:00': 0, '19:00': 0, '20:00': 0, '21:00': 0, '22:00': 0, '23:00': 0};
    await es.read_within_dates(todayFormat, todayFormat2,{}).then((hits) => {
        for (var i = 0; i < hits.length; i++) {
            var date = new Date(hits[i].eventTS);
            var hour = date.getHours();
            if (hour < 10){
                hour = '0'+hour.toString()+':00';
            }else{
                hour = hour.toString()+':00';
            }
            
            hours[hour] += 1;
        }
      });
      console.log(Object.keys(hours));
      const data2Values = Object.values(hours);
      const data2Labels = Object.keys(hours);
      console.log(data1Values);
      const total_urgenices = data3Values[3]+data3Values[4];
      const total_events = data1Values.reduce((a, b) => a + b, 0);
      const urg_txt = 'Total Critical Events (4-5): '+total_urgenices.toString();
      const events_txt = 'Total Events: '+total_events.toString();
      //const data3Labels = Object.keys(hours);
    const filePath = path.join(viewsFolder, 'dashboard.ejs');
    res.render(filePath, { data1Values, data2Values, data3Values, data2Labels, urg_txt, events_txt });
    //res.sendFile(filePath);
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
      var dateObj;
      if(!startDate){
        dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - 7);
      }else{
        dateObj = new Date(startDate);
      }
      dateObj.setHours(0, 0, 0, 0);
      const format_startDate = dateObj.toISOString();
      var dateObj2;
      if(!endDate){
        dateObj2 = new Date();
      }else{
        dateObj2 = new Date(endDate);
      }
      dateObj2.setHours(23, 59, 0, 0);
      const format_endDate = dateObj2.toISOString();
      var query={};
      if (event_type){query['eventType']=event_type;}
      if (telescope){query['eventSource']=telescope;}
      
      const result = await es.read_within_dates(format_startDate, format_endDate,query);
      res.render('temp', { entries: result });
      
  });
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});