import Product from "../models/product.model.js";

// Get all products present in the user's cart
export const getCartProducts = async (req, res) => {
	try {
		// Extract only product IDs from user's cart
		const productIds = req.user.cartItems.map((item) => item.product);

		// Find product details for those IDs
		const products = await Product.find({ _id: { $in: productIds } });

		// Merge quantity from cart with product details
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find(
				(cartItem) => cartItem.product.toString() === product._id.toString()
			);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add a product to the cart or increase its quantity if already present
export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		// Check if product already exists in cart
		const existingItem = user.cartItems.find(
			(item) => item.product.toString() === productId
		);

		// If yes, increase quantity; else, add new item
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({ product: productId, quantity: 1 });
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Remove all items or a specific product from cart
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		// If no ID provided, clear entire cart
		if (!productId) {
			user.cartItems = [];
		} else {
			// Otherwise, remove only the specified product
			user.cartItems = user.cartItems.filter(
				(item) => item.product.toString() !== productId
			);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update quantity of a specific product in cart
export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;

		// Check if product exists in cart
		const existingItem = user.cartItems.find(
			(item) => item.product.toString() === productId
		);

		if (existingItem) {
			// If quantity is zero, remove the item
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter(
					(item) => item.product.toString() !== productId
				);
			} else {
				// Otherwise, update the quantity
				existingItem.quantity = quantity;
			}

			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found in cart" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
