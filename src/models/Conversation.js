const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

conversationSchema.index({ user_id: 1, timestamp: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
