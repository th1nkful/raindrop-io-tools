// For local development
require('dotenv/config');

const axios = require('axios').default;

const { RAINDROP_TOKEN: token } = process.env;

const raindropApi = axios.create({
  baseURL: 'https://api.raindrop.io/rest/v1',
  headers: { Authorization: `Bearer ${token}` },
});

module.exports = raindropApi;
