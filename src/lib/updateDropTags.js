const raindropApi = require('./raindropApi');

const updateDropTags = async ({ _id }, tags) => raindropApi
  .put(`/raindrop/${_id}`, { tags });

module.exports = updateDropTags;
