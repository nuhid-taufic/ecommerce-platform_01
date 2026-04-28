const fetch = require('node-fetch');

async function run() {
  console.log("Starting fetch...");
  try {
    const res = await fetch("http://localhost:5003/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: [{ _id: "661234567890123456789012", name: "JHF Soap", price: 10, quantity: 1, image: "" }],
        customerEmail: "yousuf@example.com",
        paymentMethod: "Cash on Delivery",
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch (err) {
    console.error(err);
  }
}
run();
