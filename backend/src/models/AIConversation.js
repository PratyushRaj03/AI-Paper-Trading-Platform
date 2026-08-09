const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
      {
        sender: { type: String, enum: ['user', 'ai'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        sources: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIConversation', aiConversationSchema);
