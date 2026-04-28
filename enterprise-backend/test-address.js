const fetch = require('node-fetch');

async function test() {
  console.log("Starting address fetch...");
  const start = Date.now();
  try {
    const res = await fetch("http://localhost:5003/api/auth/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yousuf@example.com",
        address: {
          name: "Md. Yousuf",
          phone: "01980837814",
          division: "Rajshahi",
          district: "Rajshahi",
          street: "Talaimari",
          label: "Shipping"
        }
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
