// Import necessary models and stripe library
import stripe from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

// Create Stripe checkout session and calculate total with optional coupon
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    // Validate input - products must be a non-empty array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    // Prepare line items for Stripe and calculate total amount
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Convert dollars to cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;

    // If coupon code provided, find and apply it if valid
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      // Apply discount to total amount
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    // Reward high-value purchases with a bonus coupon
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    // Respond with session ID and total
    res.status(200).json({
      id: session.id,
      totalAmount: totalAmount / 100, // Convert back to dollars
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({
      message: "Error processing checkout",
      error: error.message,
    });
  }
};

// Handle successful payment: create order and deactivate coupon
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Retrieve session info from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure payment was successful
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed yet" });
    }

    // Deactivate the coupon used (if any)
    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode,
          userId: session.metadata.userId,
        },
        {
          isActive: false,
        }
      );
    }

    const products = JSON.parse(session.metadata.products);

    // Create a new order in the database
    const newOrder = new Order({
      user: session.metadata.userId,
      products: products.map((p) => ({
        product: p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount: session.amount_total / 100,
      stripeSessionId: sessionId,
    });

    await newOrder.save();

    // Respond with success and order ID
    res.status(200).json({
      success: true,
      message:
        "Payment successful, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};

// Create a one-time Stripe coupon dynamically during checkout
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

// Create a new coupon for user after a high-value purchase
async function createNewCoupon(userId) {
  // Remove any existing coupon for user
  await Coupon.findOneAndDelete({ userId });

  // Create a new 10% coupon valid for 30 days
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}
