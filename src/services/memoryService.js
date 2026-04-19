const Memory = require('../models/Memory');
const Conversation = require('../models/Conversation');

class MemoryService {
  async save(userId, key, value) {
    const memory = new Memory({ user_id: userId, key, value });
    await memory.save();
    return memory;
  }

  async get(userId, key = null) {
    const query = { user_id: userId };
    if (key) query.key = key;
    return Memory.find(query).sort({ timestamp: -1 }).limit(50);
  }

  async getRecent(userId, limit = 10) {
    return Memory.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getContext(userId, query) {
    return Memory.find({
      user_id: userId,
      $or: [
        { key: { $regex: query, $options: 'i' } },
        { value: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);
  }

  async saveConversation(userId, role, content) {
    const conv = new Conversation({ user_id: userId, role, content });
    await conv.save();
    return conv;
  }

  async getConversationHistory(userId, limit = 20) {
    return Conversation.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .then(docs => docs.reverse());
  }

  async clearMemory(userId, key = null) {
    const query = { user_id: userId };
    if (key) query.key = key;
    return Memory.deleteMany(query);
  }
}

module.exports = new MemoryService();
