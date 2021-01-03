// For local development
require('dotenv/config');

const updateDropTags = require('./updateDropTags');

const {
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const addTimeTag = async (raindrop, contentLength) => {
  const tag = `${tagPrefix}${Math.round(contentLength)}mins`;
  return updateDropTags(raindrop, [...raindrop.tags, tag]);
};

module.exports = addTimeTag;
