/**
 * @fileoverview This file contains the functions that are used to read data from the elasticsearch database.
 * It uses the @elastic/elasticsearch library to connect to the elasticsearch server.
 */
const { Client } = require('@elastic/elasticsearch') // Import the Client class from the @elastic/elasticsearch library.
const fs = require('fs') // Import the fs library.
const client = new Client({ // Create a new elasticsearch client.
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
  /**
   * @param {*} startingDate  The starting date of the search.
   * @param {*} endingDate  The ending date of the search.
   * @param {*} params  The parameters to filter the search by.
   * @returns  The hits of the search.
   */
async function read_within_dates(startingDate, endingDate,params={}){
  const result =  await client.search({ // Search the database.
    index: 'event1', // Search the event1 index.
    "query": {
        "range" : { 
         "eventTS":{ // Search the eventTS field.
              "gte": startingDate, // Search for values greater than or equal to the starting date.
              "lte": endingDate, // Search for values less than or equal to the ending date.
          }
        }
      },
      "size": 10000 // Set the maximum number of results to 10000.
    }
  )

const hits = result.hits.hits.map((hit) => hit._source).sort((a, b) => new Date(b.eventTS)-new Date(a.eventTS) ); // Get the hits from the search and sort them by date.
return filterListByHashMap(hits, params); // Filter the hits by the parameters.
}
/**
 * @param {*} list  The list to be filtered.
 * @param {*} hashMap  The parameters to filter the list by.
 * @returns  The filtered list.
 */
function filterListByHashMap(list, hashMap) {
  const filteredList = list.filter((item) => {
    return Object.entries(hashMap).every(([key, value]) => item[key] === value);
  });

  return filteredList;
}
/**
 * @returns The last message that was inserted to the elastic search.
 */
async function last_updated(){
  const result= await client.get({
     index: 'lastupdated',
     id: 'last'
   })
   return result._source;

 }

module.exports = {read_within_dates, last_updated}