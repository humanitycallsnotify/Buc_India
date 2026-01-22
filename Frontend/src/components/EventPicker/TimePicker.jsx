import React, { useState, useRef, useEffect } from "react";
import "./TimePicker.css";

const TimePicker = ({ value, onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const timePickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "00");
      setMinutes(m || "00");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleTimeChange = (newHours, newMinutes) => {
    setHours(newHours);
    setMinutes(newMinutes);
    const timeValue = `${newHours}:${newMinutes}`;
    onChange({ target: { name, value: timeValue } });
  };

  const handleConfirm = () => {
    setIsOpen(false);
  };

  const generateOptions = (max, pad = true) => {
    const options = [];
    for (let i = 0; i <= max; i++) {
      const val = pad ? String(i).padStart(2, "0") : String(i);
      options.push(val);
    }
    return options;
  };

  const hourOptions = generateOptions(23);
  const minuteOptions = generateOptions(59);

  const displayValue = value || "00:00";
  const [displayHours, displayMinutes] = displayValue.split(":");

  return (
    <div className="time-picker-container" ref={timePickerRef}>
      <div className="time-input-display" onClick={handleOpen}>
        <span className="time-display-value">
          {displayHours}:{displayMinutes}
        </span>
        <span className="time-picker-icon">🕐</span>
      </div>

      {isOpen && (
        <div className="time-picker-modal">
          <div className="time-picker-content">
            <div className="time-picker-header">
              <h3>Select Time</h3>
              <button
                className="time-picker-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="time-picker-selectors">
              <div className="time-selector-group">
                <label>Hour</label>
                <div className="time-selector">
                  <select
                    value={hours}
                    onChange={(e) => handleTimeChange(e.target.value, minutes)}
                    className="time-select"
                  >
                    {hourOptions.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="time-separator">:</div>

              <div className="time-selector-group">
                <label>Minute</label>
                <div className="time-selector">
                  <select
                    value={minutes}
                    onChange={(e) => handleTimeChange(hours, e.target.value)}
                    className="time-select"
                  >
                    {minuteOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="time-picker-actions">
              <button className="time-confirm-btn" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
