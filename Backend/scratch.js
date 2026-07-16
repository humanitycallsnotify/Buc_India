import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from 'mongoose';
import SafetyInfluencer from './models/SafetyInfluencer.js';

const dummyInfluencers = [
  {
    name: "Rahul Sharma",
    designation: "Safety Head",
    organization: "BUC India",
    shortDescription: "Overseeing all safety protocols, ride formations, and rider training programs for the BUC national community.",
    fullArticle: "Rahul Sharma is a certified riding instructor with a decade of track and street experience. He leads workshops on defensive riding techniques and road survival skills.",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    displayOrder: 1,
    isActive: true
  },
  {
    name: "Anita Desai",
    designation: "Marshal & Safety Advocate",
    organization: "Women on Wheels",
    shortDescription: "Advocating for safety-conscious solo and group riding, mentoring female riders on long-distance touring.",
    fullArticle: "Anita Desai is a veteran endurance rider. She organizes community safety awareness events and guides new riders on route planning, safety gear selection, and emergency logistics.",
    profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    displayOrder: 2,
    isActive: true
  },
  {
    name: "Vikram Singh",
    designation: "Chief Marshal",
    organization: "BUC Bengaluru Chapter",
    shortDescription: "Expert in group riding dynamics, formation design, and emergency response coordination.",
    fullArticle: "Vikram has marshaled over 100 major motorcycle rides. He develops ride safety guidelines and coordinates emergency support services for BUC events.",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    displayOrder: 3,
    isActive: true
  }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await SafetyInfluencer.countDocuments();
  console.log('Current SafetyInfluencer count:', count);
  if (count === 0) {
    console.log('Seeding dummy safety influencers...');
    await SafetyInfluencer.insertMany(dummyInfluencers);
    console.log('Dummy safety influencers seeded successfully!');
  } else {
    console.log('Existing safety influencers in database:');
    const influencers = await SafetyInfluencer.find();
    console.log(influencers);
  }
  process.exit(0);
}
run().catch(console.error);
