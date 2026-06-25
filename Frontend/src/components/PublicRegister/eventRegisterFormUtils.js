import {
  isFieldEnabled,
  isFieldRequired,
  getDeclarationText,
} from "../../constants/eventRegistrationConfig";

export const applyProfileToForm = (profile, prev) => ({
  ...prev,
  fullName: profile.fullName || prev.fullName,
  email: profile.email || prev.email,
  phone: profile.phone || prev.phone,
  address: profile.address || prev.address,
  city: profile.city || prev.city,
  state: profile.state || prev.state,
  pincode: profile.pincode || prev.pincode,
  dateOfBirth: profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
    : prev.dateOfBirth,
  gender: profile.gender || prev.gender,
  bloodGroup: profile.bloodGroup || prev.bloodGroup,
  bikeBrand: profile.bikeBrand || prev.bikeBrand,
  bikeModel: profile.bikeModel || prev.bikeModel,
  bikeRegistrationNumber: profile.bikeRegistrationNumber || prev.bikeRegistrationNumber,
  licenseNumber: profile.licenseNumber || prev.licenseNumber,
  ridingExperience: profile.ridingExperience || prev.ridingExperience,
  clubName: profile.clubName || prev.clubName,
  emergencyContactName: profile.emergencyContactName || prev.emergencyContactName,
  emergencyContactPhone: profile.emergencyContactPhone || prev.emergencyContactPhone,
  anyMedicalCondition: profile.anyMedicalCondition || prev.anyMedicalCondition,
  allergies: profile.allergies || prev.allergies,
  insurance: profile.insurance || prev.insurance,
  aadhaarNumber: profile.aadhaarNumber || prev.aadhaarNumber,
});

export const buildRegistrationErrors = ({
  formData,
  regConfig,
  profileData,
  customAnswers,
  emailOtpVerified,
}) => {
  const errors = {};
  const show = (key) => isFieldEnabled(regConfig, key);
  const require = (key) => isFieldRequired(regConfig, key);

  const requireField = (field, configKey = null) => {
    const enabled = configKey ? show(configKey) : true;
    const required = configKey ? require(configKey) : true;
    if (enabled && required && (!formData[field] || String(formData[field]).trim() === "")) {
      errors[field] = "This field is mandatory";
    }
  };

  if (regConfig.isLegacy) {
    [
      "fullName", "email", "phone", "address", "city", "state", "pincode",
      "emergencyContactName", "emergencyContactPhone", "dateOfBirth",
      "bloodGroup", "anyMedicalCondition",
    ].forEach((f) => requireField(f));
  } else {
    requireField("fullName", "fullName");
    requireField("email", "email");
    requireField("phone", "mobile");
    requireField("dateOfBirth", "dob");
    requireField("city", "city");
    requireField("state", "state");
    requireField("bloodGroup", "bloodGroup");
    requireField("anyMedicalCondition", "medicalConditions");
    requireField("gender", "gender");
    requireField("bikeBrand", "bikeBrand");
    requireField("ridingExperience", "ridingExperience");
    requireField("clubName", "ridingClub");
    requireField("aadhaarNumber", "aadhaar");
    requireField("allergies", "allergies");
    requireField("insurance", "insurance");
    if (show("emergencyContact") && require("emergencyContact")) {
      requireField("emergencyContactName");
      requireField("emergencyContactPhone");
    }
    requireField("address");
    requireField("pincode");
  }

  if (formData.registrationType === "rider") {
    requireField("bikeModel", regConfig.isLegacy ? null : "bikeModel");
    requireField("bikeRegistrationNumber", regConfig.isLegacy ? null : "bikeRegistrationNumber");
    requireField("licenseNumber", regConfig.isLegacy ? null : "drivingLicence");

    if (show("licenceUpload") && require("licenceUpload")) {
      if (!formData.licenseImage && !profileData?.licenseImage) {
        errors.licenseImage = "Driving License image is mandatory";
      }
    } else if (regConfig.isLegacy) {
      if (!formData.licenseImage && !profileData?.licenseImage) {
        errors.licenseImage = "Driving License image is mandatory";
      }
    }

    if (formData.hasLinkedPillion) {
      if (!formData.linkedPillionName?.trim()) errors.linkedPillionName = "Pillion name is mandatory";
      if (!formData.linkedPillionMobile?.trim()) errors.linkedPillionMobile = "Pillion mobile number is mandatory";
      else if (formData.linkedPillionMobile.length !== 10) errors.linkedPillionMobile = "Pillion mobile must be exactly 10 digits";
      if (!formData.linkedPillionTShirtSize) errors.linkedPillionTShirtSize = "Pillion T-shirt size is mandatory";
    }
  }

  if (formData.registrationType === "pillion") {
    if (!formData.tShirtSize) errors.tShirtSize = "T-shirt size is mandatory";
    if (!formData.riderPhone?.trim() && !formData.riderRegistrationId?.trim()) {
      errors.riderPhone = "Please provide Rider Phone or Rider Registration ID";
    }
    if (formData.riderPhone && formData.riderPhone.length !== 10) {
      errors.riderPhone = "Rider phone must be exactly 10 digits";
    }
  }

  if (show("idUpload") && require("idUpload")) {
    if (!formData.profileImage && !profileData?.profileImage) {
      errors.profileImage = "Profile picture is mandatory";
    }
  } else if (regConfig.isLegacy) {
    if (!formData.profileImage && !profileData?.profileImage) {
      errors.profileImage = "Profile picture is mandatory";
    }
  }

  if (regConfig.settings.requireDeclaration !== false && !formData.acceptedTerms) {
    errors.acceptedTerms = "You must accept the Terms and Conditions";
  }

  regConfig.customQuestions.forEach((q) => {
    if (!q.required) return;
    const val = customAnswers[q.id];
    if (val === undefined || val === null || String(val).trim() === "") {
      errors[`custom_${q.id}`] = "This field is mandatory";
    }
  });

  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) errors.dateOfBirth = "You must be at least 18 years old";
  }
  if (formData.phone && formData.phone.length !== 10) errors.phone = "Phone number must be exactly 10 digits";
  if (formData.emergencyContactPhone && formData.emergencyContactPhone.length !== 10) {
    errors.emergencyContactPhone = "Phone number must be exactly 10 digits";
  }
  if (formData.phone && formData.emergencyContactPhone && formData.phone === formData.emergencyContactPhone) {
    errors.emergencyContactPhone = "Phone number and emergency contact number must be different";
  }

  if (regConfig.settings.verifyEmailOtp && !emailOtpVerified) {
    return { errors, blocked: "Please verify your email with OTP before submitting." };
  }

  return { errors, blocked: null };
};

export { getDeclarationText };
