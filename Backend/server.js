import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import Admin from "./models/Admin.js";
import Registration from "./models/Registration.js";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import clubMembershipRoutes from "./routes/clubMembershipRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userAuthRoutes from "./routes/userAuthRoutes.js";
import talentRoutes from "./routes/talentRoutes.js";
import internationalProfileRoutes from "./routes/internationalProfileRoutes.js";
import safetyInfluencerRoutes from "./routes/safetyInfluencerRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import membershipApplicationRoutes from "./routes/membershipApplicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";

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

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes("onrender.com") ||
        origin.includes("vercel.app")
      ) {
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

    // Programmatically drop old email index on users if it is not sparse
    try {
      const usersCollection = mongoose.connection.collection("users");
      const usersIndexes = await usersCollection.indexes();
      const emailIndex = usersIndexes.find((idx) => idx.name === "email_1");
      if (emailIndex && !emailIndex.sparse) {
        console.log("Dropping old non-sparse email index on users collection...");
        await usersCollection.dropIndex("email_1");
      }
    } catch (err) {
      console.warn("Note: Could not drop email index on users:", err.message);
    }

    // Create initial admin(s) if not exists
    // Keep backward compatibility: many deployments previously used username "admin"
    const adminUsername = process.env.ADMIN_USERNAME || "bucindia";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@bucindia@2026";

    const ensureAdminUser = async (username) => {
      let admin = await Admin.findOne({ username });
      if (!admin) {
        admin = new Admin({ username, password: adminPassword });
        await admin.save();
        console.log(`Initial admin (${username}) created`);
      } else {
        admin.password = adminPassword;
        await admin.save();
        console.log(`Admin (${username}) password updated`);
      }
    };

    // Ensure both the configured admin and legacy "admin" exist
    await ensureAdminUser(adminUsername);
    if (adminUsername !== "admin") {
      await ensureAdminUser("admin");
    }
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/club-memberships", clubMembershipRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user-auth", userAuthRoutes);
app.use("/api/talent", talentRoutes);
app.use("/api/international-profiles", internationalProfileRoutes);
app.use("/api/safety-influencers", safetyInfluencerRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/membership-applications", membershipApplicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forum", forumRoutes);

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
