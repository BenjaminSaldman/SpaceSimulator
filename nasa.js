const axios = require('axios');
const API_KEY = 'pIsWYv9ns0tdOt7VZ6ILLmaEOJONJeUqxfjYYDyl';
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate);

axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&api_key=pIsWYv9ns0tdOt7VZ6ILLmaEOJONJeUqxfjYYDyl`)
  .then(response => {
    // const jsonData = response.data;
    // console.log(jsonData);
    const nearEarthObjects = response.data.near_earth_objects;
    const asteroidsForDate = nearEarthObjects['2023-06-14'];

    // console.log('Near-Earth Objects for 2023-06-14:');
    // console.log(asteroidsForDate);
    console.log('Near-Earth Objects for 2023-06-14:');
    asteroidsForDate.forEach(asteroid => {
      const estimatedDiameter = asteroid.estimated_diameter.kilometers;
      console.log('Diameter:', estimatedDiameter, 'km');
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });