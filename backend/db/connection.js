const mongoose = require("mongoose");
require('dotenv').config();

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

mongoose
    .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("✅ Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("❌ Unable to connect to MongoDB:", error.message);
        process.exit(1);
    });

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
});

module.exports = mongoose;
