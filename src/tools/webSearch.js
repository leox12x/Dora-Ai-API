const axios = require('axios');
const cheerio = require('cheerio');

async function webSearch(query) {
  try {
    // Using DuckDuckGo HTML (free, no API key)
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.result').each((i, el) => {
      if (i >= 5) return false;
      const title = $(el).find('.result__title a').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__title a').attr('href');
      
      if (title) {
        results.push({ title, snippet, link });
      }
    });

    return {
      success: true,
      results: results.slice(0, 5),
      query
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      query
    };
  }
}

module.exports = webSearch;
