// Primarily for local development
require('dotenv').config();

const axios = require('axios').default;
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const {
  RAINDROP_TOKEN: token,
  RAINDROP_COLLECTION: collectionId = '-1',
  CONFIG_WPM = '250',
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const wpm = parseInt(CONFIG_WPM, 10);
if (Number.isNaN(wpm)) {
  throw new Error('CONFIG_WPM should be an integer!');
}

const api = axios.create({
  baseURL: 'https://api.raindrop.io/rest/v1',
  headers: { Authorization: `Bearer ${token}` },
});

exports.processUnsorted = async (req, res) => {
  console.log('Processing your droplets...');

  let updated = 0;
  const drops = [];

  for (let x = 0; x < 50; x++) {
    const { data: { items } } = await api.get(`/raindrops/${collectionId}?perpage=50&page=${x}`);
    drops.push(...items);
    if (items.length === 0) {
      // end the loop early for pages with less than 50 items
      x = 50;
    }
  }

  console.log(`Found ${drops} droplets to process...`);

  await Promise.all(drops.map(async (item) => {
    try {
      const { tags, link, _id } = item;

      const hasTime = tags.find((tag) => tag.includes(tagPrefix));
      if (hasTime) {
        return;
      }

      const { data: source } = await axios.get(link);
      const doc = new JSDOM(source, { url: link });
      const { textContent } = new Readability(doc.window.document, {}).parse();
      const words = textContent.match(/(\w+)/g).length;
      const minutes = Math.round(words / wpm);

      const tag = `${tagPrefix}${minutes}mins`;
      await api.put(`/raindrop/${_id}`, {
        tags: [...tags, tag],
      });

      updated += 1;
    } catch (error) {
      console.error(error);
    }
  }));

  console.log(`Updated ${updated} droplets...`);
  res.sendStatus(200);
};
