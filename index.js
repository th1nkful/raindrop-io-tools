// For local development
require('dotenv').config();

const promiseMap = require('p-map');
const axios = require('axios').default;
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const youtube = require('ytdl-core');

const {
  RAINDROP_TOKEN: token,
  RAINDROP_COLLECTION: collectionId = '-1',
  CONFIG_WPM = '250',
  CONFIG_TAG_PREFIX: tagPrefix = 'time-',
} = process.env;

const wpm = parseInt(CONFIG_WPM, 10);
if (Number.isNaN(wpm)) {
  throw new Error('CONFIG_WPM should be an integer!');
}

const api = axios.create({
  baseURL: 'https://api.raindrop.io/rest/v1',
  headers: { Authorization: `Bearer ${token}` },
});

const hasTimeTag = (tags) => tags.find((tag) => tag.includes(tagPrefix));

const updateTags = async (id, tags, length) => {
  const tag = `${tagPrefix}${Math.round(length)}mins`;

  return api.put(`/raindrop/${id}`, {
    tags: [...tags, tag],
  });
};

const calculateYouTube = async ({ _id, tags, link }) => {
  // Get time of video if its from YouTube domain
  const { videoDetails } = await youtube.getBasicInfo(link);
  const minutes = parseInt(videoDetails.lengthSeconds, 10) / 60;
  await updateTags(_id, tags, minutes);
};

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

const calculateContent = async ({ _id, tags, link: url }) => {
  const { window } = await JSDOM.fromURL(url);
  const { textContent } = new Readability(window.document, {}).parse();

  // estimate the number of minutes to read content
  const words = textContent.match(/(\w+)/g).length;
  const minutes = words / wpm;

  // Add the time tag to the bookmark
  await updateTags(_id, tags, minutes);
};

const truncate = (text = '', length = 50) => {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length)}...`;
};

exports.processUnsorted = async (req, res) => {
  console.log('Processing your droplets...');

  let updated = 0;
  const drops = await getAllDrops();

  console.log(`Found ${drops.length} droplets to process...`);

  try {
    await promiseMap(drops, async (item) => {
      try {
        // Only process bookmarks without a time tag yet
        if (hasTimeTag(item.tags)) {
          return;
        }

        console.log(`Checking URL: ${truncate(item.link)}`);

        // Process youtube.com videos
        if (item.domain.includes('youtube.com')) {
          await calculateYouTube(item);
          updated += 1;
          return;
        }

        if (item.type != 'article') {
          await updateTags(item._id, item.tags, 0);
          updated += 1;
          return;
        }
        
        // Try process content of article type
        await calculateContent(item);
        updated += 1;
      } catch (error) {
        console.error(error);

        // Add a 0 minute tag so we don't repeatedly
        // try process the same droplet
        await updateTags(item._id, item.tags, 0);
      }
    }, {
      stopOnError: false,
      concurrency: 1,
    });

    console.log(`Updated ${updated} droplets.`);
  } catch (error) {
    console.error(error);
  }

  res.sendStatus(200);
};
