import React, { useState, useEffect } from 'react';
import { isRegistrationOpen, getClosedMessage } from '../config/registrationStatus';
import './RegistrationClosedModal.css';

const RegistrationClosedModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isRegistrationOpen()) {
      setShowModal(true);
    }
  }, []);

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registration Closed</h2>
        </div>
        <div className="modal-body">
          <p>{getClosedMessage()}</p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationClosedModal;