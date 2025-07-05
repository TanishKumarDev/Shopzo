import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

// Get all products
export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get featured products (direct from DB)
export const getFeaturedProducts = async (req, res) => {
	try {
		const featuredProducts = await Product.find({ isFeatured: true });

		if (!featuredProducts || featuredProducts.length === 0) {
			return res.status(404).json({ message: "No featured products found" });
		}

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Create product
export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category } = req.body;

		let imageUrl = "";

		if (image) {
			const uploadRes = await cloudinary.uploader.upload(image, {
				folder: "products",
			});
			imageUrl = uploadRes.secure_url;
		}

		const product = await Product.create({
			name,
			description,
			price,
			image: imageUrl,
			category,
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete product
export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
			} catch (err) {
				console.log("Cloudinary delete error:", err.message);
			}
		}

		await Product.findByIdAndDelete(req.params.id);
		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get recommended (random 4)
export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{ $sample: { size: 4 } },
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);
		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get by category
export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Toggle featured
export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		product.isFeatured = !product.isFeatured;
		const updated = await product.save();

		res.json(updated);
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }
};


