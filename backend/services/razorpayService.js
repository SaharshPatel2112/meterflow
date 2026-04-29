import Razorpay from "razorpay";
import "../config/env.js";

let razorpayInstance = null;

const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  console.log("Razorpay key_id found:", !!key_id);

  if (!key_id || !key_secret) {
    console.warn("Razorpay keys missing from .env");
    return null;
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};

export default getRazorpay;
