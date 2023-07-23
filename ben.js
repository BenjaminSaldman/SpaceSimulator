const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const PORT = 3001;
// websocket-server.js
const expressWs = require('express-ws')(app);

const viewsFolder = path.join(__dirname, 'views');


// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket route to handle connections
app.ws('/websocket', (ws, req) => {
  console.log('WebSocket connected');

  // Send a message with a blinking background every 1 second
  const blinkingMessageInterval = setInterval(() => {
    const message = { text: 'Hello, this is a blinking message!', blinking: true };
    ws.send(JSON.stringify(message));
  }, 1000);

  // Close the interval and WebSocket connection when the client disconnects
  ws.on('close', () => {
    clearInterval(blinkingMessageInterval);
    console.log('WebSocket disconnected');
  });
});
app.get('/', (req, res) => {
  const filePath = path.join(viewsFolder, 'it.html');
  res.sendFile(filePath);
});

// app.listen(PORT, () => {
//   console.log(`WebSocket server is running on http://localhost:${PORT}`);
// });


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
