const groqService = require('./groqService');
const memoryService = require('./memoryService');
const toolRegistry = require('./toolRegistry');

const SYSTEM_PROMPT = `You are Dora, a helpful AI assistant.

You have access to tools:
- webSearch: Search the web for current information
- fetchUrl: Fetch and extract content from a URL
- generateImage: Generate an image from a text prompt

Return your response as JSON with this format:
{
  "reply": "Your response text",
  "actions": [{"type": "tool_name", "input": {"query": "..."}}],
  "memory_update": [{"key": "key_name", "value": "value_to_save"}]
}

Rules:
- Use tools when you need real-time info or to complete a task
- Save important user preferences and facts in memory_update
- Keep replies conversational and helpful
- If you use a tool, explain briefly in your reply`;

class AgentService {
  async chat(userId, message) {
    try {
      // 1. Fetch relevant memory
      const memories = await memoryService.getRecent(userId, 5);
      const memoryContext = memories.length > 0 
        ? `\nRecent memory:\n${memories.map(m => `${m.key}: ${m.value}`).join('\n')}`
        : '';

      // 2. Fetch conversation history
      const history = await memoryService.getConversationHistory(userId, 10);
      const historyMessages = history.map(h => ({
        role: h.role,
        content: h.content
      }));

      // 3. Build messages
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + memoryContext },
        ...historyMessages,
        { role: 'user', content: message }
      ];

      // 4. Get tool definitions
      const tools = toolRegistry.getDefinitions();

      // 5. Call Groq
      const response = await groqService.chat(messages, tools);

      // 6. Parse response
      const choice = response.choices[0];
      const reply = choice.message.content || 'I apologize, I could not generate a response.';

      // Check if tool calls
      let actions = [];
      let memoryUpdates = [];

      if (choice.finish_reason === 'tool_calls' || choice.message.tool_calls) {
        const toolCalls = choice.message.tool_calls || [];
        for (const call of toolCalls) {
          const toolName = call.function.name;
          const args = JSON.parse(call.function.arguments);
          
          try {
            const result = await toolRegistry.execute(toolName, args);
            actions.push({ type: toolName, result });
          } catch (err) {
            actions.push({ type: toolName, error: err.message });
          }
        }
      }

      // Try to parse structured response
      let parsedReply = reply;
      try {
        const parsed = JSON.parse(reply);
        if (parsed.reply) parsedReply = parsed.reply;
        if (parsed.memory_update) memoryUpdates = parsed.memory_update;
      } catch {
        // Not JSON, use as-is
      }

      // 7. Save conversation
      await memoryService.saveConversation(userId, 'user', message);
      await memoryService.saveConversation(userId, 'assistant', parsedReply);

      // 8. Save memory updates
      for (const update of memoryUpdates) {
        await memoryService.save(userId, update.key, update.value);
      }

      return {
        reply: parsedReply,
        actions,
        memory_update: memoryUpdates
      };
    } catch (error) {
      console.error('Agent error:', error);
      return {
        reply: `Error: ${error.message}`,
        actions: [],
        memory_update: []
      };
    }
  }

  // Direct tool execution
  async executeTool(userId, toolName, params) {
    const result = await toolRegistry.execute(toolName, params);
    await memoryService.save(userId, `tool_${toolName}`, JSON.stringify(params));
    return result;
  }
}

module.exports = new AgentService();
