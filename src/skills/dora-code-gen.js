/**
 * Skill: dora-code-gen
 * Multi-language code generation via Groq
 */

const axios = require('axios');

const SYSTEM_PROMPT = `You are a code generation assistant. Generate clean, production-ready code based on the user's request. Return only JSON: {"code": "your generated code", "language": "language name", "description": "brief description"}.`;

/**
 * Generate code in a specific language
 * @param {string} prompt - Description of what to build
 * @param {object} [options]
 * @param {string} [options.language] - Target language (js, python, etc.)
 * @param {string} [options.framework] - Framework (express, react, etc.)
 * @param {string} [options.apiKey] - API key override
 * @returns {Promise<{success, code, language, description, error}>}
 */
async function generateCode(prompt, { language, framework, apiKey } = {}) {
  if (!prompt || typeof prompt !== 'string') {
    return { success: false, error: 'Prompt must be a non-empty string' };
  }

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return { success: false, error: 'GROQ_API_KEY not configured' };
  }

  let fullPrompt = prompt;
  if (language) fullPrompt += `\nLanguage: ${language}`;
  if (framework) fullPrompt += `\nFramework: ${framework}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2048
      },
      {
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    const raw = response.data.choices[0]?.message?.content || '';
    let parsed = { code: raw, language: language || 'unknown', description: '' };
    try { parsed = JSON.parse(raw); } catch { parsed.code = raw; }

    return {
      success: true,
      code: parsed.code || raw,
      language: parsed.language || language || 'unknown',
      description: parsed.description || '',
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate a complete Express API endpoint
 */
async function generateAPIEndpoint(method, path, description) {
  const prompt = `Create a ${method.toUpperCase()} ${path} Express API endpoint. ${description}`;
  return generateCode(prompt, { language: 'javascript', framework: 'express' });
}

/**
 * Generate a Python script for a specific task
 */
async function generatePythonScript(task) {
  return generateCode(task, { language: 'python' });
}

module.exports = { generateCode, generateAPIEndpoint, generatePythonScript };
