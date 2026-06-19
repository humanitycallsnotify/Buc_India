import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { eventService, registrationService, profileService } from "../../services/api";
import { TERMS_SUMMARY } from "../../constants/registrationConstants";
import {
  User,
  Mail,
  Phone,
  Bike,
  Droplets,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "./PublicRegister.css";

const INITIAL_FORM = {
  registrationType: "rider",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  bikeModel: "",
  bikeRegistrationNumber: "",
  licenseNumber: "",
  licenseImage: null,
  profileImage: null,
  dateOfBirth: "",
  bloodGroup: "",
  anyMedicalCondition: "",
  requestRidingGears: false,
  requestedGears: {
    helmet: false,
    gloves: false,
    jacket: false,
    boots: false,
    kneeGuards: false,
    elbowGuards: false,
  },
  hasLinkedPillion: false,
  linkedPillionName: "",
  linkedPillionMobile: "",
  riderPhone: "",
  riderRegistrationId: "",
  acceptedTerms: false,
};

const PublicRegister = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const eventId = event ? event._id : (slug || "community");

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split("T")[0];
  }, []);

  const loadEvent = useCallback(async () => {
    const currentSlug = slug || "community";
    if (currentSlug === "community") {
      setEvent({ title: "BUC India Registration", _id: "community" });
      setLoading(false);
      return;
    }
    try {
      const allEvents = await eventService.getAll();
      
      const slugify = (text) => text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end

      const found = allEvents.find((e) => slugify(e.title) === currentSlug || e._id === currentSlug);
      if (found) {
        setEvent(found);
      } else {
        const formattedTitle = currentSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setEvent({ title: formattedTitle, _id: currentSlug });
      }
    } catch {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const userLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    const userEmail = sessionStorage.getItem("userEmail");
    const userPhone = sessionStorage.getItem("userPhone");
    
    const fetchProfile = async () => {
      if (userLoggedIn && (userEmail || userPhone)) {
        try {
          const profile = await profileService.get(userEmail, userPhone);
          if (profile) {
            setProfileData(profile);
            setFormData(prev => ({
              ...prev,
              fullName: profile.fullName || prev.fullName,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              address: profile.address || prev.address,
              city: profile.city || prev.city,
              state: profile.state || prev.state,
              pincode: profile.pincode || prev.pincode,
              dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : prev.dateOfBirth,
              bloodGroup: profile.bloodGroup || prev.bloodGroup,
              bikeModel: profile.bikeModel || prev.bikeModel,
              bikeRegistrationNumber: profile.bikeRegistrationNumber || prev.bikeRegistrationNumber,
              licenseNumber: profile.licenseNumber || prev.licenseNumber,
              emergencyContactName: profile.emergencyContactName || prev.emergencyContactName,
              emergencyContactPhone: profile.emergencyContactPhone || prev.emergencyContactPhone,
            }));
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setFormData(prev => ({
            ...prev,
            email: userEmail || prev.email,
            phone: userPhone || prev.phone
          }));
        }
      }
    };

    fetchProfile();
    loadEvent();
  }, [slug, loadEvent]);

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "licenseImage") {
      setFormData((prev) => ({ ...prev, licenseImage: files[0] }));
    } else if (name === "profileImage") {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (
      name === "phone" ||
      name === "emergencyContactPhone" ||
      name === "riderPhone" ||
      name === "linkedPillionMobile"
    ) {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, registrationType: type }));
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Base mandatory fields for all
    const mandatoryFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
      "emergencyContactName",
      "emergencyContactPhone",
      "dateOfBirth",
      "bloodGroup",
      "anyMedicalCondition",
    ];

    const errors = {};
    mandatoryFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors[field] = "This field is mandatory";
      }
    });

    if (formData.registrationType === "rider") {
      const riderMandatory = ["bikeModel", "bikeRegistrationNumber", "licenseNumber"];
      riderMandatory.forEach((field) => {
        if (!formData[field] || formData[field].toString().trim() === "") {
          errors[field] = "This field is mandatory";
        }
      });

      if (!formData.licenseImage && (!profileData || !profileData.licenseImage)) {
        errors.licenseImage = "Driving License image is mandatory";
      }

      if (formData.hasLinkedPillion) {
        if (!formData.linkedPillionName || formData.linkedPillionName.trim() === "") {
          errors.linkedPillionName = "Pillion name is mandatory";
        }
        if (!formData.linkedPillionMobile || formData.linkedPillionMobile.trim() === "") {
          errors.linkedPillionMobile = "Pillion mobile number is mandatory";
        } else if (formData.linkedPillionMobile.length !== 10) {
          errors.linkedPillionMobile = "Pillion mobile must be exactly 10 digits";
        }
      }
    }

    if (formData.registrationType === "pillion") {
        errors.riderPhone = "Please provide Rider Phone or Rider Registration ID";
      }
      if (formData.riderPhone && formData.riderPhone.length !== 10) {
        errors.riderPhone = "Rider phone must be exactly 10 digits";
      }
    }

    if (!formData.profileImage && (!profileData || !profileData.profileImage)) {
      errors.profileImage = "Profile picture is mandatory";
    }

    if (!formData.acceptedTerms) {
      errors.acceptedTerms = "You must accept the Terms and Conditions";
    }

    // Age validation (18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    // Phone validation (exactly 10 digits)
    if (formData.phone && formData.phone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    if (
      formData.emergencyContactPhone &&
      formData.emergencyContactPhone.length !== 10
    ) {
      errors.emergencyContactPhone = "Phone number must be exactly 10 digits";
    }

    if (
      formData.phone &&
      formData.emergencyContactPhone &&
      formData.phone === formData.emergencyContactPhone
    ) {
      errors.emergencyContactPhone =
        "Phone number and emergency contact number must be different";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill all mandatory fields");
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0] || document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "licenseImage") {
        if (formData.licenseImage) data.append("licenseImage", formData.licenseImage);
      } else if (key === "profileImage") {
        if (formData.profileImage) data.append("profileImage", formData.profileImage);
      } else if (key === "requestedGears") {
        data.append("requestedGears", JSON.stringify(formData.requestedGears));
      } else if (key === "acceptedTerms") {
        data.append(key, formData.acceptedTerms ? "true" : "false");
      } else if (key === "hasLinkedPillion") {
        data.append(key, formData.hasLinkedPillion ? "true" : "false");
      } else {
        data.append(key, formData[key]);
      }
    });
    data.append("eventId", eventId);

    try {
      await registrationService.create(data);
      
      if (formData.email) sessionStorage.setItem("userEmail", formData.email);
      if (formData.phone) sessionStorage.setItem("userPhone", formData.phone);
      
      setShowSuccessOverlay(true);
      toast.success("Registration successful!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="reg-loading">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="public-register">
      <div className="register-container">
        <button
          className="back-btn-float"
          onClick={() => navigate("/register/june-21-event")}
          title="Back to home"
        >
          <X size={24} />
        </button>
        
        {/* Cover Photo / Banner */}
        {event && eventId !== "community" && event.banner && (
          <div className="event-cover-container">
            <img src={event.banner} alt={event.title} className="event-cover-img" />
            <div className="event-cover-overlay"></div>
          </div>
        )}

        <div className="register-header">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Event <span className="text-blue-500">Registration</span>
          </h2>
          {event && (
            <p className="mt-4 text-xl text-gray-400">
              Registering for:{" "}
              <span className="text-white font-semibold">{event.title}</span>
            </p>
          )}
        </div>

        {/* Event Details Card */}
        {event && eventId !== "community" && (
          <div className="event-details-card">
            <h3 className="event-details-title">{event.title}</h3>
            {event.description && <p className="event-details-desc">{event.description}</p>}
            <div className="event-details-grid">
              {event.eventDate && (
                <div className="event-detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {event.eventTime && (
                <div className="event-detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{event.eventTime}</span>
                </div>
              )}
              {event.location && (
                <div className="event-detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{event.location}</span>
                </div>
              )}
              {event.meetingPoint && (
                <div className="event-detail-item">
                  <span className="detail-label">Meeting Point:</span>
                  <span className="detail-value">{event.meetingPoint}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="registration-form" noValidate>
            {error && <div className="error-message">{error}</div>}

            {/* Registration Type Selection */}
            <div className="form-section">
              <h3>Registration Type *</h3>
              <div className="reg-type-container">
                <button
                  type="button"
                  onClick={() => handleTypeChange("rider")}
                  className={`reg-type-btn ${
                    formData.registrationType === "rider" ? "active" : ""
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("pillion")}
                  className={`reg-type-btn ${
                    formData.registrationType === "pillion" ? "active" : ""
                  }`}
                >
                  Pillion
                </button>
              </div>
            </div>
            
            {/* 1. Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Profile Picture *</label>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleInputChange}
                    className={fieldErrors.profileImage ? "input-error" : ""}
                  />
                  {formData.profileImage ? (
                    <p className="file-selected">✓ New profile picture selected</p>
                  ) : profileData?.profileImage ? (
                    <p className="file-selected text-green-500">✓ Using existing profile picture</p>
                  ) : null}
                  {fieldErrors.profileImage && (
                    <span className="field-error">{fieldErrors.profileImage}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={fieldErrors.fullName ? "input-error" : ""}
                  />
                  {fieldErrors.fullName && (
                    <span className="field-error">{fieldErrors.fullName}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className={fieldErrors.email ? "input-error" : ""}
                  />
                  {fieldErrors.email && (
                    <span className="field-error">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Phone Number *{" "}
                    <span className="label-hint">(10-digit Indian mobile)</span>
                  </label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={fieldErrors.phone ? "input-error" : ""}
                      maxLength="10"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <span className="field-error">{fieldErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    max={maxDate}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={fieldErrors.dateOfBirth ? "input-error" : ""}
                  />
                  {fieldErrors.dateOfBirth && (
                    <span className="field-error">{fieldErrors.dateOfBirth}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group *</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className={fieldErrors.bloodGroup ? "input-error" : ""}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {fieldErrors.bloodGroup && (
                    <span className="field-error">{fieldErrors.bloodGroup}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Address */}
            <div className="form-section">
              <h3>Address</h3>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Street address"
                  className={fieldErrors.address ? "input-error" : ""}
                />
                {fieldErrors.address && (
                  <span className="field-error">{fieldErrors.address}</span>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={fieldErrors.city ? "input-error" : ""}
                  />
                  {fieldErrors.city && (
                    <span className="field-error">{fieldErrors.city}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className={fieldErrors.state ? "input-error" : ""}
                  />
                  {fieldErrors.state && (
                    <span className="field-error">{fieldErrors.state}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className={fieldErrors.pincode ? "input-error" : ""}
                  />
                  {fieldErrors.pincode && (
                    <span className="field-error">{fieldErrors.pincode}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Emergency Contact */}
            <div className="form-section">
              <h3>Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="Contact person name"
                    className={fieldErrors.emergencyContactName ? "input-error" : ""}
                  />
                  {fieldErrors.emergencyContactName && (
                    <span className="field-error">{fieldErrors.emergencyContactName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone *</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={fieldErrors.emergencyContactPhone ? "input-error" : ""}
                      maxLength="10"
                    />
                  </div>
                  {fieldErrors.emergencyContactPhone && (
                    <span className="field-error">{fieldErrors.emergencyContactPhone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rider specific fields */}
            {formData.registrationType === "rider" && (
              <>
                {/* 4. Bike Information */}
                <div className="form-section">
                  <h3>
                    Bike Information <span className="section-required">(All fields required)</span>
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Bike Model *</label>
                      <input
                        type="text"
                        name="bikeModel"
                        value={formData.bikeModel}
                        onChange={handleInputChange}
                        placeholder="e.g., Royal Enfield Classic 350"
                        className={fieldErrors.bikeModel ? "input-error" : ""}
                      />
                      {fieldErrors.bikeModel && (
                        <span className="field-error">{fieldErrors.bikeModel}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Bike Registration Number *</label>
                      <input
                        type="text"
                        name="bikeRegistrationNumber"
                        value={formData.bikeRegistrationNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., TN01AB1234"
                        className={fieldErrors.bikeRegistrationNumber ? "input-error" : ""}
                      />
                      {fieldErrors.bikeRegistrationNumber && (
                        <span className="field-error">{fieldErrors.bikeRegistrationNumber}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>License Number *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="Driving license number"
                        className={fieldErrors.licenseNumber ? "input-error" : ""}
                      />
                      {fieldErrors.licenseNumber && (
                        <span className="field-error">{fieldErrors.licenseNumber}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>License Proof (Photo) *</label>
                      <input
                        type="file"
                        name="licenseImage"
                        accept="image/*"
                        onChange={handleInputChange}
                        className={fieldErrors.licenseImage ? "input-error" : ""}
                      />
                      {formData.licenseImage ? (
                        <p className="file-selected">✓ New license proof selected</p>
                      ) : profileData?.licenseImage ? (
                        <p className="file-selected text-green-500">✓ Using existing license proof</p>
                      ) : null}
                      {fieldErrors.licenseImage && (
                        <span className="field-error">{fieldErrors.licenseImage}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Riding Gears Request */}
                <div className="form-section">
                  <h3>Riding Gears Request</h3>
                  <div className="form-group">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requestRidingGears"
                        checked={formData.requestRidingGears}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestRidingGears: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span>Request riding gears for this event</span>
                    </label>
                    {formData.requestRidingGears && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(formData.requestedGears).map((gear) => (
                          <label
                            key={gear}
                            className="flex items-center space-x-2 cursor-pointer bg-white/5 p-3 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={formData.requestedGears[gear]}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  requestedGears: {
                                    ...formData.requestedGears,
                                    [gear]: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-white capitalize">
                              {gear.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pillion Management */}
                <div className="form-section">
                  <h3>Pillion Management</h3>
                  <div className="reg-terms-check-container mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasLinkedPillion"
                        checked={formData.hasLinkedPillion}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-blue-500"
                      />
                      <span className="text-gray-300 text-sm leading-relaxed">
                        Add a pillion with this rider registration
                      </span>
                    </label>
                  </div>

                  {formData.hasLinkedPillion && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Pillion Name *</label>
                          <input
                            type="text"
                            name="linkedPillionName"
                            value={formData.linkedPillionName}
                            onChange={handleInputChange}
                            placeholder="Enter pillion's name"
                            className={fieldErrors.linkedPillionName ? "input-error" : ""}
                          />
                          {fieldErrors.linkedPillionName && (
                            <span className="field-error">{fieldErrors.linkedPillionName}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Pillion Mobile Number *</label>
                          <div className="phone-input-wrapper">
                            <span className="phone-prefix">+91</span>
                            <input
                              type="tel"
                              name="linkedPillionMobile"
                              value={formData.linkedPillionMobile}
                              onChange={handleInputChange}
                              placeholder="9876543210"
                              className={fieldErrors.linkedPillionMobile ? "input-error" : ""}
                              maxLength="10"
                            />
                          </div>
                          {fieldErrors.linkedPillionMobile && (
                            <span className="field-error">{fieldErrors.linkedPillionMobile}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Pillion specific fields */}
            {formData.registrationType === "pillion" && (
              <div className="form-section">
                <h3>Map to Rider</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rider Mobile Number *</label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        name="riderPhone"
                        value={formData.riderPhone}
                        onChange={handleInputChange}
                        placeholder="Registered rider mobile"
                        className={fieldErrors.riderPhone ? "input-error" : ""}
                        maxLength="10"
                      />
                    </div>
                    {fieldErrors.riderPhone && (
                      <span className="field-error">{fieldErrors.riderPhone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Rider Registration ID (Optional)</label>
                    <input
                      type="text"
                      name="riderRegistrationId"
                      value={formData.riderRegistrationId}
                      onChange={handleInputChange}
                      placeholder="e.g., 60c72b2f9b1d8e25d48723c4"
                      className={fieldErrors.riderRegistrationId ? "input-error" : ""}
                    />
                    {fieldErrors.riderRegistrationId && (
                      <span className="field-error">{fieldErrors.riderRegistrationId}</span>
                    )}
                    <span className="label-hint">Provide Rider's Phone or Registration ID (or both) to map yourself to them.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Additional Information */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>
                  Medical Conditions (if any) (Write 'None' if not applicable) *
                </label>
                <textarea
                  name="anyMedicalCondition"
                  value={formData.anyMedicalCondition}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Please mention any medical conditions or allergies (Write 'None' if not applicable)"
                  className={fieldErrors.anyMedicalCondition ? "input-error" : ""}
                />
                {fieldErrors.anyMedicalCondition && (
                  <span className="field-error">{fieldErrors.anyMedicalCondition}</span>
                )}
              </div>
            </div>

            {/* 7. Declaration & Legal Agreement */}
            <div className="form-section">
              <h3>Declaration & Legal Agreement</h3>
              <div className="reg-terms-check-container">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 accent-blue-500"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed">
                    I confirm that I have read and understood all{" "}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-blue-500 underline hover:text-blue-400 font-semibold"
                    >
                      Terms and Conditions
                    </button>
                    , voluntarily agree to abide by them, and accept full responsibility for my participation. *
                  </span>
                </label>
                {fieldErrors.acceptedTerms && (
                  <p className="field-error mt-2">{fieldErrors.acceptedTerms}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions mt-8">
              <button
                type="button"
                onClick={() => navigate(`/register/${slug || "june-21-event"}`)}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">Terms & Conditions</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{TERMS_SUMMARY}</p>
            <button
              type="button"
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors uppercase tracking-wider"
              onClick={() => setShowTermsModal(false)}
            >
              Close & Agree
            </button>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl p-10 max-w-md w-full text-center shadow-2xl scale-in-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Registration Successful!
            </h3>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Your registration for{" "}
              <span className="text-blue-500 font-bold">{event?.title}</span>{" "}
              has been confirmed. See you on the road!
            </p>
            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                navigate(`/register/${slug || "june-21-event"}`);
              }}
              className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-xl"
            >
              Return to Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRegister;
