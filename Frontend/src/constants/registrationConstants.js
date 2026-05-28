export const REGISTRATION_TYPES = [
  { value: "student", label: "Student" },
  { value: "student_rider", label: "Student Rider" },
  { value: "rider", label: "Rider" },
  { value: "pillion", label: "Pillion" },
  { value: "public", label: "Public" },
];

export const PREDEFINED_CLUBS = [
  "BUC Chennai",
  "BUC Bangalore",
  "BUC Hyderabad",
  "BUC Kerala",
  "BUC Coimbatore",
  "Others",
];

export const CLUB_OTHERS = "Others";

export const getRegistrationTypeLabel = (value) =>
  REGISTRATION_TYPES.find((t) => t.value === value)?.label || value || "-";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const TERMS_SUMMARY = `By registering with Bikers Unity Calls (BUC India), you agree to participate responsibly in all community activities. You confirm that the information provided is accurate and that you will follow all safety guidelines, event rules, and conduct standards set by BUC India and affiliated clubs. BUC India reserves the right to verify details and decline or revoke registration at its discretion. Your data will be used only for community communication, event coordination, and safety purposes.`;

export const resolveClubName = (registration) => {
  if (!registration) return "-";
  if (registration.clubName === CLUB_OTHERS && registration.clubNameCustom) {
    return registration.clubNameCustom;
  }
  return registration.clubName || registration.clubNameCustom || "-";
};
