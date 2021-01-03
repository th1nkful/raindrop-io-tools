// For local development
require('dotenv/config');

const updateDropTags = require('./updateDropTags');

const {
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const addTag = async (raindrop, tag) => {
  const prefixedTag = `${tagPrefix}${tag}`;
  return updateDropTags(raindrop, [...raindrop.tags, prefixedTag]);
};

module.exports = addTag;
