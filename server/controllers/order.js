import tryCatch from '../utils/tryCatch.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import Product  from '../models/product.js';
import sendOrderConfirmation from '../utils/sendOrderConfirmation.js';

export const newOrderCOD = tryCatch(async (req, res) => {
  const { method, phoneNumber, address } = req.body;

  const carts = await Cart.find({ user: req.user._id }).populate({
    path: 'product',
    select: 'title price'
  });

  if (!carts.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  let subtotal = 0;
  const items = carts.map((item) => {
    const itemSubtotal = item.product.price * item.quantity;
    subtotal += itemSubtotal;
    return {
      product: item.product._id,
      name: item.product.title,
      price: item.product.price,
      quantity: item.quantity
    };
  });

  const order = await Order.create({
    items,
    method,
    user: req.user._id,
    phoneNumber,
    address,
    subtotal
  });

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    product.stock -= item.quantity;
    product.sold += item.quantity;
    await product.save();
  }

  await Cart.deleteMany({ user: req.user._id });

  await sendOrderConfirmation(
    req.user.email,
    'Order Confirmation',
    order._id,
    items,
    subtotal
  );

  res.status(201).json({ message: 'Order created successfully', order });
});

export const getAllOrders = tryCatch(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ orders });
});

export const getAllOrdersAdmin = tryCatch(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }
  const orders = await Order.find().populate('user').sort({ createdAt: -1 });
  res.status(200).json({ orders });
});

export const getMyOrder = tryCatch(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'items.product',
    select: 'title price'
  }).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.status(200).json({ order });
});

export const updateStatus = tryCatch(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  order.status = status;
  await order.save();
  res.status(200).json({ message: 'Order status updated', order });
});

export const getStats = tryCatch(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }
  const codOrders = await Order.countDocuments({ method: 'COD' });
  const onlineOrders = await Order.countDocuments({ method: 'online' });
  const products = await Product.find();
  const data = products.map((product) => ({
    name: product.title,
    sold: product.sold
  }));
  res.status(200).json({ codOrders, onlineOrders, data });
});