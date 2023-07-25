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
async function takeCombinedScreenshot() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.spaceweatherlive.com/en/solar-activity.html');

  await page.waitForSelector('.graph-md'); // Wait for the graph to be visible
  await page.waitForSelector('.row.my-1.text-center'); // Wait for the other element to be visible

  const graphElement = await page.$('.graph-md'); // Select the graph element
  const otherElement = await page.$('.row.my-1.text-center'); // Select the other element

  const graphBoundingBox = await graphElement.boundingBox();
  const otherElementBoundingBox = await otherElement.boundingBox();

  const combinedBoundingBox = {
    x: Math.min(graphBoundingBox.x, otherElementBoundingBox.x),
    y: Math.min(graphBoundingBox.y, otherElementBoundingBox.y),
    width: Math.max(graphBoundingBox.x + graphBoundingBox.width, otherElementBoundingBox.x + otherElementBoundingBox.width) - Math.min(graphBoundingBox.x, otherElementBoundingBox.x),
    height: Math.max(graphBoundingBox.y + graphBoundingBox.height, otherElementBoundingBox.y + otherElementBoundingBox.height) - Math.min(graphBoundingBox.y, otherElementBoundingBox.y),
  };

  const screenshotOptions = { path: `images/graph.png` }; // Set the path and filename for the combined screenshot

  await page.screenshot({ ...screenshotOptions, clip: combinedBoundingBox });

  console.log('Combined screenshot saved.');

  await browser.close();
}
async function sun_info() {
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0193.jpg','coronal_holes.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/SDO_HMIIF_512.jpg','sunspot_regions.jpg');
    await getSunInfo('https://sohowww.nascom.nasa.gov/data/realtime/c2/512/latest.jpg','coronal_mass_ejections.jpg');
    await getSunInfo('https://www.spaceweatherlive.com/images/SDO/latest_512_0131.jpg','solar_flares.jpg');
    await getSunInfo('https://stereo-ssc.nascom.nasa.gov/beacon/euvi_195_heliographic.gif','far_side.jpg');
    await takeCombinedScreenshot();
}
async function update_images(){
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



module.exports = sun_info;
  