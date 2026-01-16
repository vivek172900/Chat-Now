const express = require("express");
const { Webhook } = require("svix");
const User = require("../models/User");

const router = express.Router();

router.post("/clerk", async (req, res) => {
  console.log("Clerk webhook received");
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return res.status(400).json({ error: "Missing svix headers" });
  }

  let event;
  try {
    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);
    
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
    
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      
      case "user.updated":
        await handleUserUpdated(data);
        break;
      
      case "session.created":
        await handleSessionCreated(data);
        break;
      
      case "session.ended":
      case "session.removed":
        await handleSessionEnded(data);
        break;
      
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

async function handleUserCreated(data) {
  try {
    console.log("👤 Creating user:", data.id);
    
    const primaryEmail = data.email_addresses?.find(
      email => email.id === data.primary_email_address_id
    )?.email_address;
    
    const email = primaryEmail || data.email_addresses?.[0]?.email_address;
    
    if (!email) {
      console.error("No email found for user:", data.id);
      return;
    }
    
    const user = await User.create({
      clerkUserId: data.id,
      email: email,
      username: data.username || data.first_name || email.split('@')[0],
      profilePic: data.image_url || "",
      about: "Hey there! I am using Chat App",
      isOnline: false,
      lastSeen: new Date()
    });
    
    console.log("User created:", user.email);
  } catch (error) {
    console.error("Error creating user:", error.message);
    if (error.code === 11000) {
      console.log("User already exists");
    }
  }
}

async function handleUserUpdated(data) {
  try {
    console.log("Updating user:", data.id);
    
    const primaryEmail = data.email_addresses?.find(
      email => email.id === data.primary_email_address_id
    )?.email_address;
    
    const email = primaryEmail || data.email_addresses?.[0]?.email_address;
    
    await User.findOneAndUpdate(
      { clerkUserId: data.id },
      {
        email: email,
        username: data.username || data.first_name,
        profilePic: data.image_url || "",
      },
      { new: true }
    );
    
    console.log("User updated");
  } catch (error) {
    console.error("Error updating user:", error.message);
  }
}

async function handleSessionCreated(data) {
  try {
    console.log("🔓 User login:", data.user_id);
    
    await User.findOneAndUpdate(
      { clerkUserId: data.user_id },
      { 
        isOnline: true,
        lastSeen: new Date() 
      }
    );
  } catch (error) {
    console.error("Error updating session:", error.message);
  }
}

async function handleSessionEnded(data) {
  try {
    console.log("User logout:", data.user_id);
    
    await User.findOneAndUpdate(
      { clerkUserId: data.user_id },
      { 
        isOnline: false,
        lastSeen: new Date() 
      }
    );
  } catch (error) {
    console.error("Error updating session:", error.message);
  }
}

async function handleUserDeleted(data) {
  try {
    console.log("Deleting user:", data.id);
    
    await User.findOneAndDelete({ clerkUserId: data.id });
  } catch (error) {
    console.error("Error deleting user:", error.message);
  }
}

module.exports = router;