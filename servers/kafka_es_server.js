/**
 * @fileoverview This file is the server for the kafka_es page. It uses the node-rdkafka library to connect to the kafka server and the @elastic/elasticsearch library to connect to the elasticsearch server.
 * It uses the node-rdkafka library to connect to the kafka server.
 * It uses the @elastic/elasticsearch library to connect to the elasticsearch server.
 */
const Kafka = require('node-rdkafka'); // Import the node-rdkafka library.
const { configFromPath } = require('../util'); // Import the configFromPath function from the util.js file.
const { Client } = require('@elastic/elasticsearch') // Import the Client class from the @elastic/elasticsearch library.
const fs = require('fs') // Import the fs library.
const WebSocket = require('ws'); // Import the WebSocket library.
/**
 * 
 * @param {*} config  The config object.
 * @returns  The config map.
 */
function createConfigMap(config) {
  if (config.hasOwnProperty('security.protocol')) {
    return {
      'bootstrap.servers': config['bootstrap.servers'],
      'sasl.username': config['sasl.username'],
      'sasl.password': config['sasl.password'],
      'security.protocol': config['security.protocol'],
      'sasl.mechanisms': config['sasl.mechanisms'],
      'group.id': 'kafka-nodejs-getting-started'
    }
  } else {
    return {
      'bootstrap.servers': config['bootstrap.servers'],
      'group.id': 'kafka-nodejs-getting-started'
    }
  }
}
/**
 * 
 * @param {*} config  The config object.
 * @param {*} onData  The onData function.
 * @returns  The consumer.
 */
function createConsumer(config, onData) {
  const consumer = new Kafka.KafkaConsumer(
      createConfigMap(config),
      {'auto.offset.reset': 'earliest'});

  return new Promise((resolve, reject) => {
    consumer
     .on('ready', () => resolve(consumer))
     .on('data', onData);

    consumer.connect();
  });
};

var consumers = [] // Create an empty array to store the consumers.
/**
 * 
 * @param {*} topic  The topic to connect to.
 * @param {*} func  The function to be executed when a message is received.
 */
async function consumer(topic, func) {
  let configPath = "../client.properties"
  const config = await configFromPath(configPath);
  const consumer = await createConsumer(config, func);
  consumers.push([topic, consumer]);
  consumer.subscribe([topic]);
  consumer.consume();
  console.log(`Connecting consumer: ${topic}`);
}

const client = new Client({ // Create a new Elastic Search client.
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'xg4Pm4rK-jj0sSE66Tlq'
  },
  tls: {
    ca: fs.readFileSync('../http_ca.crt'),
    rejectUnauthorized: false
  }
})

process.on('SIGINT', () => { // When the process receives a SIGINT signal, disconnect the consumers and exit the process.
  console.log("\n")
  for (var i = 0; i < consumers.length; i++) {
    console.log(`Disconnecting consumer: ${consumers[i][0]}`);
    consumers[i][1].disconnect();
  }
  process.exit(0);
});

consumer("events",async ({key,value}) => { // Connect to the events topic.
  msg = JSON.parse(value); // Parse the message.
  console.log(msg);
  client.index({ // Index the message.
    index: 'event1',
    id: msg.eventTS,
    document: msg
    });

  if (msg.urgency>=4){ // If the urgency is greater than or equal to 4, store it as last critical message.
    client.index({
      index: 'lastmsg',
      id: 'last',
      document: msg
      });
  }
  const lastUpdated = formatDate(new Date()); // Get the current date and time.
  client.index({ // Index the last updated time.
    index: 'lastupdated',
    id: 'last',
    document: {'last_updated': lastUpdated}
    });

  
})
  .catch((err) => {
    console.error(`Something went wrong:\n${err}`);
    process.exit(1);
  });
const web_socket = new WebSocket.Server({ port: 8080 }); // Create a websocket server on port 8080.
web_socket.on('connection', async (ws) => { // When a client connects to the websocket server, send the last critical message to the client.
  client.get({
    index: 'lastmsg',
    id: 'last'
  }).then((res) => {
  var m=res._source;
  /**
   * If the urgency is greater than or equal to 4 and the message was sent within the last hour, send the message to the client.
   */
  if (m.urgency>=4 && (new Date().getHours()==new Date(m.eventTS).getUTCHours() && new Date().getDate()==new Date(m.eventTS).getUTCDate() && new Date().getMonth()==new Date(m.eventTS).getUTCMonth() && new Date().getFullYear()==new Date(m.eventTS).getUTCFullYear())){
    m = `Type: ${m.eventType}, Source: ${m.eventSource}, Urgency: ${m.urgency}`;
    const blinkingMessageInterval = setInterval(() => { // Send the blinking message to the client every second.
      const message = { text: m, blinking: true }; 
      ws.send(JSON.stringify(message)); // Send the message to the client.
    }, 1000);
  }
  });


  });
  /**
   * @param {*} date  The date to be formatted.
   * @returns  The formatted date.
   */
  function formatDate(date) {
    const year = date.getFullYear(); // Get the year.
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month.
    const day = String(date.getDate()).padStart(2, '0'); // Get the day.
    const hours = String(date.getHours()).padStart(2, '0'); // Get the hours.
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get the minutes.
    return `${year}/${month}/${day}:${hours}:${minutes}`; // Return the formatted date.
  }


