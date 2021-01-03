// For local development
require('dotenv/config');

const raindropApi = require('./raindropApi');

const {
  RAINDROP_COLLECTION: collectionId = '-1',
} = process.env;

const getAllDrops = async () => {
  const drops = [];

  for (let x = 0; x < 50; x += 1) {
    // no-await-in-loop disabled to page through raindrops
    // eslint-disable-next-line no-await-in-loop
    const { data } = await raindropApi.get(`/raindrops/${collectionId}?perpage=50&page=${x}`);
    const { items } = data;
    drops.push(...items);

    // end the loop early for pages with less than 50 items
    if (items.length === 0) {
      x = 50;
    }
  }

  return drops;
};

module.exports = getAllDrops;
