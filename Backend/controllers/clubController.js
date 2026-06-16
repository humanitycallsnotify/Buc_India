import Club from '../models/Club.js';
import ClubMembership from '../models/ClubMembership.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { DUPLICATE_PHONE_MESSAGE, isPhoneRegistered } from '../utils/checkRegisteredPhone.js';

// Public: list approved clubs with minimal info
export const getPublicClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'approved' }).sort({ createdAt: -1 });

    // For each club, compute active participant count
    const clubIds = clubs.map((c) => c._id);
    const counts = await ClubMembership.aggregate([
      { $match: { clubId: { $in: clubIds }, status: 'active' } },
      { $group: { _id: '$clubId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const response = clubs.map((club) => ({
      id: club._id,
      name: club.name,
      logoUrl: club.logoUrl,
      moto: club.moto,
      participantCount: countMap.get(String(club._id)) || 0,
    }));

    res.json(response);
  } catch (error) {
    console.error('Get public clubs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: full list with details
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({ createdAt: 1 });
    res.json(clubs);
  } catch (error) {
    console.error('Get all clubs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Public: create collaboration request
export const createClubRequest = async (req, res) => {
  try {
    const {
      name,
      startedOn,
      moto,
      showcaseText,
      governmentIdNumber,
      founderName,
      founderRole,
      founderEmail,
      founderPhone,
      admins,
      creatorEmail,
      creatorPhone,
      otp,
    } = req.body;

    const emailToVerify = creatorEmail || founderEmail;
    if (!emailToVerify) {
      return res.status(400).json({ message: 'Creator or founder email is required' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP verification is required' });
    }

    // Verify OTP exists for this email
    const otpRecord = await Otp.findOne({
      email: emailToVerify.toLowerCase(),
      otp,
      type: "club_signup",
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please verify your email first." });
    }

    // Parse admins list (JSON string or array)
    let parsedAdmins = [];
    if (admins) {
      try {
        parsedAdmins = typeof admins === 'string' ? JSON.parse(admins) : admins;
      } catch (e) {
        console.warn('Could not parse admins payload, ignoring:', e.message);
      }
    }

    const phonesToCheck = new Set();
    if (creatorPhone) phonesToCheck.add(String(creatorPhone).trim());
    if (founderPhone) phonesToCheck.add(String(founderPhone).trim());
    if (Array.isArray(parsedAdmins)) {
      parsedAdmins.forEach((admin) => {
        if (admin?.phone) phonesToCheck.add(String(admin.phone).trim());
      });
    }
    for (const phoneNumber of phonesToCheck) {
      if (phoneNumber && await isPhoneRegistered(phoneNumber)) {
        return res.status(400).json({ message: DUPLICATE_PHONE_MESSAGE });
      }
    }

    const adminOtpRecords = [];
    if (Array.isArray(parsedAdmins)) {
      for (const admin of parsedAdmins) {
        const adminEmail = admin?.email?.trim().toLowerCase();
        if (!adminEmail) continue;
        if (!admin?.otp) {
          return res.status(400).json({
            message: `OTP verification is required for leadership email: ${admin.email}`,
          });
        }
        const adminOtpRecord = await Otp.findOne({
          email: adminEmail,
          otp: admin.otp,
          type: "club_signup",
        });
        if (!adminOtpRecord) {
          return res.status(400).json({
            message: `Invalid or expired OTP for leadership email: ${admin.email}`,
          });
        }
        adminOtpRecords.push(adminOtpRecord);
      }
    }

    if (!name) {
      return res.status(400).json({ message: 'Club name is required' });
    }

    const existing = await Club.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'A club with this name already exists' });
    }

    const clubData = {
      name: name.trim(),
      moto: moto || '',
      showcaseText: showcaseText || '',
      governmentIdNumber: governmentIdNumber || '',
      createdBy: {
        email: creatorEmail || founderEmail || '',
        phone: creatorPhone || founderPhone || '',
      },
    };

    if (startedOn) {
      clubData.startedOn = new Date(startedOn);
    }

    // Attach founder object
    if (founderName) {
      clubData.founder = {
        name: founderName,
        role: founderRole || 'founder',
        email: founderEmail || '',
        phone: founderPhone || '',
      };
    }

    // Attach additional admins list
    if (Array.isArray(parsedAdmins) && parsedAdmins.length > 0) {
      clubData.admins = parsedAdmins.map((a) => ({
        name: a.name,
        role: a.role || 'admin',
        email: a.email || '',
        phone: a.phone || '',
      }));
    }

    // Handle uploaded files: logo, firstRideImage, governmentIdImage, founderPassport
    if (req.files) {
      const { logo, firstRideImage, governmentIdImage, founderPassport } =
        req.files;

      if (logo && logo[0]) {
        clubData.logoUrl = logo[0].path;
        clubData.logoPublicId = logo[0].filename;
      }
      if (firstRideImage && firstRideImage[0]) {
        clubData.firstRideImageUrl = firstRideImage[0].path;
        clubData.firstRideImagePublicId = firstRideImage[0].filename;
      }
      if (governmentIdImage && governmentIdImage[0]) {
        clubData.governmentIdImageUrl = governmentIdImage[0].path;
        clubData.governmentIdImagePublicId = governmentIdImage[0].filename;
      }
      if (founderPassport && founderPassport[0]) {
        clubData.founderPassportUrl = founderPassport[0].path;
        clubData.founderPassportPublicId = founderPassport[0].filename;
      }
    }

    const club = await Club.create(clubData);

    // Delete verified OTP records
    try {
      await Otp.deleteOne({ _id: otpRecord._id });
      for (const adminOtpRecord of adminOtpRecords) {
        await Otp.deleteOne({ _id: adminOtpRecord._id });
      }
    } catch (otpDelError) {
      console.error("Failed to delete club OTP:", otpDelError);
    }

    // Optionally create a membership record for the founder so they get access after approval
    if (creatorEmail || creatorPhone) {
      const user = await User.findOne({
        $or: [
          creatorEmail ? { email: creatorEmail.toLowerCase() } : null,
          creatorPhone ? { phone: creatorPhone } : null,
        ].filter(Boolean),
      });

      if (user) {
        await ClubMembership.create({
          clubId: club._id,
          userId: user._id,
          role: founderRole || 'founder',
          status: 'active',
        });
      }
    }

    res.status(201).json(club);
  } catch (error) {
    console.error('Create club request error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Admin: update club status (approve / reject)
export const updateClubStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const club = await Club.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (error) {
    console.error('Update club status error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Admin: delete club
export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findByIdAndDelete(id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Clean up associated memberships
    await ClubMembership.deleteMany({ clubId: id });
    
    res.json({ message: 'Club and associated memberships deleted successfully' });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ message: error.message });
  }
};
