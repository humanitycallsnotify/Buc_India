import {
  CLUB_OTHERS,
  REGISTRATION_TYPES,
} from "../constants/registrationConstants";

const PHONE_REGEX = /^\d{10}$/;

const requireField = (formData, field, errors, label) => {
  const value = formData[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    errors[field] = label || "This field is required";
  }
};

export const validateRegistrationForm = (formData, registrationType) => {
  const errors = {};

  if (!registrationType) {
    errors.registrationType = "Please select a registration type";
    return errors;
  }

  if (!formData.acceptedTerms) {
    errors.acceptedTerms = "You must accept the Terms and Conditions";
  }

  requireField(formData, "fullName", errors, "Full name is required");
  requireField(formData, "email", errors, "Email is required");
  requireField(formData, "phone", errors, "Phone number is required");

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email";
  }

  if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
    errors.phone = "Phone number must be exactly 10 digits";
  }

  const validateClub = () => {
    requireField(formData, "clubName", errors, "Club name is required");
    if (formData.clubName === CLUB_OTHERS) {
      requireField(
        formData,
        "clubNameCustom",
        errors,
        "Please enter your club's full name",
      );
    }
  };

  switch (registrationType) {
    case "student":
      requireField(formData, "collegeName", errors, "College name is required");
      requireField(formData, "department", errors, "Department is required");
      requireField(formData, "year", errors, "Year is required");
      validateClub();
      requireField(formData, "city", errors, "City is required");
      break;

    case "student_rider":
      requireField(formData, "collegeName", errors, "College name is required");
      requireField(formData, "department", errors, "Department is required");
      requireField(formData, "year", errors, "Year is required");
      validateClub();
      requireField(
        formData,
        "emergencyContactName",
        errors,
        "Emergency contact name is required",
      );
      requireField(
        formData,
        "emergencyContactPhone",
        errors,
        "Emergency contact phone is required",
      );
      if (
        formData.emergencyContactPhone &&
        !PHONE_REGEX.test(formData.emergencyContactPhone)
      ) {
        errors.emergencyContactPhone =
          "Emergency contact phone must be exactly 10 digits";
      }
      if (
        formData.phone &&
        formData.emergencyContactPhone &&
        formData.phone === formData.emergencyContactPhone
      ) {
        errors.emergencyContactPhone =
          "Must be different from your phone number";
      }
      break;

    case "rider":
      requireField(formData, "address", errors, "Address is required");
      validateClub();
      requireField(
        formData,
        "emergencyContactName",
        errors,
        "Emergency contact name is required",
      );
      requireField(
        formData,
        "emergencyContactPhone",
        errors,
        "Emergency contact phone is required",
      );
      if (
        formData.emergencyContactPhone &&
        !PHONE_REGEX.test(formData.emergencyContactPhone)
      ) {
        errors.emergencyContactPhone =
          "Emergency contact phone must be exactly 10 digits";
      }
      requireField(
        formData,
        "ridingExperience",
        errors,
        "Riding experience is required",
      );
      requireField(formData, "bikeModel", errors, "Bike name/model is required");
      if (
        formData.phone &&
        formData.emergencyContactPhone &&
        formData.phone === formData.emergencyContactPhone
      ) {
        errors.emergencyContactPhone =
          "Must be different from your phone number";
      }
      break;

    case "pillion":
      requireField(formData, "city", errors, "City is required");
      requireField(formData, "tShirtSize", errors, "T-shirt size is required");
      if (!formData.riderPhone && !formData.riderRegistrationId) {
        errors.riderPhone = "Provide Rider phone or Rider registration ID";
      }
      if (formData.riderPhone && !PHONE_REGEX.test(formData.riderPhone)) {
        errors.riderPhone = "Rider phone must be exactly 10 digits";
      }
      break;

    case "public":
      requireField(formData, "city", errors, "City is required");
      requireField(
        formData,
        "interestReason",
        errors,
        "Interest or reason is required",
      );
      break;

    default:
      errors.registrationType = "Invalid registration type";
  }

  if (registrationType === "rider" && formData.hasLinkedPillion) {
    requireField(
      formData,
      "linkedPillionName",
      errors,
      "Pillion name is required",
    );
    requireField(
      formData,
      "linkedPillionMobile",
      errors,
      "Pillion mobile number is required",
    );
    requireField(
      formData,
      "linkedPillionTShirtSize",
      errors,
      "Pillion T-shirt size is required",
    );
    if (
      formData.linkedPillionMobile &&
      !PHONE_REGEX.test(formData.linkedPillionMobile)
    ) {
      errors.linkedPillionMobile =
        "Pillion mobile number must be exactly 10 digits";
    }
  }

  return errors;
};

export { REGISTRATION_TYPES };
