const SSLCommerzPayment = require("sslcommerz-lts");

const Order = require("../models/orderModel");
const Product = require("../models/Product");
const Customer = require("../models/User");

const store_id = process.env.STORE_ID || "testbox";
const store_passwd = process.env.STORE_PASSWORD || "qwerty";
const is_live = false;

exports.createOrder = async (req, res) => {
  try {
    const {
      cartItems,
      customerEmail,
      shippingInfo,
      allAddresses,
      paymentMethod,
      totalAmount,
      orderNote,
    } = req.body;
    const tran_id = "ORD_" + new Date().getTime();

    const customer = await Customer.findOne({ email: customerEmail });
    let customerId = null;

    if (customer) {
      customerId = customer._id;

      if (allAddresses && allAddresses.length > 0) {
        customer.addresses = allAddresses;
        await customer.save();
      }
    }

    const orderItems = [];
    for (let item of cartItems) {
      const productDoc = await Product.findById(item._id);
      if (!productDoc) {
        return res
          .status(400)
          .json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (productDoc.stock < item.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Insufficient stock for product: ${item.name}. Available: ${productDoc.stock}`,
          });
      }

      orderItems.push({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      });
    }

    if (paymentMethod === "COD") {
      const newOrder = new Order({
        tran_id: tran_id,
        customer: customerId,
        customerEmail: customerEmail,
        items: orderItems,
        shippingInfo: shippingInfo,
        totalAmount: totalAmount,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Processing",
        orderNote: orderNote,
      });
      await newOrder.save();

      for (let item of cartItems) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: -item.quantity },
        });
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "Order placed successfully via COD",
          orderId: tran_id,
        });
    } else if (paymentMethod === "SSL") {
      const newOrder = new Order({
        tran_id: tran_id,
        customer: customerId,
        customerEmail: customerEmail,
        items: orderItems,
        shippingInfo: shippingInfo,
        totalAmount: totalAmount,
        paymentMethod: "SSL",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        orderNote: orderNote,
      });
      await newOrder.save();

      const data = {
        total_amount: totalAmount,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `http://localhost:5003/api/payment/success/${tran_id}`,
        fail_url: `http://localhost:5003/api/payment/fail/${tran_id}`,
        cancel_url: `http://localhost:5003/api/payment/cancel/${tran_id}`,
        ipn_url: `http://localhost:5003/api/payment/ipn`,
        shipping_method: "Courier",
        product_name: "Studio Products",
        product_category: "E-commerce",
        product_profile: "general",
        cus_name: shippingInfo.name || "Customer",
        cus_email: customerEmail || "test@example.com",
        cus_add1: shippingInfo.street || "Dhaka",
        cus_city: shippingInfo.district || "Dhaka",
        cus_postcode: shippingInfo.postcode || "1000",
        cus_country: "Bangladesh",
        cus_phone: shippingInfo.phone || "01700000000",
        ship_name: shippingInfo.name || "Customer",
        ship_add1: shippingInfo.street || "Dhaka",
        ship_city: shippingInfo.district || "Dhaka",
        ship_postcode: shippingInfo.postcode || "1000",
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      sslcz
        .init(data)
        .then((apiResponse) => {
          let GatewayPageURL = apiResponse.GatewayPageURL;
          if (GatewayPageURL) {
            res.status(200).json({ success: true, gatewayUrl: GatewayPageURL });
          } else {
            res
              .status(400)
              .json({
                success: false,
                message:
                  apiResponse.failedreason || "Failed to generate SSL link.",
              });
          }
        })
        .catch((error) => {
          console.error("SSLCommerz Error:", error);
          res
            .status(500)
            .json({ success: false, message: "Gateway init failed" });
        });
    }
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==========================================

// ==========================================

exports.paymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;

    const order = await Order.findOneAndUpdate(
      { tran_id: tran_id },
      { paymentStatus: "Paid", orderStatus: "Processing" },
      { new: true },
    );

    if (order && order.items) {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    res.redirect(`http://localhost:3000/success`);
  } catch (error) {
    console.error("Payment Success Error:", error);
    res.redirect(`http://localhost:3000/cancel`);
  }
};

exports.paymentFail = async (req, res) => {
  const { tran_id } = req.params;

  await Order.findOneAndUpdate(
    { tran_id: tran_id },
    { paymentStatus: "Failed", orderStatus: "Cancelled" },
  );
  res.redirect(`http://localhost:3000/cancel`);
};

exports.paymentCancel = async (req, res) => {
  const { tran_id } = req.params;

  await Order.findOneAndUpdate(
    { tran_id: tran_id },
    { paymentStatus: "Cancelled", orderStatus: "Cancelled" },
  );
  res.redirect(`http://localhost:3000/cancel`);
};
