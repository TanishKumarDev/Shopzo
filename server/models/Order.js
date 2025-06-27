import mongoose from 'mongoose';

// Define the schema for storing orders
const orderSchema = new mongoose.Schema({
  // Array of items in the order
  items: [
    {
      // Quantity of the product ordered
      quantity: {
        type: Number,
        required: true
      },
      // Reference to the product
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  // Payment method (e.g., COD, online)
  method: {
    type: String,
    required: true
  },
  // Payment information (optional, e.g., transaction ID)
  paymentInfo: {
    type: String,
    required: false
  },
  // Reference to the user who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Phone number for the order
  phoneNumber: {
    type: Number,
    required: true
  },
  // Delivery address for the order
  address: {
    type: String,
    required: true
  },
  // Subtotal amount for the order
  subtotal: {
    type: Number,
    required: true
  },
  // Timestamp for when the order was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Order model
export const Order = mongoose.model('Order', orderSchema);