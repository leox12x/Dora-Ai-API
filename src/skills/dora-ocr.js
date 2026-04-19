/**
 * Skill: dora-ocr
 * OCR text extraction from image URLs
 * Uses Tesseract.js for local processing, falls back to URL-based extraction
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract text from an image URL using multiple strategies
 * @param {string} imageUrl - URL of the image to OCR
 * @param {object} [options]
 * @param {string} [options.lang] - Language hint: 'eng', 'chi_sim', 'chi_tra', 'jpn', 'kor' (default: 'eng')
 * @returns {Promise<{success, text, confidence, method, error}>}
 */
async function extractText(imageUrl, { lang = 'eng' } = {}) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { success: false, error: 'imageUrl must be a non-empty string' };
  }

  // Strategy 1: Try to fetch page containing the image for alt text / captions
  try {
    const response = await axios.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,image/webp,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
      responseType: 'text',
      maxRedirects: 3,
    });

    // If it's an HTML page (not raw image), try to extract text
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      const $ = cheerio.load(response.data);
      $('script, style, nav, footer, header').remove();

      // Try meta tags, alt texts, captions
      const metaText = [
        $('meta[name="description"]').attr('content'),
        $('meta[property="og:description"]').attr('content'),
        $('meta[property="og:title"]').attr('content'),
        $('title').text(),
      ].filter(Boolean).join(' | ');

      const altTexts = [];
      $('img').each((i, el) => {
        const alt = $(el).attr('alt');
        if (alt) altTexts.push(alt);
      });

      const combined = [metaText, ...altTexts].filter(Boolean).join('\n');

      if (combined.length > 20) {
        return {
          success: true,
          text: combined.trim(),
          method: 'html-meta',
          note: 'Extracted from HTML meta tags and image alt texts'
        };
      }
    }
  } catch (e) {
    // Fall through to next strategy
  }

  // Strategy 2: Tesseract.js if available (local)
  try {
    const tesseract = require('tesseract.js');
    const { data } = await tesseract.recognize(imageUrl, lang, {
      logger: () => {} // silent
    });
    return {
      success: true,
      text: data.text.trim(),
      confidence: data.confidence,
      method: 'tesseract.js',
      lang
    };
  } catch (e) {
    // Tesseract not available — return friendly error
    return {
      success: false,
      error: `OCR failed: tesseract.js not available for local processing. ` +
             `Image URL: ${imageUrl}. Try installing tesseract.js or use a cloud OCR API.`,
      method: 'unavailable'
    };
  }
}

/**
 * Extract text from multiple image URLs (batch OCR)
 * @param {string[]} urls - Array of image URLs
 * @param {object} [options]
 * @param {string} [options.lang] - Language hint
 * @returns {Promise<{success, results, error}>}
 */
async function batchOCR(urls, options = {}) {
  const results = [];
  for (const url of urls.slice(0, 5)) { // max 5
    const result = await extractText(url, options);
    results.push({ url, ...result });
  }
  return {
    success: true,
    results,
    count: results.length,
    note: 'Processed up to 5 images'
  };
}

module.exports = { extractText, batchOCR };
