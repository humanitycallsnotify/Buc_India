import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bike,
  Edit2,
  Save,
  X,
  Shield,
  ShieldCheck,
  FileText,
  Loader2,
  Camera,
  AlertCircle,
  LogOut,
  Clock,
  ChevronRight,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { profileService, registrationService } from "../../services/api";
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dateOfBirth: "",
    bloodGroup: "",
    bikeModel: "",
    bikeRegistrationNumber: "",
    licenseNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    profileImage: "",
    licenseImage: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    websiteUrl: "",
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Try to get email/phone from sessionStorage (set during registration)
      const userEmail = sessionStorage.getItem("userEmail");
      const userPhone = sessionStorage.getItem("userPhone");
      
      if (userEmail || userPhone) {
        const profile = await profileService.get(userEmail, userPhone);
        setProfileData(profile);
        setOriginalData(profile);
        if (profile.profileImage) {
          setProfileImagePreview(profile.profileImage);
        }
        if (profile.licenseImage) {
          setLicenseImagePreview(profile.licenseImage);
        }
        loadRegisteredEvents(userEmail, userPhone);
      } else {
        // If no user data, show empty form
        toast.info("Please complete your profile information");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // If profile doesn't exist, that's okay - user can create one
      if (error.response?.status !== 404) {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRegisteredEvents = async (email, phone) => {
    setLoadingEvents(true);
    try {
      const registrations = await registrationService.getByUser(email, phone);
      setRegisteredEvents(registrations);
    } catch (error) {
      console.error("Error loading registered events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "emergencyContactPhone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setProfileData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicenseImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Get email/phone from sessionStorage or form
      const userEmail = sessionStorage.getItem("userEmail") || profileData.email;
      const userPhone = sessionStorage.getItem("userPhone") || profileData.phone;

      if (!userEmail || !userPhone) {
        toast.error("Email and phone are required");
        setSaving(false);
        return;
      }

      if (profileData.phone && profileData.phone.length !== 10) {
        toast.error("Mobile number must be exactly 10 digits");
        setSaving(false);
        return;
      }

      if (profileData.emergencyContactPhone && profileData.emergencyContactPhone.length !== 10) {
        toast.error("Emergency contact phone must be exactly 10 digits");
        setSaving(false);
        return;
      }

      formData.append("email", userEmail);
      formData.append("phone", userPhone);
      formData.append("fullName", profileData.fullName || "");
      formData.append("gender", profileData.gender || "");
      formData.append("dateOfBirth", profileData.dateOfBirth || "");
      formData.append("bloodGroup", profileData.bloodGroup || "");
      formData.append("address", profileData.address || "");
      formData.append("city", profileData.city || "");
      formData.append("state", profileData.state || "");
      formData.append("pincode", profileData.pincode || "");
      formData.append("bikeModel", profileData.bikeModel || "");
      formData.append("bikeRegistrationNumber", profileData.bikeRegistrationNumber || "");
      formData.append("licenseNumber", profileData.licenseNumber || "");
      formData.append("emergencyContactName", profileData.emergencyContactName || "");
      formData.append("emergencyContactPhone", profileData.emergencyContactPhone || "");
      formData.append("facebookUrl", profileData.facebookUrl || "");
      formData.append("instagramUrl", profileData.instagramUrl || "");
      formData.append("twitterUrl", profileData.twitterUrl || "");
      formData.append("youtubeUrl", profileData.youtubeUrl || "");
      formData.append("websiteUrl", profileData.websiteUrl || "");

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      if (licenseImage) {
        formData.append("licenseImage", licenseImage);
      }

      const updatedProfile = await profileService.createOrUpdate(formData);
      setProfileData(updatedProfile);
      setOriginalData(updatedProfile);
      setIsEditing(false);
      setProfileImage(null);
      setLicenseImage(null);
      
      // Update sessionStorage
      if (updatedProfile.email) sessionStorage.setItem("userEmail", updatedProfile.email);
      if (updatedProfile.phone) sessionStorage.setItem("userPhone", updatedProfile.phone);
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to save profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setProfileImage(null);
    setLicenseImage(null);
    setProfileImagePreview(originalData.profileImage || null);
    setLicenseImagePreview(originalData.licenseImage || null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userLoggedIn");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userPhone");
    window.dispatchEvent(new Event("user-login-change"));
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Privacy Assurance Banner */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-green-400 font-semibold">Privacy Assurance:</span> Your information is protected by industry-standard encryption. We maintain strict confidentiality and will never share your personal data with third parties without your explicit consent.
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl mb-6">
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="text-3xl md:text-4xl font-bold text-white">
                          {getInitials(profileData.fullName)}
                        </span>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 transform hover:scale-110">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl md:text-3xl font-semibold text-white mb-1">
                    {profileData.fullName || "Complete Your Profile"}
                  </h1>
                  <p className="text-gray-300 text-sm mb-3">
                    {profileData.email || "Add your information to get started"}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs">
                    {profileData.phone && (
                      <div className="flex items-center space-x-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
                        <Phone className="w-3 h-3 text-blue-500" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.city && (
                      <div className="flex items-center space-x-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span>{profileData.city}, {profileData.state}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium border border-indigo-600/30 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Full Name"
                    icon={User}
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="Enter your full name"
                  />
                  <ProfileField
                    label="Gender"
                    icon={User}
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={["male", "female", "prefernottosay"]}
                  />
                  <ProfileField
                    label="Email Address"
                    icon={Mail}
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="email"
                    placeholder="Enter your email"
                    readOnly={true}
                  />
                  <ProfileField
                    label="Mobile Number"
                    icon={Phone}
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="tel"
                    placeholder="Enter your mobile number"
                  />
                  <ProfileField
                    label="Date of Birth"
                    icon={Calendar}
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="date"
                  />
                  <ProfileField
                    label="Blood Group"
                    icon={Shield}
                    name="bloodGroup"
                    value={profileData.bloodGroup}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="select"
                    options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                  />
                </div>
              </div>

              {/* Address Information Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Address Information</h2>
                </div>
                <div className="space-y-6">
                  <ProfileField
                    label="Address"
                    icon={MapPin}
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="textarea"
                    placeholder="Enter your address"
                    fullWidth
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProfileField
                      label="City"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      isEditing={isEditing}
                      placeholder="Enter your city"
                    />
                    <ProfileField
                      label="State"
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      isEditing={isEditing}
                      placeholder="Enter your state"
                    />
                    <ProfileField
                      label="Pincode"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleInputChange}
                      isEditing={isEditing}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Bike Information Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Bike Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Bike Model"
                    icon={Bike}
                    name="bikeModel"
                    value={profileData.bikeModel}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="Enter your bike model"
                  />
                  <ProfileField
                    label="Registration Number"
                    icon={FileText}
                    name="bikeRegistrationNumber"
                    value={profileData.bikeRegistrationNumber}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="Enter bike registration number"
                  />
                  <ProfileField
                    label="License Number"
                    icon={FileText}
                    name="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="Enter license number"
                    fullWidth
                  />
                  <div className="md:col-span-2">
                    <label className="flex items-center text-gray-300 mb-2 text-sm font-medium">
                      <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                      Driving License Image
                    </label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Camera className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLicenseImageChange}
                            />
                          </label>
                        </div>
                        {licenseImagePreview && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-700">
                            <img
                              src={licenseImagePreview}
                              alt="License Preview"
                              className="w-full h-full object-contain bg-black"
                            />
                            <button
                              onClick={() => {
                                setLicenseImage(null);
                                setLicenseImagePreview(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        {licenseImagePreview ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={licenseImagePreview}
                              alt="Driving License"
                              className="max-h-48 rounded-lg object-contain bg-black mb-3"
                            />
                            <a 
                              href={licenseImagePreview} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View Full Image
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No license image uploaded</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Contact Name"
                    icon={User}
                    name="emergencyContactName"
                    value={profileData.emergencyContactName}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="Enter emergency contact name"
                  />
                  <ProfileField
                    label="Contact Phone"
                    icon={Phone}
                    name="emergencyContactPhone"
                    value={profileData.emergencyContactPhone}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    type="tel"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>

              {/* Social Media Links Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Social Presence</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Add your social media handles so fellow BUC riders can discover your rides and stories.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Facebook"
                    icon={Mail}
                    name="facebookUrl"
                    value={profileData.facebookUrl}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="https://facebook.com/your-profile"
                  />
                  <ProfileField
                    label="Instagram"
                    icon={ImageIcon}
                    name="instagramUrl"
                    value={profileData.instagramUrl}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="https://instagram.com/your-handle"
                  />
                  <ProfileField
                    label="Twitter / X"
                    icon={Mail}
                    name="twitterUrl"
                    value={profileData.twitterUrl}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="https://x.com/your-handle"
                  />
                  <ProfileField
                    label="YouTube"
                    icon={ImageIcon}
                    name="youtubeUrl"
                    value={profileData.youtubeUrl}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="https://youtube.com/@your-channel"
                  />
                  <ProfileField
                    label="Personal Website"
                    icon={MapPin}
                    name="websiteUrl"
                    value={profileData.websiteUrl}
                    onChange={handleInputChange}
                    isEditing={isEditing}
                    placeholder="https://your-website.com"
                    fullWidth
                  />
                </div>
              </div>

              {/* Registered Events Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">My Registered Events</h2>
                </div>
                
                {loadingEvents ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : registeredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {registeredEvents.map((reg) => (
                      <div key={reg._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Bike className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {reg.eventId === 'community' ? 'Community Membership' : (reg.eventId?.title || 'Event Registration')}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <div className="flex items-center text-gray-400 text-sm">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                                <span>{reg.eventId?.eventDate ? new Date(reg.eventId.eventDate).toLocaleDateString() : new Date(reg.registeredAt).toLocaleDateString()}</span>
                              </div>
                              {reg.bikeModel && (
                                <div className="flex items-center text-gray-400 text-sm">
                                  <Bike className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                                  <span>{reg.bikeModel}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-3">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                            Confirmed
                          </span>
                          <button 
                            onClick={() => navigate("/events")}
                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No events registered yet.</p>
                    <button 
                      onClick={() => navigate("/events")}
                      className="mt-4 text-blue-500 hover:text-blue-400 font-semibold"
                    >
                      Explore Events
                    </button>
                  </div>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

// Reusable Profile Field Component
const ProfileField = ({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  isEditing,
  type = "text",
  placeholder,
  options,
  fullWidth = false,
  readOnly = false,
}) => {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="flex items-center text-gray-300 mb-2 text-sm font-medium">
        {Icon && <Icon className="w-4 h-4 mr-2 text-blue-500" />}
        {label}
      </label>
      {isEditing && !readOnly ? (
        type === "textarea" ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            rows="3"
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={placeholder}
          />
        ) : type === "select" ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Select {label}</option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "male" ? "Male" : opt === "female" ? "Female" : opt === "prefernottosay" ? "Prefer not to say" : opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white min-h-[44px] flex items-center">
          {name === "gender" && value ? (
            value === "male" ? "Male" : value === "female" ? "Female" : value === "prefernottosay" ? "Prefer not to say" : value
          ) : (
            value || <span className="text-gray-500">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
