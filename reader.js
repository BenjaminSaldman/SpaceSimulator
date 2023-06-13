const { configFromPath } = require('./util');

const { Client } = require('@elastic/elasticsearch')
const fs = require('fs')
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
  async function read(){
  const result =  await client.search({
    index: 'event',
    "query": {
        "match_all" : {}
      }
    }
  )
  await result.hits.hits.forEach((hit)=>{
    console.log(hit);
  });
}
read();

