import React from 'react';
import { isRegistrationOpen } from '../config/registrationStatus';
import './RegistrationClosed.css';

const RegistrationClosed = () => {
  if (isRegistrationOpen()) {
    return null; // Registration is open, don't show anything
  }

  return (
    <div className="registration-closed-container">
      {/* Full-screen background overlay */}
      <div className="registration-closed-overlay"></div>
      
      {/* Centered content */}
      <div className="registration-closed-content">
        <div className="registration-closed-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        
        <h1 className="registration-closed-title">Registrations Closed</h1>
        
        <p className="registration-closed-message">
          Thank you for your interest. Registrations for this event have been closed.
        </p>
        
        <div className="registration-closed-contact">
          <p>For more information, please contact us:</p>
          <p className="contact-email">Email: bucindianotify@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationClosed;