import tryCatch from '../utils/tryCatch.js';
import { Cart } from '../models/Cart.js';
import Product from '../models/Product.js';

// Add a product to the user's cart
export const addToCart = tryCatch(async (req, res) => {
  const { product: productId } = req.body;

  // Check if the product is already in the user's cart
  let cart = await Cart.findOne({ product: productId, user: req.user._id }).populate('product');

  if (cart) {
    // If product stock is less than or equal to cart quantity, return out of stock
    if (cart.product.stock <= cart.quantity) {
      return res.status(400).json({ message: 'Out of stock' });
    }
    // Increment quantity if in stock
    cart.quantity += 1;
    await cart.save();
    return res.status(200).json({ message: 'Added to cart' });
  }

  // Check if the product exists and is in stock
  const cartProduct = await Product.findById(productId);
  if (cartProduct.stock === 0) {
    return res.status(400).json({ message: 'Out of stock' });
  }

  // Create a new cart item
  cart = await Cart.create({
    quantity: 1,
    product: productId,
    user: req.user._id
  });

  res.status(200).json({ message: 'Added to cart' });
});

// Remove a product from the user's cart
export const removeFromCart = tryCatch(async (req, res) => {
  const cart = await Cart.findById(req.params.id);
  if (!cart) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  await cart.deleteOne();
  res.status(200).json({ message: 'Removed from cart' });
});

// Update the quantity of a cart item (increment or decrement)
export const updateCart = tryCatch(async (req, res) => {
  const { id } = req.body;
  const { action } = req.query;

  const cart = await Cart.findById(id).populate('product');
  if (!cart) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  // Increment quantity if in stock
  if (action === 'inc') {
    if (cart.quantity < cart.product.stock) {
      cart.quantity += 1;
      await cart.save();
      return res.status(200).json({ message: 'Cart updated' });
    }
    return res.status(400).json({ message: 'Out of stock' });
  } 
  // Decrement quantity if more than one
  else if (action === 'dec') {
    if (cart.quantity > 1) {
      cart.quantity -= 1;
      await cart.save();
      return res.status(200).json({ message: 'Cart updated' });
    }
    return res.status(400).json({ message: 'Only one item in cart' });
  }

  res.status(400).json({ message: 'Invalid action' });
});

// Fetch all cart items for the user, along with subtotal and total quantity
export const fetchCart = tryCatch(async (req, res) => {
  const carts = await Cart.find({ user: req.user._id }).populate('product');

  // Calculate total quantity of items in cart
  const totalQuantity = carts.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal price for all items in cart
  let subtotal = 0;
  carts.forEach((item) => {
    const itemSubtotal = item.product.price * item.quantity;
    subtotal += itemSubtotal;
  });

  res.status(200).json({ carts, subtotal, totalQuantity });
});