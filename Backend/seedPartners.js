import mongoose from "mongoose";
import dotenv from "dotenv";
import Partner from "./models/Partner.js";

dotenv.config();

const urls = [
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1770398948/buc_india_profiles/muxacfy9s3uavj5wy3jd.png",
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1770892561/humanity_calls_volunteers/fffxcauivb614u6ced11.png",
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1770900898/humanity_calls_volunteers/b5a0tx0aoctc29re7e0k.png",
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1770903904/humanity_calls_volunteers/crh2qpz5zufwq1ytj1tk.jpg",
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1770904590/humanity_calls_volunteers/wgmn3povuxtb9buvxhr3.png",
  "https://res.cloudinary.com/dcwdpqied/image/upload/v1771949916/humanity_calls_volunteers/debphzys0qnbs8rhvhf1.jpg"
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    for (let i = 0; i < urls.length; i++) {
      const partner = new Partner({
        name: `Partner ${i + 1}`,
        imageUrl: urls[i],
        order: i
      });
      await partner.save();
      console.log(`Saved partner ${i + 1}`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
