const promiseMap = require('p-map');

const getAllDrops = require('./lib/getAllDrops');
const updateDropTags = require('./lib/updateDropTags');

const remove = ['zapier', 'inoreader'];

const hasTagsToClean = (item) => item.tags
  .some((tag) => remove.includes(tag));

module.exports = async () => {
  const drops = await getAllDrops();

  await promiseMap(drops, async (item) => {
    if (hasTagsToClean(item)) {
      await updateDropTags(item, item.tags
        .filter((tag) => !remove.includes(tag)));
    }
  }, {
    stopOnError: false,
    concurrency: 1,
  });
};
