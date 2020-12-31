const promiseAll = require('p-all');
const addReadTime = require('./addReadTime');
const tagCleanup = require('./tagCleanup');

exports.processUnsorted = async (req, res) => {
  await promiseAll([
    () => addReadTime(req, res),
    () => tagCleanup(req, res),
  ], { stopOnError: false });
  
  res.sendStatus(200);
};
