const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    virtualCash: { type: Number, default: 1000000 }, // Default ₹10,00,000 virtual cash
    currency: { type: String, default: 'INR' },
    preferences: {
      notifications: { type: Boolean, default: true },
      aiInsights: { type: Boolean, default: true },
      theme: { type: String, default: 'dark' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
