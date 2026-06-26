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
  requireDeclaration: false,
  declarationText: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  capacity: "",
  waitingListEnabled: false,
  registrationFee: "",
  allowDuplicateRegistration: false,
  autoCloseWhenFull: false,
};

export const FIELD_LABELS = {
  fullName: "Full name",
  dob: "Date of birth",
  gender: "Gender",
  mobile: "Phone number",
  email: "Email",
  city: "City",
  state: "State",
  bloodGroup: "Blood group",
  emergencyContact: "Emergency contact",
  bikeBrand: "Bike brand",
  bikeModel: "Bike model",
  bikeRegistrationNumber: "Bike registration number",
  ridingExperience: "Riding experience",
  ridingClub: "Riding club",
  aadhaar: "Aadhaar number",
  drivingLicence: "Driving licence number",
  licenceUpload: "Driving licence image",
  idUpload: "Profile picture",
  medicalConditions: "Medical conditions",
  allergies: "Allergies",
  insurance: "Insurance",
};

/** Maps admin config keys to request body field names */
export const CONFIG_TO_BODY = {
  fullName: "fullName",
  dob: "dateOfBirth",
  gender: "gender",
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
  medicalConditions: "anyMedicalCondition",
  allergies: "allergies",
  insurance: "insurance",
};

export const createEmptyRegistrationFields = () => {
  const empty = {};
  Object.keys(DEFAULT_REGISTRATION_FIELDS).forEach((key) => {
    empty[key] = { enabled: false, required: false };
  });
  return empty;
};

export const createLegacyRegistrationFields = () =>
  JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_FIELDS));

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

/** Collapse duplicate multipart values (e.g. ["Male","Male"]) to a single string */
export const normalizeScalarField = (value) => {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) {
    const items = value
      .map((v) => (v === undefined || v === null ? "" : String(v).trim()))
      .filter(Boolean);
    const unique = [...new Set(items)];
    return unique[0] ?? "";
  }
  if (typeof value === "string") return value.trim();
  return value;
};

export const REGISTRATION_SCALAR_BODY_FIELDS = [
  "fullName",
  "email",
  "phone",
  "gender",
  "bikeBrand",
  "bikeModel",
  "bikeRegistrationNumber",
  "ridingExperience",
  "clubName",
  "aadhaarNumber",
  "licenseNumber",
  "allergies",
  "insurance",
  "bloodGroup",
  "anyMedicalCondition",
  "city",
  "state",
  "pincode",
  "address",
  "emergencyContactName",
  "emergencyContactPhone",
  "linkedPillionName",
  "linkedPillionMobile",
  "linkedPillionTShirtSize",
  "riderPhone",
  "riderRegistrationId",
  "tShirtSize",
  "dateOfBirth",
  "clubNameCustom",
  "collegeName",
  "department",
  "year",
  "interestReason",
];

export const normalizeRegistrationBody = (body) => {
  if (!body || typeof body !== "object") return body;
  const out = { ...body };
  REGISTRATION_SCALAR_BODY_FIELDS.forEach((field) => {
    if (field in out) {
      out[field] = normalizeScalarField(out[field]);
    }
  });
  if (out.email && typeof out.email === "string") {
    out.email = out.email.toLowerCase();
  }
  return out;
};

export const sanitizeRegistrationDocument = (doc) => {
  REGISTRATION_SCALAR_BODY_FIELDS.forEach((field) => {
    if (doc[field] !== undefined && doc[field] !== null) {
      doc[field] = normalizeScalarField(doc[field]);
    }
  });
  return doc;
};

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
      ...DEFAULT_REGISTRATION_SETTINGS,
      ...(event?.registrationSettings || {}),
    },
    customQuestions: Array.isArray(event?.customQuestions) ? event.customQuestions : [],
  };
};

export const isFieldEnabled = (config, key) => {
  if (!config || config.isLegacy) return true;
  return config.fields[key]?.enabled === true;
};

export const isFieldRequired = (config, key) => {
  if (!config || config.isLegacy) {
    return DEFAULT_REGISTRATION_FIELDS[key]?.required === true;
  }
  const field = config.fields[key];
  return field?.enabled === true && field?.required === true;
};

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requireBodyField = (body, field, label, errors) => {
  const value = body[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    errors.push(`${label} is required`);
  }
};

const parseCustomAnswers = (body) => {
  const raw = body.customAnswers;
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

/**
 * Validates event registration payload against admin Registration Configuration.
 * Used when event has custom config (isLegacy === false).
 */
export const validateEventRegistrationPayload = (
  body,
  config,
  files = null,
  existingUser = null,
) => {
  const errors = [];
  if (!config || config.isLegacy) return errors;

  const show = (key) => isFieldEnabled(config, key);
  const require = (key) => isFieldRequired(config, key);

  Object.entries(CONFIG_TO_BODY).forEach(([configKey, bodyKey]) => {
    if (show(configKey) && require(configKey)) {
      requireBodyField(body, bodyKey, FIELD_LABELS[configKey] || configKey, errors);
    }
  });

  if (show("emergencyContact") && require("emergencyContact")) {
    requireBodyField(body, "emergencyContactName", "Emergency contact name", errors);
    requireBodyField(body, "emergencyContactPhone", "Emergency contact phone", errors);
  }

  if (show("email") && body.email && !EMAIL_REGEX.test(body.email)) {
    errors.push("Please enter a valid email address");
  }

  if (show("mobile") && body.phone && !PHONE_REGEX.test(body.phone)) {
    errors.push("Phone number must be exactly 10 digits");
  }

  if (
    show("emergencyContact") &&
    body.emergencyContactPhone &&
    !PHONE_REGEX.test(body.emergencyContactPhone)
  ) {
    errors.push("Emergency contact phone number must be exactly 10 digits");
  }

  if (
    show("mobile") &&
    show("emergencyContact") &&
    body.phone &&
    body.emergencyContactPhone &&
    body.phone === body.emergencyContactPhone
  ) {
    errors.push("Phone number and emergency contact number must be different");
  }

  if (show("dob") && body.dateOfBirth) {
    const dob = new Date(body.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      errors.push("You must be at least 18 years old to register");
    }
  }

  const registrationType = body.registrationType;

  if (registrationType === "rider") {
    if (show("licenceUpload") && require("licenceUpload")) {
      const hasUpload = files?.licenseImage;
      const hasExisting = existingUser?.licenseImage;
      if (!hasUpload && !hasExisting) {
        errors.push("Driving licence image is mandatory");
      }
    }

    if (
      body.hasLinkedPillion === true ||
      body.hasLinkedPillion === "true"
    ) {
      requireBodyField(body, "linkedPillionName", "Pillion name", errors);
      requireBodyField(body, "linkedPillionMobile", "Pillion mobile number", errors);
      requireBodyField(body, "linkedPillionTShirtSize", "Pillion T-shirt size", errors);
      if (body.linkedPillionMobile && !PHONE_REGEX.test(body.linkedPillionMobile)) {
        errors.push("Pillion mobile number must be exactly 10 digits");
      }
    }
  }

  if (registrationType === "pillion") {
    if (!body.tShirtSize?.trim()) {
      errors.push("T-shirt size is required");
    }
    if (!body.riderPhone?.trim() && !body.riderRegistrationId?.trim()) {
      errors.push("Provide Rider phone or Rider registration ID for mapping");
    }
    if (body.riderPhone && !PHONE_REGEX.test(body.riderPhone)) {
      errors.push("Rider phone must be exactly 10 digits");
    }
  }

  if (show("idUpload") && require("idUpload")) {
    const hasUpload = files?.profileImage;
    const hasExisting = existingUser?.profileImage;
    if (!hasUpload && !hasExisting) {
      errors.push("Profile picture is mandatory");
    }
  }

  if (config.settings?.requireDeclaration !== false) {
    if (
      body.acceptedTerms !== true &&
      body.acceptedTerms !== "true" &&
      body.acceptedTerms !== "on"
    ) {
      errors.push("You must accept the Terms and Conditions");
    }
  }

  const customAnswers = parseCustomAnswers(body);
  (config.customQuestions || []).forEach((q) => {
    if (!q.required) return;
    const val = customAnswers[q.id];
    if (val === undefined || val === null || String(val).trim() === "") {
      errors.push(`${q.label || "Custom question"} is required`);
    }
  });

  return errors;
};

/** Apply only enabled fields from body onto registration data object */
export const applyConfiguredFieldsToRegistration = (
  registrationData,
  body,
  config,
  files,
  existingUser,
) => {
  if (!config || config.isLegacy) return registrationData;

  Object.entries(CONFIG_TO_BODY).forEach(([configKey, bodyKey]) => {
    if (!isFieldEnabled(config, configKey)) return;
    const value = normalizeScalarField(body[bodyKey]);
    if (value === undefined || value === null || value === "") return;
    if (configKey === "email") {
      registrationData.email = String(value).toLowerCase().trim();
    } else if (configKey === "dob") {
      registrationData.dateOfBirth = value;
    } else {
      registrationData[bodyKey] = value;
    }
  });

  if (isFieldEnabled(config, "emergencyContact")) {
    const ecName = normalizeScalarField(body.emergencyContactName);
    const ecPhone = normalizeScalarField(body.emergencyContactPhone);
    if (ecName) registrationData.emergencyContactName = ecName;
    if (ecPhone) registrationData.emergencyContactPhone = ecPhone;
  }

  if (body.registrationType === "rider") {
    if (isFieldEnabled(config, "licenceUpload")) {
      if (files?.licenseImage) {
        registrationData.licenseImage = files.licenseImage[0].path;
        registrationData.licenseImagePublicId = files.licenseImage[0].filename;
      } else if (existingUser?.licenseImage) {
        registrationData.licenseImage = existingUser.licenseImage;
        registrationData.licenseImagePublicId = existingUser.licenseImagePublicId;
      }
    }
  }

  if (isFieldEnabled(config, "idUpload")) {
    if (files?.profileImage) {
      registrationData.profileImage = files.profileImage[0].path;
      registrationData.profileImagePublicId = files.profileImage[0].filename;
    } else if (existingUser?.profileImage) {
      registrationData.profileImage = existingUser.profileImage;
      registrationData.profileImagePublicId = existingUser.profileImagePublicId;
    }
  }

  return registrationData;
};

export const buildConfiguredDuplicateQuery = (eventId, body, config) => {
  if (!config || config.isLegacy) return null;
  const orConditions = [];

  if (isFieldEnabled(config, "email") && body.email?.trim()) {
    orConditions.push({ email: body.email.toLowerCase().trim() });
  }
  if (isFieldEnabled(config, "mobile") && body.phone?.trim()) {
    orConditions.push({ phone: body.phone.trim() });
  }
  if (isFieldEnabled(config, "bikeRegistrationNumber") && body.bikeRegistrationNumber?.trim()) {
    orConditions.push({ bikeRegistrationNumber: body.bikeRegistrationNumber.trim() });
  }
  if (isFieldEnabled(config, "drivingLicence") && body.licenseNumber?.trim()) {
    orConditions.push({ licenseNumber: body.licenseNumber.trim() });
  }

  if (orConditions.length === 0) return null;
  return { eventId, $or: orConditions };
};
