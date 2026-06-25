export const DEFAULT_REGISTRATION_FIELDS = {
  fullName: { enabled: true, required: true },
  dob: { enabled: true, required: true },
  age: { enabled: false, required: false },
  gender: { enabled: false, required: false },
  mobile: { enabled: true, required: true },
  email: { enabled: true, required: true },
  city: { enabled: true, required: true },
  state: { enabled: true, required: true },
  bloodGroup: { enabled: true, required: true },
  emergencyContact: { enabled: true, required: true },
  bikeBrand: { enabled: false, required: false },
  bikeModel: { enabled: true, required: true },
  bikeRegistrationNumber: { enabled: true, required: true },
  ridingExperience: { enabled: false, required: false },
  ridingClub: { enabled: false, required: false },
  aadhaar: { enabled: false, required: false },
  drivingLicence: { enabled: true, required: true },
  licenceUpload: { enabled: true, required: true },
  idUpload: { enabled: true, required: true },
  medicalConditions: { enabled: true, required: true },
  allergies: { enabled: false, required: false },
  insurance: { enabled: false, required: false },
};

export const DEFAULT_REGISTRATION_SETTINGS = {
  verifyEmailOtp: false,
  verifyMobileOtp: false,
  requireDeclaration: true,
  declarationText: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  capacity: "",
  waitingListEnabled: false,
  registrationFee: "",
  allowDuplicateRegistration: false,
  autoCloseWhenFull: true,
};

export const parseJsonBodyField = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const parseRegistrationFields = (value) => {
  const parsed = parseJsonBodyField(value);
  if (!parsed || typeof parsed !== "object") return null;
  return parsed;
};

export const parseRegistrationSettings = (value) => {
  const parsed = parseJsonBodyField(value);
  if (!parsed || typeof parsed !== "object") return null;
  const settings = { ...DEFAULT_REGISTRATION_SETTINGS, ...parsed };
  if (settings.capacity !== "" && settings.capacity != null) {
    const cap = Number(settings.capacity);
    settings.capacity = Number.isFinite(cap) && cap > 0 ? cap : "";
  }
  if (settings.registrationFee !== "" && settings.registrationFee != null) {
    const fee = Number(settings.registrationFee);
    settings.registrationFee = Number.isFinite(fee) && fee >= 0 ? fee : "";
  }
  return settings;
};

export const parseCustomQuestions = (value) => {
  const parsed = parseJsonBodyField(value);
  if (!Array.isArray(parsed)) return null;
  return parsed;
};
