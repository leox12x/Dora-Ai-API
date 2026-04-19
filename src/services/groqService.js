const axios = require('axios');
const config = require('../config');

class GroqService {
  constructor() {
    // Uses config.js for all settings
  }

  async chat(messages, tools = []) {
    const ai = config.getActiveAI();
    
    if (ai.name !== 'ollama' && !ai.apiKey) {
      throw new Error(`${ai.name.toUpperCase()} API key not configured. Set ${ai.name.toUpperCase()}_API_KEY in .env`);
    }

    const requestBody = {
      model: ai.model,
      messages: messages,
      temperature: ai.temperature,
      max_tokens: ai.maxTokens
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    }

    try {
      const response = await axios.post(`${ai.baseUrl}/chat/completions`, requestBody, {
        headers: {
          'Authorization': `Bearer ${ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: ai.timeout
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`${ai.name.toUpperCase()} API error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}

module.exports = new GroqService();
