import {
  isFieldEnabled,
  isFieldRequired,
  getDeclarationText,
} from "../../constants/eventRegistrationConfig";

const pickProfileValue = (prevVal, profileVal) => {
  if (prevVal != null && String(prevVal).trim() !== "") return prevVal;
  return profileVal ?? prevVal;
};

export const applyProfileToForm = (profile, prev) => ({
  ...prev,
  fullName: pickProfileValue(prev.fullName, profile.fullName),
  email: pickProfileValue(prev.email, profile.email),
  phone: pickProfileValue(prev.phone, profile.phone),
  address: pickProfileValue(prev.address, profile.address),
  city: pickProfileValue(prev.city, profile.city),
  state: pickProfileValue(prev.state, profile.state),
  pincode: pickProfileValue(prev.pincode, profile.pincode),
  dateOfBirth: pickProfileValue(
    prev.dateOfBirth,
    profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
  ),
  gender: pickProfileValue(prev.gender, profile.gender),
  bloodGroup: pickProfileValue(prev.bloodGroup, profile.bloodGroup),
  bikeBrand: pickProfileValue(prev.bikeBrand, profile.bikeBrand),
  bikeModel: pickProfileValue(prev.bikeModel, profile.bikeModel),
  bikeRegistrationNumber: pickProfileValue(prev.bikeRegistrationNumber, profile.bikeRegistrationNumber),
  licenseNumber: pickProfileValue(prev.licenseNumber, profile.licenseNumber),
  ridingExperience: pickProfileValue(prev.ridingExperience, profile.ridingExperience),
  clubName: pickProfileValue(prev.clubName, profile.clubName),
  emergencyContactName: pickProfileValue(prev.emergencyContactName, profile.emergencyContactName),
  emergencyContactPhone: pickProfileValue(prev.emergencyContactPhone, profile.emergencyContactPhone),
  anyMedicalCondition: pickProfileValue(prev.anyMedicalCondition, profile.anyMedicalCondition),
  allergies: pickProfileValue(prev.allergies, profile.allergies),
  insurance: pickProfileValue(prev.insurance, profile.insurance),
  aadhaarNumber: pickProfileValue(prev.aadhaarNumber, profile.aadhaarNumber),
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
    requireField("allergies", "allergies");
    requireField("insurance", "insurance");
    if (show("emergencyContact") && require("emergencyContact")) {
      requireField("emergencyContactName");
      requireField("emergencyContactPhone");
    }
  }

  if (formData.registrationType === "rider") {
    if (regConfig.isLegacy || show("bikeModel")) {
      requireField("bikeModel", regConfig.isLegacy ? null : "bikeModel");
    }
    if (regConfig.isLegacy || show("bikeRegistrationNumber")) {
      requireField("bikeRegistrationNumber", regConfig.isLegacy ? null : "bikeRegistrationNumber");
    }
    if (regConfig.isLegacy || show("drivingLicence")) {
      requireField("licenseNumber", regConfig.isLegacy ? null : "drivingLicence");
    }
    if (regConfig.isLegacy || show("bikeBrand")) {
      requireField("bikeBrand", regConfig.isLegacy ? null : "bikeBrand");
    }
    if (regConfig.isLegacy || show("ridingExperience")) {
      requireField("ridingExperience", regConfig.isLegacy ? null : "ridingExperience");
    }
    if (regConfig.isLegacy || show("ridingClub")) {
      requireField("clubName", regConfig.isLegacy ? null : "ridingClub");
    }
    if (regConfig.isLegacy || show("aadhaar")) {
      requireField("aadhaarNumber", regConfig.isLegacy ? null : "aadhaar");
    }

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

  if ((regConfig.isLegacy || show("dob")) && formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) errors.dateOfBirth = "You must be at least 18 years old";
  }
  if ((regConfig.isLegacy || show("mobile")) && formData.phone && formData.phone.length !== 10) {
    errors.phone = "Phone number must be exactly 10 digits";
  }
  if (
    (regConfig.isLegacy || show("emergencyContact")) &&
    formData.emergencyContactPhone &&
    formData.emergencyContactPhone.length !== 10
  ) {
    errors.emergencyContactPhone = "Phone number must be exactly 10 digits";
  }
  if (
    (regConfig.isLegacy || show("emergencyContact")) &&
    formData.phone &&
    formData.emergencyContactPhone &&
    formData.phone === formData.emergencyContactPhone
  ) {
    errors.emergencyContactPhone = "Phone number and emergency contact number must be different";
  }

  if (regConfig.settings.verifyEmailOtp && !emailOtpVerified) {
    return { errors, blocked: "Please verify your email with OTP before submitting." };
  }

  return { errors, blocked: null };
};

export { getDeclarationText };
