const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

memorySchema.index({ user_id: 1, key: 1 });

const Memory = mongoose.model('Memory', memorySchema);

module.exports = Memory;
