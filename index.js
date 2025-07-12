const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fullomyself.github.io"
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.post("/create-order", (req, res) => {
  const { items, total, email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid customer email is required." });
  }

  // Build PayFast data
  const data = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: process.env.RETURN_URL,
    cancel_url: process.env.CANCEL_URL,
    notify_url: process.env.NOTIFY_URL,
    amount: parseFloat(total).toFixed(2),
    item_name: items.map(i => i.name).join(", "),
    name_first: email.split("@")[0],
    email_address: email,
  };

  // Create sorted query string
const queryString = Object.keys(data)
  .sort()
  .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
  .join("&");

// Generate MD5 signature
const signature = crypto.createHash("md5").update(queryString).digest("hex");

  // Return all fields + signature + PayFast URL
  res.json({
    ...data,
    signature,
    payfast_url: "https://www.payfast.co.za/eng/process"
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`PayFast payment portal running on ${PORT}`));