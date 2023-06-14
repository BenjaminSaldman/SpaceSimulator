const request = require('request-promise');
const cheerio = require('cheerio');
async function main() {
    const result = await request.get('https://theskylive.com/sun-info');
    const $ = cheerio.load(result);
    const scrapedData = [];
    $('body > div.container > div > div.content > div.main_content > table > tbody > tr').each((index, element) => {
        if (index === 0) return true;
        const tds = $(element).find('td');
        const date = $(tds[0]).text();
        const right_ascension = $(tds[1]).text();
        const declination = $(tds[2]).text();
        const magnitude = $(tds[3]).text();
        const apparent_diameter = $(tds[4]).text();
        const constellation = $(tds[5]).text();
        const tableRow = { date, right_ascension, declination, magnitude, apparent_diameter, constellation };
        scrapedData.push(tableRow);
    });
    console.log(scrapedData);
}
main();