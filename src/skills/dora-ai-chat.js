/**
 * Skill: dora-ai-chat
 * Groq-powered AI chat with multi-turn tool loop
 * Integrates with Dora's agent loop pattern
 */

const axios = require('axios');

const SYSTEM_PROMPT = `You are Dora, a helpful AI assistant.

You have access to tools:
- search: Search the web via DuckDuckGo HTML. Returns title, snippet, and link for each result.
- fetch: Fetch and extract readable content from any URL. Returns title and main text content.

When a user asks a question that needs real-time or factual information, use search first.
Then use fetch to get full content from the most relevant result(s).

Workflow:
1. If the question needs current info, use search
2. Fetch the full content of 1-2 most relevant URLs
3. Synthesize all gathered information into a clear, helpful answer

Rules:
- For news/facts: cite your sources with the link
- Use fetch on search results to get rich content before answering
- Keep replies conversational and helpful
- Return JSON: {"reply": "Your answer text", "sources": [{"title":"","link":""}]}`;

/**
 * Send a chat message to Groq with optional conversation history
 * @param {string} message - User message
 * @param {Array} [history] - Previous messages [{role, content}]
 * @param {string} [model] - Groq model (default: llama-3.1-8b-instant)
 * @returns {Promise<{success, reply, sources, error}>}
 */
async function chat(message, { history = [], model = 'llama-3.1-8b-instant', apiKey } = {}) {
  if (!message || typeof message !== 'string') {
    return { success: false, error: 'Message must be a non-empty string' };
  }

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return { success: false, error: 'GROQ_API_KEY not configured' };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10), // keep last 10 turns
    { role: 'user', content: message }
  ];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const reply = response.data.choices[0]?.message?.content || '';
    let parsed = { reply, sources: [] };
    try {
      parsed = JSON.parse(reply);
    } catch { /* not JSON */ }

    return {
      success: true,
      reply: parsed.reply || reply,
      sources: parsed.sources || [],
      model
    };

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    return { success: false, error: `Groq API error: ${msg}` };
  }
}

/**
 * Multi-turn chat loop with search/fetch tools
 * Up to 3 turns, auto-executes tools
 */
async function chatWithTools(message, tools, { history = [], apiKey } = {}) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return chat(message, { history, apiKey });
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  const toolDefs = tools.map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: { type: 'object', properties: { query: { type: 'string' } } } }
  }));

  for (let turn = 0; turn < 3; turn++) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'llama-3.1-8b-instant', messages, tools: toolDefs, tool_choice: 'auto', temperature: 0.7, max_tokens: 2048 },
        { headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 60000 }
      );

      const choice = response.data.choices[0];
      const reply = choice.message.content || '';

      if (choice.finish_reason !== 'tool_calls' && !choice.message.tool_calls) {
        // Final response
        let parsed = { reply, sources: [] };
        try { parsed = JSON.parse(reply); } catch {}
        return { success: true, reply: parsed.reply || reply, sources: parsed.sources || [] };
      }

      // Add assistant message
      messages.push({ role: 'assistant', content: reply, tool_calls: choice.message.tool_calls });

      // Execute tools
      for (const call of choice.message.tool_calls) {
        let args = {};
        try { args = JSON.parse(call.function.arguments); } catch {}
        const tool = tools.find(t => t.name === call.function.name);
        if (tool) {
          try {
            const result = await tool.execute(args.query || args.url || args);
            let resultContent = '';
            if (Array.isArray(result.results)) {
              resultContent = result.results.map(r => `${r.title}: ${r.link}`).join('\n');
            } else if (result.content) {
              resultContent = result.content;
            } else {
              resultContent = JSON.stringify(result);
            }
            messages.push({ role: 'tool', tool_call_id: call.id, content: resultContent });
          } catch (e) {
            messages.push({ role: 'tool', tool_call_id: call.id, content: `Error: ${e.message}` });
          }
        }
      }

    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: true, reply: 'Max turns reached.', sources: [] };
}

module.exports = { chat, chatWithTools };
