/**
 * This file is the entry point for the application.
 * It starts the server and defines the routes.
 * It also serves static files from the public folder.
 * It also serves static files from the views folder.
 * It also serves static images from the images folder.
 */
const express = require('express');
const path = require('path');
const app = express();
const ejs = require('ejs'); 
const bodyParser = require('body-parser');
const sun_info = require('./adapters/sun_info_adapter'); // Starts the server of sun information.
const connect_and_publish = require('./models/nasa_data');
const WebSocket = require('ws');

const es = require('./models/es_functions');
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
app.get('/sun_info', (req, res) => {
    const filePath = path.join(viewsFolder, 'sun_info.html');
    res.sendFile(filePath);  
});
/**
 * Route to serve the dashboard page
 */
app.get('/', async (req, res) => {
    const filePath = path.join(viewsFolder, 'dashboard.html');
    res.sendFile(filePath);
  });
/**
 * Route to serve the near earth objcets page table.
 */
app.get('/neotable', async (req, res) => {
    const filePath = path.join(viewsFolder, 'neotable.html');
    res.sendFile(filePath); 
  });
/**
 * Route to serve the near earth objcets page graph.
 */
app.get('/nasa_graph', async (req, res) => {
    const filePath = path.join(viewsFolder, 'neo_graph.html');
    res.sendFile(filePath);
  });
/**
 * Route to serve the events search table.
 */
app.get('/search_table', (req, res) => {
    res.render('search_table', { entries: [] });
  });
  
/**
 * Route to serve the events search table. 
 */  
app.post('/search_table_post', async (req, res) => {
  // Get the start date, end date, event type and telescope from the request body.
      const { startDate, endDate, event,telescope } = req.body;
      var dateObj; 
      if(!startDate){
        dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - 7);
      }else{
        dateObj = new Date(startDate);
      }
      dateObj.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00:00.
      const format_startDate = dateObj.toISOString();
      var dateObj2;
      if(!endDate){
        dateObj2 = new Date();
      }else{
        dateObj2 = new Date(endDate);
      }
      dateObj2.setUTCHours(23, 59, 0, 0); // Set the time to 23:59:00:00.
      const format_endDate = dateObj2.toISOString();
      var query={};
      if (event){query['eventType']=event;} // If the event type is not null, add it to the query.
      if (telescope){query['eventSource']=telescope;} // If the telescope is not null, add it to the query.
      const result = await es.read_within_dates(format_startDate, format_endDate,query); // Get the results from the query.
      res.render('search_table', { entries: result }); // Render the search table with the results.
      
  });
  
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
const dashboard_socket = new WebSocket.Server({ port: 8060 }); // Create a websocket server on port 8060.
const neo_graph_socket = new WebSocket.Server({ port: 8061 }); // Create a websocket server on port 8061.
const neo_table_socket = new WebSocket.Server({ port: 8062 }); // Create a websocket server on port 8062.

neo_table_socket.on('connection', async (ws) => {
  // Get the data from the NASA API.
  const neoData = await connect_and_publish.get_neo_data();
  ws.send(JSON.stringify(neoData)); // Send the data to the client.
});
neo_graph_socket.on('connection', async (ws) => {
  // Get the data from the NASA API.
  const sizes = await connect_and_publish.get_neo_graph_data(); 
  const labels = Object.keys(sizes).map(Number); // Array of x-axis labels
  const dataPoints = Object.values(sizes); // Array of y-axis data points
  const xAxisLabel = 'Maximum Estimated Diameter (Meters)'; // Customize the x-axis label
  const yAxisLabel = 'Quantity Of Asteroids'; // Customize the y-axis label
  const chartLabel = 'Distribution Of Near Earth Object In The Past Month By Diameter'; // The label for the chart
  ws.send(JSON.stringify({labels,dataPoints,xAxisLabel,yAxisLabel,chartLabel}));
  
});
dashboard_socket.on('connection', async (ws) => {
  var urgencies = {'1':0,'2':0,'3':0,'4':0,'5':0}; // Urgency counts.
  var events ={'GRB':0,'ABR':0,'UVR':0,'XRR':0,'CMT':0} // Event type counts.
  const last_updated = await es.last_updated(); // Get the last updated time.
  dateObj = new Date(); // Get the current date.
  dateObj.setDate(dateObj.getDate() - 7); // Subtract 7 days from the current date.
  dateObj.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00:00.
  const format_startDate = dateObj.toISOString(); // Convert the date to ISO format.
  dateObj2 = new Date(); // Get the current date.
  dateObj2.setUTCHours(23, 59, 0, 0); // Set the time to 23:59:00:00.
  const format_endDate = dateObj2.toISOString(); // Convert the date to ISO format.
  await es.read_within_dates(format_startDate, format_endDate,{}).then((hits) => {
    /**
     * Loop through the hits and increment the urgency and event type counts.
     */
      for (var i = 0; i < hits.length; i++) {
          urgencies[hits[i].urgency] += 1;
          events[hits[i].eventType] += 1;
      }
    }); 
  const last_week_urgencies = Object.values(urgencies); // Array of last week's urgencies.
  const last_week_events = Object.values(events); // Array of last week's event types.
  const today = new Date(); // Get the current date.
  //today.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00:00.
  today.setDate(today.getDate() - 1); // Subtract 1 day from the current date.
  today.setUTCHours(new Date().getHours(), new Date().getUTCMinutes(), 0,0); // Set the time to 00:00:00:00.
  const todayFormat = today.toISOString(); // Convert the date to ISO format.
  const t2 = new Date(); // Get the current date.
  t2.setUTCHours(23, 59, 0, 0); // Set the time to 23:59:00:00.
  const todayFormat2 = t2.toISOString(); // Convert the date to ISO format.
  var last_event; // Last event that happened.
  // Create an object with the hours of the day as keys and 0 as values.
  var hours = {'00:00': 0, '01:00': 0, '02:00': 0, '03:00': 0, '04:00': 0, '05:00': 0, '06:00': 0, '07:00': 0, '08:00': 0, '09:00': 0, '10:00': 0, '11:00': 0, '12:00': 0, '13:00': 0, '14:00': 0, '15:00': 0, '16:00': 0, '17:00': 0, '18:00': 0, '19:00': 0, '20:00': 0, '21:00': 0, '22:00': 0, '23:00': 0};
  var total_urgenices = 0; // Total urgencies.
  var total_events = 0; // Total events.
  await es.read_within_dates(todayFormat, todayFormat2,{}).then((hits) => {
    /**
     * Loop through the hits and increment the urgency and event type counts.
     */
      for (var i = 0; i < hits.length; i++) {
          if (i == 0){
              last_event = "Type: "+hits[i].eventType+", Source: "+hits[i].eventSource+", Urgency: "+hits[i].urgency;
              last_event+='<br>';             
              if (hits[i].eventType==='CMT'){
                last_event+='Star Name: '+hits[i].star_name;
                last_event+='<br>'; 
                last_event+='RA: hours: '+hits[i].RA.hours+' minutes: '+hits[i].RA.minutes+' seconds: '+hits[i].RA.seconds
                last_event+='<br>';
                last_event+='DEC: degrees: '+hits[i].DEC.degrees+' minutes: '+ hits[i].DEC.minutes+' seconds: '+hits[i].DEC.seconds;
                last_event+='<br>';
                last_event +="Time Stamp: "+new Date(hits[i].eventTS).toUTCString();
              }else{
                last_event +="Time Stamp: "+new Date(hits[i].eventTS).toUTCString();
              }
          }
          total_events += 1;
          if (hits[i].urgency>=4){ // If the urgency is greater than or equal to 4, increment the total urgencies.
              total_urgenices += 1;
          }
          var date = new Date(hits[i].eventTS);
          var hour = date.getUTCHours();
          if (hour < 10){
              hour = '0'+hour.toString()+':00';
          }else{
              hour = hour.toString()+':00';
          }
          
          hours[hour] += 1;
      }
    });
    const total_events_per_hour = Object.values(hours);
    const total_events_per_hour_labels = Object.keys(hours); 
    const urg_txt = 'Total Critical Events (4-5): '+total_urgenices.toString(); 
    const events_txt = 'Total Events: '+total_events.toString(); 
    if (last_event === undefined){
      // If there are no events in the last 24 hours, set the last event to 'No events in the last 24 hours'.
      last_event='No events in the last 24 hours';
    }
    const msg = { last_week_events, total_events_per_hour, last_week_urgencies, total_events_per_hour_labels, urg_txt, events_txt ,last_event,last_updated };
    ws.send(JSON.stringify(msg));
});
