import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({ clubId: mongoose.Schema.Types.ObjectId, fullName: String }));
  const ClubMem = mongoose.model('ClubMembership', new mongoose.Schema({ clubId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId, status: String }));
  console.log('Users with clubId:', await User.countDocuments({ clubId: { $ne: null } }));
  console.log('ClubMemberships:', await ClubMem.countDocuments());
  console.log('ClubMemberships active:', await ClubMem.countDocuments({ status: 'active' }));
  process.exit(0);
}
run().catch(console.error);
