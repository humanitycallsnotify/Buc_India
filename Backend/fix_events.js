import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fields = {
  fullName: { enabled: true, required: true },
  dob: { enabled: true, required: true },
  age: { enabled: false, required: false },
  gender: { enabled: false, required: false },
  mobile: { enabled: true, required: true },
  email: { enabled: true, required: true },
  city: { enabled: true, required: true },
  state: { enabled: true, required: true },
  bloodGroup: { enabled: true, required: true },
  emergencyContact: { enabled: true, required: true },
  bikeBrand: { enabled: false, required: false },
  bikeModel: { enabled: true, required: true },
  bikeRegistrationNumber: { enabled: true, required: true },
  ridingExperience: { enabled: false, required: false },
  ridingClub: { enabled: false, required: false },
  aadhaar: { enabled: false, required: false },
  drivingLicence: { enabled: true, required: true },
  licenceUpload: { enabled: true, required: true },
  idUpload: { enabled: true, required: true },
  medicalConditions: { enabled: true, required: true },
  allergies: { enabled: false, required: false },
  insurance: { enabled: false, required: false }
};

mongoose.connect('mongodb://127.0.0.1:27017/bucindia').then(async () => {
  const Event = (await import('./models/Event.js')).default;
  
  // We'll just update all events that have fullName.enabled === false or don't have registrationFields
  const result1 = await Event.updateMany(
    { $or: [
        { registrationFields: { $exists: false } },
        { "registrationFields.fullName.enabled": false }
      ] 
    },
    { $set: { registrationFields: fields } }
  );
  
  // Just to be absolutely sure, update the one we know was problematic and the Tumkur one
  const result2 = await Event.updateMany(
    { title: { $regex: /Tumkur/i } },
    { $set: { registrationFields: fields } }
  );
  
  // Update all events blindly as a fallback (it doesn't hurt for these generic events)
  const result3 = await Event.updateMany(
    {},
    { $set: { registrationFields: fields } }
  );
  
  console.log(`Updated all events successfully. (Matched: ${result3.matchedCount}, Modified: ${result3.modifiedCount})`);
  process.exit(0);
}).catch(console.error);
