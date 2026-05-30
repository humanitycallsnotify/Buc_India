const PHONE_REGEX = /^\d{10}$/;

const TYPE_LABELS = {
  student: "Student",
  student_rider: "Student Rider",
  rider: "Rider",
  pillion: "Pillion",
  public: "Public",
};

export const REGISTRATION_TYPES = Object.keys(TYPE_LABELS);

export const isValidRegistrationType = (type) =>
  REGISTRATION_TYPES.includes(type);

const requireField = (body, field, errors, message) => {
  const value = body[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    errors.push(message || `${field} is required`);
  }
};

const validatePhone = (phone, fieldName, errors) => {
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.push(`${fieldName} must be exactly 10 digits`);
  }
};

const validateClub = (body, errors) => {
  requireField(body, "clubName", errors, "Club name is required");
  if (body.clubName === "Others") {
    requireField(
      body,
      "clubNameCustom",
      errors,
      "Please enter your club's full name",
    );
  }
};

export const validateRegistrationPayload = (body) => {
  const errors = [];
  const { registrationType } = body;

  if (!registrationType) {
    return { errors, isLegacy: true };
  }

  if (!isValidRegistrationType(registrationType)) {
    errors.push("Invalid registration type");
    return { errors, isLegacy: false };
  }

  requireField(body, "fullName", errors, "Full name is required");
  requireField(body, "email", errors, "Email is required");
  requireField(body, "phone", errors, "Phone number is required");
  validatePhone(body.phone, "Phone number", errors);

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Please enter a valid email address");
  }

  if (
    body.acceptedTerms !== true &&
    body.acceptedTerms !== "true" &&
    body.acceptedTerms !== "on"
  ) {
    errors.push("You must accept the Terms and Conditions");
  }

  switch (registrationType) {
    case "student":
      requireField(body, "collegeName", errors, "College name is required");
      requireField(body, "department", errors, "Department is required");
      requireField(body, "year", errors, "Year is required");
      validateClub(body, errors);
      requireField(body, "city", errors, "City is required");
      break;

    case "student_rider":
      requireField(body, "collegeName", errors, "College name is required");
      requireField(body, "department", errors, "Department is required");
      requireField(body, "year", errors, "Year is required");
      validateClub(body, errors);
      requireField(
        body,
        "emergencyContactName",
        errors,
        "Emergency contact name is required",
      );
      requireField(
        body,
        "emergencyContactPhone",
        errors,
        "Emergency contact phone is required",
      );
      validatePhone(
        body.emergencyContactPhone,
        "Emergency contact phone",
        errors,
      );
      if (
        body.phone &&
        body.emergencyContactPhone &&
        body.phone === body.emergencyContactPhone
      ) {
        errors.push(
          "Phone number and emergency contact number must be different",
        );
      }
      break;

    case "rider":
      requireField(body, "address", errors, "Address is required");
      validateClub(body, errors);
      requireField(
        body,
        "emergencyContactName",
        errors,
        "Emergency contact name is required",
      );
      requireField(
        body,
        "emergencyContactPhone",
        errors,
        "Emergency contact phone is required",
      );
      validatePhone(
        body.emergencyContactPhone,
        "Emergency contact phone",
        errors,
      );
      requireField(
        body,
        "ridingExperience",
        errors,
        "Riding experience is required",
      );
      requireField(body, "bikeModel", errors, "Bike name/model is required");
      if (
        body.phone &&
        body.emergencyContactPhone &&
        body.phone === body.emergencyContactPhone
      ) {
        errors.push(
          "Phone number and emergency contact number must be different",
        );
      }
      break;

    case "public":
      requireField(body, "city", errors, "City is required");
      requireField(
        body,
        "interestReason",
        errors,
        "Interest or reason is required",
      );
      break;

    case "pillion":
      requireField(body, "city", errors, "City is required");
      requireField(body, "tShirtSize", errors, "T-shirt size is required");
      if (!body.riderPhone && !body.riderRegistrationId) {
        errors.push(
          "Provide Rider phone or Rider registration ID for mapping",
        );
      }
      if (body.riderPhone) {
        validatePhone(body.riderPhone, "Rider phone", errors);
      }
      break;

    default:
      break;
  }

  if (
    registrationType === "rider" &&
    (body.hasLinkedPillion === true || body.hasLinkedPillion === "true")
  ) {
    requireField(
      body,
      "linkedPillionName",
      errors,
      "Pillion name is required",
    );
    requireField(
      body,
      "linkedPillionMobile",
      errors,
      "Pillion mobile number is required",
    );
    requireField(
      body,
      "linkedPillionTShirtSize",
      errors,
      "Pillion T-shirt size is required",
    );
    validatePhone(body.linkedPillionMobile, "Pillion mobile number", errors);
  }

  return { errors, isLegacy: false };
};

export const getResolvedClubName = (body) => {
  if (body.clubName === "Others" && body.clubNameCustom) {
    return String(body.clubNameCustom).trim();
  }
  return body.clubName ? String(body.clubName).trim() : "";
};

export const getRegistrationTypeLabel = (type) =>
  TYPE_LABELS[type] || type || "Registration";
