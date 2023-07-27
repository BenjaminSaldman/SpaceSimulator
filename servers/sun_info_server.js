/**
 * @fileoverview This file is the server for the sun_info page. It uses puppeteer to get the images from the web and save them to the images folder.
 * It also uses puppeteer to take a screenshot of the sun activity graph and save it to the images folder.
 * It uses the puppeteer library to get the images from the web and save them to the images folder.
 */
const puppeteer = require('puppeteer'); // Import the puppeteer library.
/**
 * 
 * @param {*} sunInfoUrl  The url of the image to be saved.
 * @param {*} imgname  The name of the image to be saved.
 */
async function getSunInfo(sunInfoUrl,imgname) {
  const browser = await puppeteer.launch(); // Launch a new browser
  const page = await browser.newPage(); // Open a new page
  await page.goto(sunInfoUrl); // Go to the URL
  await page.waitForSelector('img'); // Wait for the image to be visible
  const imageUrl = await page.$eval('img', (img) => img.src); // Get the image URL
  await page.screenshot({ path: `images/${imgname}` }); // Save the image to the images folder
  await browser.close(); // Close the browser
  console.log(`Image saved: ${imgname}`);
}
/**
 * This function takes a screenshot of the sun activity graph and saves it to the images folder.
 */
async function takeCombinedScreenshot() {
  const browser = await puppeteer.launch(); // Launch a new browser
  const page = await browser.newPage(); // Open a new page
  await page.goto('https://www.spaceweatherlive.com/en/solar-activity.html'); // Go to the URL
  await page.waitForSelector('.graph-md'); // Wait for the graph to be visible
  await page.waitForSelector('.row.my-1.text-center'); // Wait for the other element to be visible
  const graphElement = await page.$('.graph-md'); // Select the graph element
  const otherElement = await page.$('.row.my-1.text-center'); // Select the other element
  const graphBoundingBox = await graphElement.boundingBox(); // Get the bounding box of the graph element
  const otherElementBoundingBox = await otherElement.boundingBox(); // Get the bounding box of the other element
  const combinedBoundingBox = { // Create a bounding box that contains both elements
    x: Math.min(graphBoundingBox.x, otherElementBoundingBox.x),
    y: Math.min(graphBoundingBox.y, otherElementBoundingBox.y),
    width: Math.max(graphBoundingBox.x + graphBoundingBox.width, otherElementBoundingBox.x + otherElementBoundingBox.width) - Math.min(graphBoundingBox.x, otherElementBoundingBox.x),
    height: Math.max(graphBoundingBox.y + graphBoundingBox.height, otherElementBoundingBox.y + otherElementBoundingBox.height) - Math.min(graphBoundingBox.y, otherElementBoundingBox.y),
  };
  const screenshotOptions = { path: `images/graph.png` }; // Set the path and filename for the combined screenshot
  await page.screenshot({ ...screenshotOptions, clip: combinedBoundingBox }); // Take the screenshot
  console.log('Combined screenshot saved.');
  await browser.close(); // Close the browser
}
async function update_images(){ // This function gets the images from the web and saves them to the images folder.
  try {
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0193.jpg','coronal_holes.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/SDO_HMIIF_512.jpg','sunspot_regions.jpg');
    await getSunInfo('https://sohowww.nascom.nasa.gov/data/realtime/c2/512/latest.jpg','coronal_mass_ejections.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0131.jpg','solar_flares.jpg');
    await getSunInfo('https://stereo-ssc.nascom.nasa.gov/beacon/euvi_195_heliographic.gif','far_side.jpg');
    await takeCombinedScreenshot();
    setTimeout(update_images, 1000*60);
  }catch (error) {
    console.log(error);
  }
}
update_images();

module.exports = {update_images};
  