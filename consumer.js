const Kafka = require('node-rdkafka');
const { configFromPath } = require('./util');

const { Client } = require('@elastic/elasticsearch')
const fs = require('fs')
const WebSocket = require('ws');
const redis = require('redis');
const redis_client = redis.createClient('redis://localhost:6379');
// Create a WebSocket server on port 8080
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

var consumers = []

async function consumer(topic, func) {
  let configPath = "client.properties"
  const config = await configFromPath(configPath);
  const consumer = await createConsumer(config, func);
  consumers.push([topic, consumer]);
  consumer.subscribe([topic]);
  consumer.consume();
  console.log(`Connecting consumer: ${topic}`);
}

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'xg4Pm4rK-jj0sSE66Tlq'
  },
  tls: {
    ca: fs.readFileSync('./http_ca.crt'),
    rejectUnauthorized: false
  }
})

process.on('SIGINT', () => {
  console.log("\n")
  for (var i = 0; i < consumers.length; i++) {
    console.log(`Disconnecting consumer: ${consumers[i][0]}`);
    //consumers[i][1].disconnect();
  }
  process.exit(0);
});

consumer("events",async ({key,value}) => {
  msg = JSON.parse(value);
  console.log(msg);
  
  client.index({
    index: 'event1',
    id: msg.eventTS,
    document: msg
    });
    if (msg.urgency>=4){
  client.index({
    index: 'lastmsg',
    id: 'last',
    document: msg
    });}
  
})
  .catch((err) => {
    console.error(`Something went wrong:\n${err}`);
    process.exit(1);
  });
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', async (ws) => {
  client.get({
    index: 'lastmsg',
    id: 'last'
  }).then((res) => {
    console.log(res);
    var m=res._source;
  if (m.urgency>=4){
    m = `Type: ${m.eventType}, Source: ${m.eventSource}, Urgency: ${m.urgency}`;
    console.log(m);
    const blinkingMessageInterval = setInterval(() => {
      const message = { text: m, blinking: true };
      ws.send(JSON.stringify(message));
    }, 1000);
  }
    //ws.send(JSON.stringify(res.body._source));
  });
  
  });
// wss.on('connection', async (ws) => {
//   console.log('Client connected.');
//   await redis_client.connect();
//   const msg = await (redis_client.get("Urgent event"));
//   await redis_client.quit();
//   var m;
//   if (msg != null){
//     const m2 = JSON.parse(msg);
//     m = `Urgency level: ${msg.urgency}, event type: ${m2.eventType}, source: ${m2.eventSource}`;
//     const blinkingMessageInterval = setInterval(() => {
//       const message = { text: m, blinking: true };
//       ws.send(JSON.stringify(message));
//     }, 1000);
//   }
//   // Send blinking messages to the client
//   // sendBlinkingMessage(ws, 'This is a blinking message!', 500);
// });

