import User from '../models/User.js';
import Talent from '../models/Talent.js';
import Club from '../models/Club.js';

export const DUPLICATE_PHONE_MESSAGE = 'This mobile number is already registered.';
export const DUPLICATE_EMAIL_MESSAGE = 'This email address is already registered.';

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

export const isEmailRegistered = async (email) => {
  if (!email || !String(email).includes('@')) {
    return false;
  }

  const normalized = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalized }).select('_id').lean();
  if (user) return true;

  const talent = await Talent.findOne({ email: normalized }).select('_id').lean();
  if (talent) return true;

  const club = await Club.findOne({
    $or: [
      { 'createdBy.email': normalized },
      { 'founder.email': normalized },
      { 'admins.email': normalized },
    ],
  }).select('_id').lean();

  return !!club;
};

export const validateClubFormContactDuplicates = ({
  creatorEmail,
  founderEmail,
  creatorPhone,
  founderPhone,
  admins = [],
}) => {
  const emails = [];
  const phones = [];

  const founderSideEmail = (creatorEmail || founderEmail)?.trim().toLowerCase();
  const founderSidePhone = (creatorPhone || founderPhone)?.trim();

  if (founderSideEmail) emails.push(founderSideEmail);
  if (founderSidePhone?.length === 10) phones.push(founderSidePhone);

  if (Array.isArray(admins)) {
    admins.forEach((admin) => {
      if (admin?.email?.trim()) emails.push(admin.email.trim().toLowerCase());
      if (admin?.phone?.trim()?.length === 10) phones.push(admin.phone.trim());
    });
  }

  if (emails.length !== new Set(emails).size) {
    return DUPLICATE_EMAIL_MESSAGE;
  }
  if (phones.length !== new Set(phones).size) {
    return DUPLICATE_PHONE_MESSAGE;
  }
  return null;
};
