import {
  FIELD_TO_FORM,
  isFieldEnabled,
} from "../../constants/eventRegistrationConfig";

const CONFIG_KEY_BY_FORM = Object.entries(FIELD_TO_FORM).reduce((acc, [configKey, formKey]) => {
  acc[formKey] = configKey;
  return acc;
}, {});

const META_FORM_KEYS = new Set([
  "registrationType",
  "acceptedTerms",
  "hasLinkedPillion",
  "linkedPillionName",
  "linkedPillionMobile",
  "linkedPillionTShirtSize",
  "riderPhone",
  "riderRegistrationId",
  "tShirtSize",
  "requestRidingGears",
  "requestedGears",
]);

const SKIP_FORM_KEYS = new Set(["otp", "requestedGears"]);

/** Collapse duplicate FormData / multipart values to a single string */
export const normalizeScalar = (value) => {
  if (value === undefined || value === null) return "";
  if (value instanceof File || value instanceof Blob) return value;
  if (Array.isArray(value)) {
    const items = value
      .map((v) => (v === undefined || v === null ? "" : String(v).trim()))
      .filter(Boolean);
    const unique = [...new Set(items)];
    return unique[0] ?? "";
  }
  if (typeof value === "boolean") return value;
  if (typeof value === "object") return "";
  return String(value).trim();
};

export const shouldAppendField = (regConfig, formKey) => {
  if (SKIP_FORM_KEYS.has(formKey)) return false;
  if (regConfig.isLegacy) return true;
  if (formKey === "address" || formKey === "pincode") return regConfig.isLegacy;
  if (formKey === "emergencyContactName" || formKey === "emergencyContactPhone") {
    return isFieldEnabled(regConfig, "emergencyContact");
  }
  const configKey = CONFIG_KEY_BY_FORM[formKey];
  if (!configKey) return META_FORM_KEYS.has(formKey);
  return isFieldEnabled(regConfig, configKey);
};

/**
 * Build event registration FormData — each field appended exactly once.
 */
export const buildEventRegistrationFormData = ({
  formData,
  regConfig,
  eventId,
  customAnswers,
  registrationStatus,
}) => {
  const data = new FormData();

  const appendOnce = (key, value) => {
    if (value instanceof File) {
      data.append(key, value);
      return;
    }
    const normalized = normalizeScalar(value);
    if (normalized === "" || normalized === false) {
      if (key === "registrationType") {
        data.append(key, "rider");
      }
      return;
    }
    if (typeof normalized === "boolean") {
      data.append(key, normalized ? "true" : "false");
      return;
    }
    data.append(key, normalized);
  };

  data.append("eventId", eventId);
  appendOnce("registrationType", formData.registrationType || "rider");

  Object.values(FIELD_TO_FORM).forEach((formKey) => {
    if (!shouldAppendField(regConfig, formKey)) return;
    if (formKey === "licenseImage" || formKey === "profileImage") return;
    appendOnce(formKey, formData[formKey]);
  });

  if (shouldAppendField(regConfig, "emergencyContactName")) {
    appendOnce("emergencyContactName", formData.emergencyContactName);
  }
  if (shouldAppendField(regConfig, "emergencyContactPhone")) {
    appendOnce("emergencyContactPhone", formData.emergencyContactPhone);
  }

  if (regConfig.isLegacy) {
    appendOnce("address", formData.address);
    appendOnce("pincode", formData.pincode);
  }

  if (shouldAppendField(regConfig, "acceptedTerms")) {
    data.append("acceptedTerms", formData.acceptedTerms ? "true" : "false");
  }

  if (shouldAppendField(regConfig, "hasLinkedPillion")) {
    data.append("hasLinkedPillion", formData.hasLinkedPillion ? "true" : "false");
  }

  if (formData.hasLinkedPillion) {
    appendOnce("linkedPillionName", formData.linkedPillionName);
    appendOnce("linkedPillionMobile", formData.linkedPillionMobile);
    appendOnce("linkedPillionTShirtSize", formData.linkedPillionTShirtSize);
  }

  if (formData.registrationType === "pillion") {
    appendOnce("riderPhone", formData.riderPhone);
    appendOnce("riderRegistrationId", formData.riderRegistrationId);
    appendOnce("tShirtSize", formData.tShirtSize);
  } else if (regConfig.isLegacy && formData.tShirtSize) {
    appendOnce("tShirtSize", formData.tShirtSize);
  }

  if (shouldAppendField(regConfig, "licenseImage") && formData.licenseImage) {
    data.append("licenseImage", formData.licenseImage);
  }
  if (shouldAppendField(regConfig, "profileImage") && formData.profileImage) {
    data.append("profileImage", formData.profileImage);
  }

  if (formData.requestRidingGears) {
    data.append("requestRidingGears", "true");
    data.append("requestedGears", JSON.stringify(formData.requestedGears));
  }

  if (customAnswers && Object.keys(customAnswers).length > 0) {
    data.append("customAnswers", JSON.stringify(customAnswers));
  }

  if (registrationStatus) {
    data.append("registrationStatus", registrationStatus);
  }

  return data;
};
