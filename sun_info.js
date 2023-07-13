const puppeteer = require('puppeteer');

async function getSunInfo(sunInfoUrl,imgname) {
    const browser = await puppeteer.launch();

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the image URL
  await page.goto(sunInfoUrl);

  // Wait for the image to load
  await page.waitForSelector('img');

  // Get the image source URL
  const imageUrl = await page.$eval('img', (img) => img.src);

  // Save the image
  await page.screenshot({ path: `images/${imgname}` });

  // Close the browser
  await browser.close();

  console.log(`Image saved: ${imgname}`);

}
async function sun_info() {
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0193.jpg','coronal_holes.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/SDO_HMIIF_512.jpg','sunspot_regions.jpg');
    await getSunInfo('https://sohowww.nascom.nasa.gov/data/realtime/c2/512/latest.jpg','coronal_mass_ejections.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0131.jpg','solar_flares.jpg');
    await getSunInfo('https://stereo-ssc.nascom.nasa.gov/beacon/euvi_195_heliographic.gif','far_side.jpg');
}
// getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0193.jpg','coronal_holes.jpg').then(() => {});
// getSunInfo('https://www.spaceweatherlive.com/images/SDO/SDO_HMIIF_512.jpg','sunspot_regions.jpg').then(() => {});
// getSunInfo('https://sohowww.nascom.nasa.gov/data/realtime/c2/512/latest.jpg','coronal_mass_ejections.jpg').then(() => {});
// getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0131.jpg','solar_flares.jpg').then(() => {});
// getSunInfo('https://stereo-ssc.nascom.nasa.gov/beacon/euvi_195_heliographic.gif','far_side.jpg').then(() => {});
//read_info().then(() => {});

module.exports = sun_info;
  