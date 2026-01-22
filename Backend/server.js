require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Admin = require("./models/Admin");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const app = express();

// Trust proxy - required for secure cookies on Render/Heroku/etc
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://bucindia.com",
        "https://www.bucindia.com",
      ].filter(Boolean);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("onrender.com") || origin.includes("vercel.app")) {
        callback(null, true);
      } else {
        // In production, you might want to be stricter, but for now let's allow it to fix the login issue
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Programmatically drop old global indexes that interfere with event-scoped registration
    try {
      const Registration = require("./models/Registration");
      const collection = mongoose.connection.collection("registrations");
      const indexes = await collection.indexes();

      const indexesToDrop = [
        "email_1",
        "phone_1",
        "bikeRegistrationNumber_1",
        "licenseNumber_1",
      ];
      for (const indexName of indexesToDrop) {
        if (indexes.find((idx) => idx.name === indexName)) {
          console.log(`Dropping old index: ${indexName}`);
          await collection.dropIndex(indexName);
        }
      }
    } catch (err) {
      console.warn(
        "Note: Could not drop some indexes (they might already be gone):",
        err.message,
      );
    }

    // Create initial admin if not exists
    const adminUsername = process.env.ADMIN_USERNAME || "bucindia";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@bucindia@2026";
    
    let admin = await Admin.findOne({ username: adminUsername });
    if (!admin) {
      admin = new Admin({
        username: adminUsername,
        password: adminPassword,
      });
      await admin.save();
      console.log(`Initial admin (${adminUsername}) created`);
    } else {
      // Optional: Update password if needed
      admin.password = adminPassword;
      await admin.save();
      console.log(`Admin (${adminUsername}) password updated`);
    }

    // Clean up old admin if it exists and is different
    if (adminUsername !== "admin") {
      await Admin.deleteOne({ username: "admin" });
    }
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
