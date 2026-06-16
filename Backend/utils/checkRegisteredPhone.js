import User from '../models/User.js';
import Talent from '../models/Talent.js';
import Club from '../models/Club.js';

export const DUPLICATE_PHONE_MESSAGE = 'This mobile number is already registered.';

export const isPhoneRegistered = async (phone) => {
  if (!phone || !/^\d{10}$/.test(String(phone).trim())) {
    return false;
  }

  const normalized = String(phone).trim();

  const user = await User.findOne({ phone: normalized }).select('_id').lean();
  if (user) return true;

  const talent = await Talent.findOne({ phone: normalized }).select('_id').lean();
  if (talent) return true;

  const club = await Club.findOne({
    $or: [
      { 'createdBy.phone': normalized },
      { 'founder.phone': normalized },
      { 'admins.phone': normalized },
    ],
  }).select('_id').lean();

  return !!club;
};
