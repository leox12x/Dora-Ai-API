const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

async function fetchUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: config.tools.fetchUrl.timeout
    });

    const $ = cheerio.load(response.data);
    
    // Remove scripts and styles
    $('script, style, nav, footer, header').remove();

    // Get title
    const title = $('title').text().trim();

    // Get main content
    let content = '';
    $('p, h1, h2, h3, h4, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) {
        content += text + '\n';
      }
    });

    return {
      success: true,
      title,
      content: content.substring(0, config.tools.fetchUrl.maxChars),
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

module.exports = fetchUrl;
