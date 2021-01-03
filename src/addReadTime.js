// For local development
require('dotenv/config');

const promiseMap = require('p-map');

const getAllDrops = require('./lib/getAllDrops');
const calculateContent = require('./lib/calculateContent');
const calculateYouTube = require('./lib/calculateYouTube');
const addTag = require('./lib/addTag');

const {
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const hasPrefixedTag = (tags) => tags
  .find((tag) => tag
    .includes(tagPrefix));

module.exports = async () => {
  const drops = await getAllDrops();

  await promiseMap(drops, async (item) => {
    if (hasPrefixedTag(item.tags)) {
      return;
    }

    try {
      if (item.domain.includes('youtube.com')) {
        await calculateYouTube(item);
        return;
      }

      const typesToProcess = ['article', 'link'];
      if (typesToProcess.includes(item.type)) {
        await calculateContent(item);
        return;
      }

      await addTag(item, item.type);
    } catch (error) {
      await addTag(item, 'not-calculated');
      throw error;
    }
  }, {
    stopOnError: false,
    concurrency: 1,
  });
};
