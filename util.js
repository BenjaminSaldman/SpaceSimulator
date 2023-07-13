const fs = require('fs');
const readline = require('readline');

function readAllLines(path) {    
  return new Promise((resolve, reject) => {
    // Test file access directly, so that we can fail fast.
    // Otherwise, an ENOENT is thrown in the global scope by the readline internals.
    try {
      fs.accessSync(path, fs.constants.R_OK);
    } catch (err) {
      reject(err);
    }
    
    let lines = [];
    
    const reader = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity
    });
    
    reader
      .on('line', (line) => lines.push(line))
      .on('close', () => resolve(lines));
  });
}

exports.configFromPath = async function configFromPath(path) {
  const lines = await readAllLines(path);

  return lines
    .filter((line) => !/^\s*?#/.test(line))
    .map((line) => line
      .split('=')
      .map((s) => s.trim()))
    .reduce((config, [k, v]) => {
      config[k] = v;
      return config;
    }, {});
};
// const axios = require('axios');
// const cheerio = require('cheerio');

// const url = 'https://theskylive.com/sun-info';

// axios.get(url)
//   .then(response => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     // Find the sun picture element
//     const sunPictureElement = $('.sun_container'); // Adjust selector if needed

//     // Extract the image URL
//     const imageUrl = 'https://theskylive.com/'+sunPictureElement.find('img').attr('src');

//     // Download the image
//     axios.get(imageUrl, { responseType: 'arraybuffer' })
//       .then(imageResponse => {
//         const imageContent = Buffer.from(imageResponse.data, 'binary');

//         // Save the image to a file
//         fs.writeFileSync('sun_picture.jpg', imageContent);

//         console.log('Sun picture downloaded and saved as "sun_picture.jpg"');
//       })
//       .catch(error => {
//         console.error('Error downloading the image:', error);
//       });
//   })
//   .catch(error => {
//     console.error('Error fetching the website:', error);
//   });

