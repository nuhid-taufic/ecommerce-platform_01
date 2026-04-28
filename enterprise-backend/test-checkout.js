const fetch = require('node-fetch');

async function test() {
  console.log("Starting fetch...");
  const start = Date.now();
  try {
    const res = await fetch("http://localhost:5003/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: [{ _id: "661234567890123456789012", name: "JHF Soap", price: 10, quantity: 1, image: "" }],
        customerEmail: "yousuf@example.com",
        shippingInfo: {
          name: "Md. Yousuf",
          phone: "01980837814",
          division: "Rajshahi",
          district: "Rajshahi",
          street: "Talaimari",
          label: "Shipping"
        },
        allAddresses: [],
        paymentMethod: "Cash on Delivery",
        totalAmount: 25,
        orderNote: "",
        transactionId: undefined
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
  console.log("Took", Date.now() - start, "ms");
}

test();
