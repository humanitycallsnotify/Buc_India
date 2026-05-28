import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Talent from './models/Talent.js';
import { generateUniqueBucId } from './utils/generateBucId.js';

dotenv.config();

const seedBucIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const usersWithoutBucId = await User.find({ bucId: { $exists: false } });
    console.log(`Found ${usersWithoutBucId.length} users without bucId`);
    
    for (let user of usersWithoutBucId) {
      const bucId = await generateUniqueBucId();
      await User.updateOne({ _id: user._id }, { $set: { bucId } });
      console.log(`Updated user ${user.email || user.phone} with ${bucId}`);
    }

    const talentsWithoutBucId = await Talent.find({ bucId: { $exists: false } });
    console.log(`Found ${talentsWithoutBucId.length} talents without bucId`);
    
    for (let talent of talentsWithoutBucId) {
      const bucId = await generateUniqueBucId();
      await Talent.updateOne({ _id: talent._id }, { $set: { bucId } });
      console.log(`Updated talent ${talent.email} with ${bucId}`);
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedBucIds();
