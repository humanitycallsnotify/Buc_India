export const DUPLICATE_EMAIL_MESSAGE =
  "This email address is already registered with BUC India. Please use a different email address.";

export const DUPLICATE_PHONE_MESSAGE =
  "This mobile number is already registered with BUC India. Please use a different mobile number.";

export const OTP_VERIFY_SUCCESS = "Email Verified Successfully.";

export const OTP_INVALID_MESSAGE = "Invalid OTP. Please try again.";

export const OTP_EXPIRED_MESSAGE = "OTP expired. Please request a new OTP.";

export const mapOtpVerifyError = (message) => {
  if (!message) return OTP_INVALID_MESSAGE;
  const lower = String(message).toLowerCase();
  if (lower.includes("expired")) return OTP_EXPIRED_MESSAGE;
  return OTP_INVALID_MESSAGE;
};
