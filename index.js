// For local development
require('dotenv/config');

const promiseAll = require('p-all');

const addReadTime = require('./src/addReadTime');
const tagCleanup = require('./src/tagCleanup');

const { CONFIG_WPM = '250' } = process.env;
const wpm = parseInt(CONFIG_WPM, 10);
if (Number.isNaN(wpm)) {
  throw new Error('CONFIG_WPM should be an integer!');
}

exports.processUnsorted = async (req, res) => {
  await promiseAll([
    () => addReadTime(),
    () => tagCleanup(),
  ], { stopOnError: false });

  res.sendStatus(200);
};
