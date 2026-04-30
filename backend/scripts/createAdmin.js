import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@meterflow.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  await User.create({
    name: "Admin",
    email: "admin@meterflow.com",
    password: "admin123456",
    role: "admin",
    plan: "pro",
  });

  console.log("Admin created successfully");
  console.log("Email: admin@meterflow.com");
  console.log("Password: admin123456");
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
