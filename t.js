const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const es = require('./dashboards');
// Set the view engine to use EJS templates
app.set('view engine', 'ejs');

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Sample data for demonstration
const sampleData = [
 
];

// Route to render the main page with the search bar
app.get('/', (req, res) => {
  res.render('temp.ejs', { entries: [] });
});

// Route to handle search form submission
app.post('/search', async (req, res) => {
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
    res.render('temp.ejs', { entries: result });
    
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
