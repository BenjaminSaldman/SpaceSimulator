const Kafka = require('node-rdkafka');
const { configFromPath } = require('./util');

const { Client } = require('@elastic/elasticsearch')
const fs = require('fs')

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

consumer("events",({key,value}) => {
  msg = JSON.parse(value);
  console.log(msg);
  client.index({
    index: 'event',
      document: msg
    });
  
})
  .catch((err) => {
    console.error(`Something went wrong:\n${err}`);
    process.exit(1);
  });