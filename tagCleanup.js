// For local development
require('dotenv').config();

const promiseMap = require('p-map');
const axios = require('axios').default;

const {
  RAINDROP_TOKEN: token,
  RAINDROP_COLLECTION: collectionId = '-1',
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const api = axios.create({
  baseURL: 'https://api.raindrop.io/rest/v1',
  headers: { Authorization: `Bearer ${token}` },
});

const getAllDrops = async () => {
  const drops = [];

  for (let x = 0; x < 50; x++) {
    const { data: { items } } = await api.get(`/raindrops/${collectionId}?perpage=50&page=${x}`);
    drops.push(...items);

    if (items.length === 0) {
      // end the loop early for pages with less than 50 items
      x = 50;
    }
  }

  return drops;
};

const replaceTags = async ({ _id }, tags) => api.put(`/raindrop/${_id}`, { tags });

const zapier = 'zapier';
const inoreader = 'inoreader';

module.exports = async (req, res) => {
  const drops = await getAllDrops();
  
  try {
    await promiseMap(drops, async (item) => {
      const remove = [zapier, inoreader];
      const { tags } = item;
      
      const hasTagsToClean = tags
        .some((tag) => remove.includes(tag));
        
      if (!hasTagsToClean) {
        return;
      }
    
      const cleanedTags = tags
        .filter((tag) => !remove.includes(tag));
        
      await replaceTags(item, cleanedTags);
    }, {
      stopOnError: false,
      concurrency: 1,
    });
  } catch (error) {
    console.error(error);
  }
};
