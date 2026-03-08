const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'CLIENT'],
    default: 'CLIENT'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  // Wallet & Billing State
  walletBalance: {
    type: Number,
    default: 0 // Amount in INR
  },
  availableMinutes: {
    type: Number,
    default: 0 // Free minutes from the active plan
  },
  plan: {
    type: String,
    enum: ['STARTER', 'PRO', 'ENTERPRISE'],
    default: 'STARTER'
  },
  planStartDate: {
    type: Date,
    default: Date.now
  },
  planExpiryDate: {
    type: Date
  },
  hasSelectedPlan: {
    type: Boolean,
    default: false
  },
  // Voice Agent Configs
  agents: [{
    assistantId: String,
    name: String,
    linkedNumber: String
  }],
  // Documents (RAG Knowledge Base)
  knowledgeBase: [{
    fileName: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
