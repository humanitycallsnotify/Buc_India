// Registration Status Configuration
export const REGISTRATION_CONFIG = {
  isOpen: true,
  closedMessage: "Registrations have been closed",
  closedDate: new Date().toISOString(),
};

export const isRegistrationOpen = () => {
  return REGISTRATION_CONFIG.isOpen;
};

export const getClosedMessage = () => {
  return REGISTRATION_CONFIG.closedMessage;
};
