const axios = require('axios').default;
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const token = '';
const collection = '-1';
const wpm = 250;
const tagPrefix = 'time-';

const api = axios.create({
  baseURL: 'https://api.raindrop.io/rest/v1',
  headers: { Authorization: `Bearer ${token}` },
});

const processCollection = async (collectionId = '-1') => {
  let updated = 0;
  const drops = [];

  for (let x = 0; x < 50; x++) {
    const { data: { items } } = await api.get(`/raindrops/${collectionId}?perpage=50&page=${x}`);
    drops.push(...items);
    if (items.length === 0) {
      // end the loop early
      x = 50;
    }
  }

  await Promise.all(drops.map(async (item) => {
    try {
      const { tags, link, _id } = item;

      const hasTime = tags.find((tag) => tag.includes(tagPrefix));
      if (hasTime) {
        return;
      }

      const { data: source } = await axios.get(link);
      const doc = new JSDOM(source, { url: link });
      const { textContent } = new Readability(doc.window.document, {}).parse();
      const words = textContent.match(/(\w+)/g).length;
      const minutes = Math.round(words / wpm);

      const tag = `${tagPrefix}${minutes}mins`;
      await api.put(`/raindrop/${_id}`, {
        tags: [...tags, tag],
      });

      updated += 1;
    } catch (error) {
      console.log(error);
    }
  }));

  console.log(`Updated ${updated} raindrops`);
};

processCollection(collection);
