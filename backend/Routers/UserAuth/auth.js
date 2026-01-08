const express = require("express");
const { Webhook } = require("svix");
const User = require("../../models/User.js");

const router = express.Router();

router.post("/clerk", async (req, res) => {
  console.log("🔔 ==========================================");
  console.log("🔔 WEBHOOK RECEIVED FROM CLERK");
  console.log("🔔 ==========================================");
  
  // Log request details
  console.log("📋 Request Method:", req.method);
  console.log("📋 Request URL:", req.originalUrl);
  console.log("📋 Request Content-Type:", req.headers["content-type"]);
  console.log("📋 Request Body Type:", typeof req.body);
  console.log("📋 Is Buffer?", Buffer.isBuffer(req.body));
  console.log("📋 Body length:", req.body?.length || "No body");
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  console.log("🔑 WEBHOOK_SECRET exists:", !!WEBHOOK_SECRET);
  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET not found in environment");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }
  console.log("🔑 WEBHOOK_SECRET first 10 chars:", WEBHOOK_SECRET.substring(0, 10) + "...");

  // Log ALL headers for debugging
  console.log("\n📋 ALL HEADERS:");
  Object.keys(req.headers).forEach(key => {
    console.log(`  ${key}: ${req.headers[key]}`);
  });

  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  console.log("\n🔍 Svix Headers:");
  console.log("  svix-id:", svix_id || "❌ MISSING");
  console.log("  svix-timestamp:", svix_timestamp || "❌ MISSING");
  console.log("  svix-signature:", svix_signature ? "✅ PRESENT (first 50 chars): " + svix_signature.substring(0, 50) + "..." : "❌ MISSING");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing Svix headers");
    console.error("   Check if Clerk is sending proper headers");
    return res.status(400).json({ error: "Missing svix headers" });
  }

  let event;
  try {
    console.log("\n📦 Processing request body...");
    
    // Debug the raw body
    let payload;
    if (Buffer.isBuffer(req.body)) {
      payload = req.body.toString();
      console.log("✅ Body is Buffer, converted to string");
    } else if (typeof req.body === "string") {
      payload = req.body;
      console.log("✅ Body is already string");
    } else if (typeof req.body === "object") {
      payload = JSON.stringify(req.body);
      console.log("✅ Body is object, stringified");
    } else {
      console.error("❌ Unknown body type:", typeof req.body);
      return res.status(400).json({ error: "Invalid body type" });
    }
    
    console.log("📦 Payload length:", payload.length);
    console.log("📦 Payload preview (first 300 chars):");
    console.log(payload.substring(0, 300));
    
    // Try to parse as JSON to see the structure
    try {
      const parsed = JSON.parse(payload);
      console.log("✅ Successfully parsed as JSON");
      console.log("📋 Event type from raw parse:", parsed.type);
      console.log("📋 User ID from raw parse:", parsed.data?.id);
    } catch (parseErr) {
      console.error("❌ Failed to parse payload as JSON:", parseErr.message);
    }
    
    console.log("\n🔐 Verifying webhook signature...");
    const wh = new Webhook(WEBHOOK_SECRET);
    
    // Log what we're passing to verify
    console.log("📤 Verification inputs:");
    console.log("  payload length:", payload.length);
    console.log("  svix-id:", svix_id);
    console.log("  svix-timestamp:", svix_timestamp);
    console.log("  svix-signature (first 50):", svix_signature.substring(0, 50) + "...");
    
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
    
    console.log("✅ Webhook verified successfully!");
    console.log("📋 Event type:", event.type);
    console.log("👤 User ID:", event.data?.id);
    
  } catch (err) {
    console.error("\n❌ WEBHOOK VERIFICATION FAILED!");
    console.error("❌ Error message:", err.message);
    console.error("❌ Error name:", err.name);
    console.error("❌ Error stack:", err.stack);
    
    // Check specific Svix errors
    if (err.message.includes("No webhook payload was provided")) {
      console.error("❌ Svix: No payload provided");
    } else if (err.message.includes("Invalid signature")) {
      console.error("❌ Svix: Invalid signature - check WEBHOOK_SECRET");
    } else if (err.message.includes("timestamp")) {
      console.error("❌ Svix: Timestamp issue - check svix-timestamp header");
    }
    
    return res.status(400).json({ 
      error: "Invalid webhook signature", 
      details: err.message 
    });
  }

  const { type, data } = event;
  console.log("\n🎯 Processing event type:", type);

  try {
    // USER CREATED
    if (type === "user.created") {
      console.log("👤 Processing user.created event");
      console.log("📋 User data:", JSON.stringify(data, null, 2));
      
      // Get primary email
      console.log("📧 Email addresses:", data.email_addresses?.length || 0);
      
      if (!data.email_addresses || data.email_addresses.length === 0) {
        console.error("❌ No email addresses found");
        return res.status(400).json({ error: "No email found" });
      }
      
      const primaryEmailObj = data.email_addresses.find(
        email => email.id === data.primary_email_address_id
      );
      
      console.log("📧 Primary email ID:", data.primary_email_address_id);
      console.log("📧 Found primary email:", !!primaryEmailObj);
      
      const email = primaryEmailObj?.email_address || 
                   data.email_addresses[0]?.email_address;
      
      console.log("📧 Using email:", email);
      
      if (!email) {
        console.error("❌ No email found for user:", data.id);
        return res.status(400).json({ error: "No email found" });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { clerkUserId: data.id },
          { email: email }
        ]
      });
      
      if (existingUser) {
        console.log("⚠️ User already exists in DB:");
        console.log("   ID:", existingUser._id);
        console.log("   Email:", existingUser.email);
        console.log("   Clerk ID:", existingUser.clerkUserId);
        
        return res.status(200).json({ 
          success: true, 
          message: "User already exists",
          userId: existingUser._id 
        });
      }
      
      console.log("💾 Creating user in database...");
      const user = await User.create({
        clerkUserId: data.id,
        email: email,
        username: data.username || data.first_name || email.split('@')[0],
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        profilePic: data.image_url || "",
        about: "Hey there! I am using Chat App",
        isOnline: false,
        lastSeen: new Date()
      });
      
      console.log("✅ USER CREATED SUCCESSFULLY!");
      console.log("   MongoDB ID:", user._id);
      console.log("   Email:", user.email);
      console.log("   Username:", user.username);
      console.log("   Created at:", user.createdAt);
    }

    // USER UPDATED
    else if (type === "user.updated") {
      console.log("🔄 Processing user.updated event");
      console.log("📋 User ID to update:", data.id);
      
      const primaryEmailObj = data.email_addresses?.find(
        email => email.id === data.primary_email_address_id
      );
      const email = primaryEmailObj?.email_address || 
                   data.email_addresses?.[0]?.email_address;
      
      console.log("📧 Update email:", email);
      
      const updatedUser = await User.findOneAndUpdate(
        { clerkUserId: data.id },
        {
          email: email,
          username: data.username || data.first_name,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          profilePic: data.image_url || "",
        },
        { new: true, upsert: false }
      );
      
      if (updatedUser) {
        console.log("✅ User updated in DB:", updatedUser.email);
      } else {
        console.log("⚠️ User not found for update:", data.id);
        // Could create the user if not found
        console.log("   Attempting to create user instead...");
        // Add user creation logic here if needed
      }
    }

    // USER LOGIN
    else if (type === "session.created") {
      console.log("🔓 Processing session.created event");
      console.log("👤 User ID:", data.user_id);
      
      const result = await User.findOneAndUpdate(
        { clerkUserId: data.user_id },
        { 
          isOnline: true,
          lastSeen: new Date() 
        },
        { new: true }
      );
      
      if (result) {
        console.log("✅ User login recorded:", result.email);
      } else {
        console.log("⚠️ User not found for login update:", data.user_id);
      }
    }

    // Handle other events
    else {
      console.log("ℹ️ Received unhandled event type:", type);
      console.log("📋 Event data:", JSON.stringify(data, null, 2));
    }

    console.log("\n✅ Sending success response...");
    res.status(200).json({ 
      success: true, 
      message: "Webhook processed",
      event: type,
      timestamp: new Date().toISOString()
    });
    console.log("✅ Response sent!");
    
  } catch (err) {
    console.error("\n❌ DATABASE ERROR!");
    console.error("❌ Error message:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error stack:", err.stack);
    
    // Check for duplicate key error
    if (err.code === 11000) {
      console.error("❌ Duplicate key error!");
      console.error("❌ Error keyValue:", err.keyValue);
      
      // Find which field caused duplicate
      if (err.keyValue?.clerkUserId) {
        console.error("❌ Duplicate clerkUserId:", err.keyValue.clerkUserId);
      }
      if (err.keyValue?.email) {
        console.error("❌ Duplicate email:", err.keyValue.email);
      }
      
      return res.status(409).json({ 
        error: "User already exists", 
        details: err.keyValue,
        message: "Duplicate entry detected"
      });
    }
    
    // MongoDB connection error
    if (err.name === 'MongoNetworkError' || err.message.includes('connect')) {
      console.error("❌ MongoDB connection error!");
      return res.status(500).json({ 
        error: "Database connection failed",
        details: "Check if MongoDB is running"
      });
    }
    
    res.status(500).json({ 
      error: "Database error", 
      details: err.message,
      code: err.code 
    });
  }
  
  console.log("🔔 ==========================================");
  console.log("🔔 WEBHOOK PROCESSING COMPLETE");
  console.log("🔔 ==========================================\n");
});

module.exports = router;