export const REGISTRATION_FIELD_SECTIONS = [
  {
    id: "personal",
    title: "Personal Information",
    icon: "User",
    fields: [
      { key: "fullName", label: "Full Name" },
      { key: "dob", label: "DOB" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "bloodGroup", label: "Blood Group" },
      { key: "emergencyContact", label: "Emergency Contact" },
    ],
  },
  {
    id: "bike",
    title: "Bike Information",
    icon: "Bike",
    fields: [
      { key: "bikeBrand", label: "Bike Brand" },
      { key: "bikeModel", label: "Bike Model" },
      { key: "bikeRegistrationNumber", label: "Registration Number" },
      { key: "ridingExperience", label: "Riding Experience" },
      { key: "ridingClub", label: "Riding Club" },
    ],
  },
  {
    id: "identity",
    title: "Identity",
    icon: "Shield",
    fields: [
      { key: "aadhaar", label: "Aadhaar" },
      { key: "drivingLicence", label: "Driving Licence" },
      { key: "licenceUpload", label: "Licence Upload" },
      { key: "idUpload", label: "ID Upload" },
    ],
  },
  {
    id: "medical",
    title: "Medical",
    icon: "HeartPulse",
    fields: [
      { key: "medicalConditions", label: "Medical Conditions" },
      { key: "allergies", label: "Allergies" },
      { key: "insurance", label: "Insurance" },
    ],
  },
];

export const QUESTION_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
];

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

/** Admin create form — all fields start unchecked/disabled */
export const createEmptyRegistrationFields = () => {
  const empty = {};
  Object.keys(DEFAULT_REGISTRATION_FIELDS).forEach((key) => {
    empty[key] = { enabled: false, required: false };
  });
  return empty;
};

/** Legacy events without saved config — full previous form behavior */
export const createLegacyRegistrationFields = () =>
  JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_FIELDS));

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

export const LEGACY_CLIENT_REQUIRED = {
  fullName: true,
  email: true,
  mobile: true,
  dob: true,
  city: true,
  state: true,
  bloodGroup: true,
  emergencyContact: true,
  bikeModel: true,
  bikeRegistrationNumber: true,
  drivingLicence: true,
  licenceUpload: true,
  idUpload: true,
  medicalConditions: true,
};

export const FIELD_TO_FORM = {
  fullName: "fullName",
  dob: "dateOfBirth",
  mobile: "phone",
  email: "email",
  city: "city",
  state: "state",
  bloodGroup: "bloodGroup",
  bikeBrand: "bikeBrand",
  bikeModel: "bikeModel",
  bikeRegistrationNumber: "bikeRegistrationNumber",
  ridingExperience: "ridingExperience",
  ridingClub: "clubName",
  aadhaar: "aadhaarNumber",
  drivingLicence: "licenseNumber",
  licenceUpload: "licenseImage",
  idUpload: "profileImage",
  medicalConditions: "anyMedicalCondition",
  allergies: "allergies",
  insurance: "insurance",
  gender: "gender",
};

export const createDefaultRegistrationFields = () =>
  createEmptyRegistrationFields();

export const createDefaultRegistrationSettings = () =>
  JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_SETTINGS));

export const hasCustomRegistrationConfig = (event) => {
  if (!event?.registrationFields || typeof event.registrationFields !== "object") {
    return false;
  }
  return Object.values(event.registrationFields).some((f) => f?.enabled === true);
};

export const resolveRegistrationConfig = (event) => {
  const isLegacy = !hasCustomRegistrationConfig(event);
  return {
    isLegacy,
    fields: isLegacy
      ? createLegacyRegistrationFields()
      : { ...createEmptyRegistrationFields(), ...event.registrationFields },
    settings: {
      ...createDefaultRegistrationSettings(),
      ...(event?.registrationSettings || {}),
    },
    customQuestions: Array.isArray(event?.customQuestions) ? event.customQuestions : [],
  };
};

export const isFieldEnabled = (config, key) => {
  if (config.isLegacy) return true;
  return config.fields[key]?.enabled === true;
};

export const isFieldRequired = (config, key) => {
  if (config.isLegacy) return LEGACY_CLIENT_REQUIRED[key] === true;
  const field = config.fields[key];
  return field?.enabled === true && field?.required === true;
};

export const computeAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "";
};

export const getRemainingSeats = (event) => {
  const capacity = Number(event?.registrationSettings?.capacity);
  if (!Number.isFinite(capacity) || capacity <= 0) return null;
  const count = event?.registrationCount || 0;
  return Math.max(0, capacity - count);
};

export const isRegistrationWindowOpen = (settings, event) => {
  const now = new Date();
  const openStr = settings?.registrationOpenDate;
  const closeStr = settings?.registrationCloseDate;

  if (openStr && String(openStr).trim()) {
    const part = String(openStr).split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    if (y && m && d) {
      const open = new Date(y, m - 1, d, 0, 0, 0, 0);
      if (now < open) {
        return { open: false, message: "Registration has not opened yet." };
      }
    }
  }

  if (closeStr && String(closeStr).trim()) {
    const part = String(closeStr).split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    if (y && m && d) {
      const close = new Date(y, m - 1, d, 23, 59, 59, 999);
      if (now > close) {
        return { open: false, message: "Registration is closed for this event." };
      }
    }
  }

  if (settings?.autoCloseWhenFull !== false && event) {
    const remaining = getRemainingSeats(event);
    if (remaining === 0) {
      return { open: false, message: "This event is full." };
    }
  }
  return { open: true };
};

export const getDeclarationText = (settings) => {
  const custom = settings?.declarationText?.trim();
  if (custom) return custom;
  return null;
};

export const createQuestionId = () =>
  `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
