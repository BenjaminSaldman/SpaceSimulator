const axios = require('axios');
const API_KEY = '4bVmf61GGj3Fa8SPtSG2zPEeQTPgFxdnBaYRKazF';
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate);
axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}`)
  .then(response => {
      const jsonData = response.data;
      // console.log(jsonData);
      const nearEarthObjects = response.data.near_earth_objects;
      const asteroidsForDate = nearEarthObjects['2023-07-02'];
  
      console.log('Near-Earth Objects for 2023-06-14:');
      // console.log(nearEarthObjects);
      console.log('Near-Earth Objects for 2023-06-14:');
      asteroidsForDate.forEach(asteroid => {
        const estimatedDiameter = asteroid.estimated_diameter.kilometers;
        console.log('Diameter:', estimatedDiameter, 'km');
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
  
// axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=${API_KEY}}`)
//   .then(response => {
//     const jsonData = response.data;
//     console.log(jsonData);
//     const nearEarthObjects = response.data.near_earth_objects;
//     //const asteroidsForDate = nearEarthObjects['2023-07-02'];

//     console.log('Near-Earth Objects for 2023-06-14:');
//     console.log(nearEarthObjects);
//     // console.log('Near-Earth Objects for 2023-06-14:');
//     // asteroidsForDate.forEach(asteroid => {
//     //   const estimatedDiameter = asteroid.estimated_diameter.kilometers;
//     //   console.log('Diameter:', estimatedDiameter, 'km');
//     // });
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });