const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

const Product = require("../models/Product");

const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, currency, customerEmail } = req.body;

    const shortCartData = cartItems.map((item) => ({
      id: item._id,
      name: item.name,
      q: item.quantity,
      p: item.price,
    }));

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: currency || "usd",
        product_data: { name: item.name, images: [item.image] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        cart_data: JSON.stringify(shortCartData),
        accountEmail: customerEmail,
      },
      success_url: `${process.env.STORE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STORE_URL}/cart`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.body;

    const existingOrder = await Order.findOne({ stripeSessionId: session_id });
    if (existingOrder) {
      return res
        .status(200)
        .json({ success: true, message: "Order already verified" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const cartData = JSON.parse(session.metadata.cart_data);

      const newOrder = new Order({
        stripeSessionId: session_id,
        products: cartData.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.q,
          price: item.p,
        })),
        totalAmount: session.amount_total / 100,

        customerEmail:
          session.metadata.accountEmail ||
          session.customer_details?.email ||
          "N/A",
      });
      await newOrder.save();

      for (let item of cartData) {
        await Product.findByIdAndUpdate(item.id, {
          $inc: { stock: -item.q, totalSold: item.q },
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "Order saved & stock updated!" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment };
