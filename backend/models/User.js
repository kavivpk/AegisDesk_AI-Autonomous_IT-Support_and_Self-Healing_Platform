const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'it_engineer', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'],
    default: 'Other'
  },
  firebaseUid: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);