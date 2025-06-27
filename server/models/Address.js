import mongoose from 'mongoose';

// Define the schema for storing user addresses
const addressSchema = new mongoose.Schema({
  // Address string (required)
  address: {
    type: String,
    required: true
  },
  // Phone number associated with the address (required)
  phoneNumber: {
    type: Number,
    required: true
  },
  // Reference to the user who owns this address (required)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create and export the Address model
export const Address = mongoose.model('Address', addressSchema);