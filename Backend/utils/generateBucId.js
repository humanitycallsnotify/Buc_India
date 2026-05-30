import User from '../models/User.js';
import Talent from '../models/Talent.js';

export const generateUniqueBucId = async () => {
  let isUnique = false;
  let newId = '';
  
  while (!isUnique) {
    // Generate a 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    newId = `BUCI${randomNum}`;
    
    // Check in both User and Talent
    const userExists = await User.findOne({ bucId: newId }).lean();
    const talentExists = await Talent.findOne({ bucId: newId }).lean();
    
    if (!userExists && !talentExists) {
      isUnique = true;
    }
  }
  
  return newId;
};
