import Coupon from "../models/coupon.model.js";

// Get active coupon for the logged-in user
export const getCoupon = async (req, res) => {
	try {
		// Find a coupon that is active and belongs to the current user
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });

		// Return the coupon if found, otherwise return null
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Validate a coupon code provided by the user
export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;

		// Find coupon by code and user ID, ensure it is active
		const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

		// If not found, return error
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		// Check for expiration
		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false; // Mark as inactive
			await coupon.save();     // Save changes
			return res.status(404).json({ message: "Coupon expired" });
		}

		// Return valid coupon details
		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
