const express = require('express');
const path = require('path');
const sun_info = require('./sun_info');
const app = express();

// Define the path to the views folder
const viewsFolder = path.join(__dirname, 'views');

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the views folder
app.use(express.static(viewsFolder));

// Serve static images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Define a route to serve the gallery.html file
app.get('/', (req, res) => {
    const filePath = path.join(viewsFolder, 'sun_info.html');
    res.sendFile(filePath);
  sun_info();
  
});
app.get('/dashboard', (req, res) => {
    console.log("dashboard");
    const filePath = path.join(viewsFolder, 'dashboard.html');
    res.sendFile(filePath);
  });

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});