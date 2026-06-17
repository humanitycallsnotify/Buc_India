export const DUPLICATE_EMAIL_MESSAGE =

  "This email address is already registered for this category.";



export const DUPLICATE_PHONE_MESSAGE =

  "This mobile number is already registered for this category.";



export const WITHIN_CLUB_FORM_EMAIL_MESSAGE =

  "This email address is already used in this club registration.";



export const WITHIN_CLUB_FORM_PHONE_MESSAGE =

  "This mobile number is already used in this club registration.";



export const getDuplicateEmailMessage = (category = "User", registrationType = null) => {

  if (category === "User" && registrationType) {

    return `This email address is already registered for ${registrationType}.`;

  }

  if (category === "Talent") {

    return "This email address is already registered for Talent.";

  }

  if (category === "Club") {

    return "This email address is already registered for Club.";

  }

  return DUPLICATE_EMAIL_MESSAGE;

};



export const getDuplicatePhoneMessage = (category = "User", registrationType = null) => {

  if (category === "User" && registrationType) {

    return `This mobile number is already registered for ${registrationType}.`;

  }

  if (category === "Talent") {

    return "This mobile number is already registered for Talent.";

  }

  if (category === "Club") {

    return "This mobile number is already registered for Club.";

  }

  return DUPLICATE_PHONE_MESSAGE;

};



export const OTP_VERIFY_SUCCESS = "Email Verified Successfully.";



export const OTP_INVALID_MESSAGE = "Invalid OTP. Please try again.";



export const OTP_EXPIRED_MESSAGE = "OTP expired. Please request a new OTP.";



export const mapOtpVerifyError = (message) => {

  if (!message) return OTP_INVALID_MESSAGE;

  const lower = String(message).toLowerCase();

  if (lower.includes("expired")) return OTP_EXPIRED_MESSAGE;

  return OTP_INVALID_MESSAGE;

};


