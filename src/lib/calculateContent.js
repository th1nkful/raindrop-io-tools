// For local development
require('dotenv/config');

const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const addTimeTag = require('./addTimeTag');

const { CONFIG_WPM = '250' } = process.env;
const wpm = parseInt(CONFIG_WPM, 10);

const calculateContent = async (raindrop) => {
  const { window } = await JSDOM.fromURL(raindrop.link);
  const { textContent } = new Readability(window.document, {}).parse();

  // estimate the number of minutes to read content
  const words = textContent.match(/(\w+)/g).length;
  const minutes = words / wpm;

  // Add the time tag to the bookmark
  await addTimeTag(raindrop, minutes);
};

module.exports = calculateContent;
