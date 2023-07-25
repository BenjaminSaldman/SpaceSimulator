const redis = require('redis');
const { configFromPath } = require('../util');
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
const redis_client = redis.createClient('redis://localhost:6379');
async function read_within_dates(startingDate, endingDate,params={}){
  const result =  await client.search({
    index: 'event1',
    "query": {
        "range" : {
         "eventTS":{
              "gte": startingDate,
              "lte": endingDate,
          }
        }
      },
      "size": 10000
    }
  )

const hits = result.hits.hits.map((hit) => hit._source).sort((a, b) => new Date(b.eventTS)-new Date(a.eventTS) );
return filterListByHashMap(hits, params);
}
function filterListByHashMap(list, hashMap) {
  const filteredList = list.filter((item) => {
    return Object.entries(hashMap).every(([key, value]) => item[key] === value);
  });

  return filteredList;
}
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const today = new Date().toISOString();
async function last_updated(){
  const result= await client.get({
     index: 'lastupdated',
     id: 'last'
   })
   return result._source;

 }
// read_within_dates('2023-07-15T21:00:00.000Z', '2023-07-22T21:00:00.000Z',{'urgency':1,'star_name':'A9IV'}).then((hits) => {
//   console.log(hits);
// });
// read_within_dates(oneWeekAgo.toISOString(), today,{}).then((hits) => {
//     console.log(hits);
//   });
module.exports = {read_within_dates, last_updated}