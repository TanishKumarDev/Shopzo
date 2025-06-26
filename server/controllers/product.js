import Product from '../models/product.js';
import tryCatch from '../utils/tryCatch.js';
import bufferGenerator from '../utils/bufferGenerator.js';
import cloudinary from '../utils/cloudinary.js';


// Create a new product (Admin only)
export const createProduct = tryCatch(async (req, res) => {
  // Check admin access
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }

  const { title, about, category, price, stock } = req.body;

  // Check if images are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files to upload' });
  }

  // Upload all files to Cloudinary
  const imageUploadPromises = req.files.map(async (file) => {
    const fileBuffer = bufferGenerator(file);
    const result = await cloudinary.uploader.upload(fileBuffer.content);
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  });

  const uploadedImages = await Promise.all(imageUploadPromises);

  // Create product with uploaded images
  const product = await Product.create({
    title,
    about,
    category,
    price,
    stock,
    images: uploadedImages
  });

  res.status(201).json({ product });
});

// Get all products with filters & pagination
export const getAllProducts = tryCatch(async (req, res) => {
  const { search, category, page = 1, sortByPrice } = req.query;
  const limit = 8;
  const filter = {};

  // Apply search filter
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Sorting logic
  let sortOption = { createdAt: -1 };
  if (sortByPrice === 'lowToHigh') {
    sortOption = { price: 1 };
  } else if (sortByPrice === 'highToLow') {
    sortOption = { price: -1 };
  }

  // Get filtered and paginated products
  const products = await Product.find(filter)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sortOption);

  const countProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(countProducts / limit);
  const distinctCategories = await Product.distinct('category');
  const newProducts = await Product.find().sort({ createdAt: -1 }).limit(4);

  res.status(200).json({
    products,
    categories: distinctCategories,
    totalPages,
    newProducts
  });
});

// Get a single product


export const getSingleProduct = tryCatch(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(req.body)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
// Get related products
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id }
  }).limit(4);

  res.status(200).json({ product, relatedProducts });
})

// Update a product
export const updateProduct = tryCatch(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }

  // Check if product exists
  const { title, about, category, price, stock } = req.body;
  const updateFields = {};

  // Update fields
  if (title) updateFields.title = title;
  if (about) updateFields.about = about;
  if (category) updateFields.category = category;
  if (price) updateFields.price = price;
  if (stock) updateFields.stock = stock;

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  );
  // Check if product was updated
  if (!updatedProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }
  // Send response
  res.status(200).json({ message: 'Product updated', product: updatedProduct });
});

// Update product images
export const updateProductImages = tryCatch(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You are not admin' });
  }
// Check if images are uploaded
  const id = req.params.id;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files to upload' });
  }
// Delete old images
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
// Delete old images
  const oldImages = product.images || [];
  for (const img of oldImages) {
    await cloudinary.uploader.destroy(img.public_id);
  }
// Upload new images
  const imageUploadPromises = req.files.map(async (file) => {
    const fileBuffer = bufferGenerator(file);
    const result = await cloudinary.uploader.upload(fileBuffer.content);
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  });
// Update product
  const uploadedImages = await Promise.all(imageUploadPromises);
  product.images = uploadedImages;
  await product.save();
// Send response
  res.status(200).json({ message: 'Image updated', product });
});