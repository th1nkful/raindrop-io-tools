const youtube = require('ytdl-core');

const addTimeTag = require('./addTimeTag');

// Get time of video if its from YouTube domain
const calculateYouTube = async (raindrop) => {
  try {
    const { videoDetails } = await youtube.getBasicInfo(raindrop.link);
    const minutes = parseInt(videoDetails.lengthSeconds, 10) / 60;
    await addTimeTag(raindrop, minutes);
  } catch (error) {
    throw new Error('Error parsing YouTube video details. Are you using the latest version of `ytdl-core`?');
  }
};

module.exports = calculateYouTube;
