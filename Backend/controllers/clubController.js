import Club from '../models/Club.js';
import ClubMembership from '../models/ClubMembership.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { slugify } from '../utils/slugify.js';

const mapSafeMember = (membership) => {
  const user = membership.userId;
  if (!user || typeof user !== 'object') return null;
  return {
    fullName: user.fullName || '',
    role: membership.role || 'member',
    city: user.city || '',
    state: user.state || '',
    profileImage: user.profileImage || '',
  };
};

const buildClubLeadership = (club) => {
  const leaders = [];
  if (club.founder?.name) {
    leaders.push({
      name: club.founder.name,
      role: club.founder.role || 'founder',
    });
  }
  if (Array.isArray(club.admins)) {
    club.admins.forEach((admin) => {
      if (admin?.name) {
        leaders.push({
          name: admin.name,
          role: admin.role || 'admin',
        });
      }
    });
  }
  return leaders;
};

// Public: list approved clubs with minimal info
export const getPublicClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'approved' }).sort({ createdAt: -1 });

    const clubIds = clubs.map((c) => c._id);
    const counts = await User.aggregate([
      { $match: { clubId: { $in: clubIds } } },
      { $group: { _id: '$clubId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const response = clubs.map((club) => {
      const leaders = buildClubLeadership(club);
      const owner = leaders.find((l) =>
        l.role?.toLowerCase().includes('founder'),
      );
      const admins = leaders.filter((l) =>
        l.role?.toLowerCase().includes('admin'),
      );
      const coAdmins = leaders.filter((l) =>
        l.role?.toLowerCase().includes('co-admin'),
      );

      return {
        id: club._id,
        slug: slugify(club.name),
        name: club.name,
        logoUrl: club.logoUrl,
        moto: club.moto,
        startedOn: club.startedOn,
        showcaseText: club.showcaseText,
        participantCount: countMap.get(String(club._id)) || 0,
        owner: owner || null,
        admins,
        coAdmins,
        founderName: club.founder?.name || '',
        founderRole: club.founder?.role || 'founder',
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Get public clubs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Public: single club with full roster (view-only)
export const getPublicClubDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const clubs = await Club.find({ status: 'approved' });
    const club = clubs.find((c) => slugify(c.name) === slug);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const users = await User.find({
      clubId: club._id,
    })
      .select('fullName city state profileImage registrationType')
      .sort({ createdAt: 1 });

    const members = users.map((user) => ({
      fullName: user.fullName || '',
      role: 'member',
      city: user.city || '',
      state: user.state || '',
      profileImage: user.profileImage || '',
    })).filter(Boolean);
    const leaders = buildClubLeadership(club);

    const owner =
      leaders.find((l) => l.role?.toLowerCase().includes('founder')) || null;
    const admins = leaders.filter((l) => {
      const r = l.role?.toLowerCase() || '';
      return r.includes('admin') && !r.includes('co-admin');
    });
    const coAdmins = leaders.filter((l) =>
      l.role?.toLowerCase().includes('co-admin'),
    );

    res.json({
      id: club._id,
      slug: slugify(club.name),
      name: club.name,
      logoUrl: club.logoUrl,
      moto: club.moto,
      startedOn: club.startedOn,
      showcaseText: club.showcaseText,
      participantCount: members.length,
      owner,
      admins,
      coAdmins,
      members,
    });
  } catch (error) {
    console.error('Get public club detail error:', error);
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

    if (!name) {
      return res.status(400).json({ message: 'Club name is required' });
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

    // Delete verified OTP record
    try {
      await Otp.deleteOne({ _id: otpRecord._id });
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
