import React from 'react';
import { isRegistrationOpen } from '../config/registrationStatus';
import RegistrationClosedModal from './RegistrationClosedModal';

const RegistrationFormGuard = ({ children }) => {
  // If registration is closed, show the modal and disable the form
  if (!isRegistrationOpen()) {
    return (
      <>
        <RegistrationClosedModal />
        <div style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {children}
        </div>
      </>
    );
  }

  // If registration is open, render the form normally
  return children;
};

export default RegistrationFormGuard;