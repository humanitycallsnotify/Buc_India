import User from "../models/User.js";

export const getPublicMembers = async (req, res) => {
  try {
    const users = await User.find({ fullName: { $nin: [null, ""] } })
      .populate("clubId", "name")
      .sort({ createdAt: -1 })
      .select(
        "fullName city state bikeModel profileImage registrationType clubId bucId",
      );

    const members = users.map((user) => ({
      fullName: user.fullName || "",
      bucId: user.bucId || "PENDING",
      city: user.city || "",
      state: user.state || "",
      bikeModel: user.bikeModel || "",
      profileImage: user.profileImage || "",
      registrationType: user.registrationType || "",
      clubName:
        user.clubId && typeof user.clubId === "object"
          ? user.clubId.name || ""
          : "",
    }));

    res.json(members);
  } catch (error) {
    console.error("Get public members error:", error);
    res.status(500).json({ message: error.message });
  }
};
