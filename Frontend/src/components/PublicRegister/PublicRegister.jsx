import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { eventService, registrationService, profileService } from "../../services/api";
import {
  REGISTRATION_TYPES,
  PREDEFINED_CLUBS,
  CLUB_OTHERS,
  BLOOD_GROUPS,
  TERMS_SUMMARY,
  getRegistrationTypeLabel,
} from "../../constants/registrationConstants";
import { validateRegistrationForm } from "../../utils/registrationValidation";
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Bike,
  FileText,
  Camera,
  Calendar,
  Droplets,
  Users,
  Globe,
  CheckCircle2,
  X,
  Loader2,
  GraduationCap,
  Heart,
} from "lucide-react";
import "./PublicRegister.css";

const INITIAL_FORM = {
  registrationType: "",
  fullName: "",
  email: "",
  phone: "",
  collegeName: "",
  department: "",
  year: "",
  clubName: "",
  clubNameCustom: "",
  city: "",
  address: "",
  state: "",
  pincode: "",
  dateOfBirth: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  bikeModel: "",
  bikeRegistrationNumber: "",
  licenseNumber: "",
  ridingExperience: "",
  interestReason: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  riderPhone: "",
  riderRegistrationId: "",
  tShirtSize: "",
  hasLinkedPillion: false,
  linkedPillionName: "",
  linkedPillionMobile: "",
  linkedPillionTShirtSize: "",
  acceptedTerms: false,
};

const Section = ({ icon: Icon, title, required, children }) => (
  <div className="reg-section">
    <div className="reg-section-head">
      {Icon && <Icon size={16} />}
      <h3>
        {title}
        {required && <span className="req">*</span>}
      </h3>
    </div>
    {children}
  </div>
);

const Field = ({
  label,
  name,
  required,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  as,
  options,
  max,
  selectClass = "",
}) => (
  <div className="reg-field">
    <label>
      {label}
      {required && <span className="ast"> *</span>}
    </label>
    <div className={`reg-input-wrap ${error ? "has-error" : ""}`}>
      {Icon && (
        <span className="reg-input-icon">
          <Icon size={18} />
        </span>
      )}
      {as === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={selectClass || "reg-select-dark"}
        >
          {options}
        </select>
      ) : as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          max={max}
          maxLength={name.includes("phone") ? 10 : undefined}
        />
      )}
    </div>
    {error && <p className="reg-field-error">{error}</p>}
  </div>
);

const UploadField = ({ label, name, required, icon: Icon, file, onChange, error }) => (
  <div className="reg-upload">
    <label>
      {label}
      {required && <span className="ast"> *</span>}
    </label>
    <label className={`reg-upload-box ${error ? "has-error" : ""}`}>
      <input type="file" name={name} accept="image/*" onChange={onChange} />
      {Icon ? <Icon size={28} /> : <Camera size={28} />}
      <span className="upload-label">{label}</span>
      <span className="upload-hint">Deploy File (IMG)</span>
      {file && <span className="upload-name">{file.name}</span>}
    </label>
    {error && <p className="reg-field-error">{error}</p>}
  </div>
);

const PublicRegister = () => {
  const { eventId: routeEventId } = useParams();
  const eventId = routeEventId || "community";
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);

  const registrationType = formData.registrationType;

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  }, []);

  const loadEvent = useCallback(async () => {
    if (eventId === "community") {
      setEvent({ title: "BUC India Registration", _id: "community" });
      setLoading(false);
      return;
    }
    try {
      const allEvents = await eventService.getAll();
      const found = allEvents.find((e) => e._id === eventId);
      setEvent(found || null);
      if (!found) setError("Event not found");
    } catch {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
    const email = sessionStorage.getItem("userEmail");
    const phone = sessionStorage.getItem("userPhone");
    if (!email && !phone) return;
    profileService
      .get(email, phone)
      .then((p) => {
        if (!p) return;
        setFormData((prev) => ({
          ...prev,
          fullName: p.fullName || prev.fullName,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          address: p.address || prev.address,
          city: p.city || prev.city,
          state: p.state || prev.state,
          pincode: p.pincode || prev.pincode,
          bloodGroup: p.bloodGroup || prev.bloodGroup,
          bikeModel: p.bikeModel || prev.bikeModel,
          licenseNumber: p.licenseNumber || prev.licenseNumber,
          emergencyContactName: p.emergencyContactName || prev.emergencyContactName,
          emergencyContactPhone: p.emergencyContactPhone || prev.emergencyContactPhone,
          facebookUrl: p.facebookUrl || prev.facebookUrl,
          instagramUrl: p.instagramUrl || prev.instagramUrl,
          twitterUrl: p.twitterUrl || prev.twitterUrl,
          youtubeUrl: p.youtubeUrl || prev.youtubeUrl,
          websiteUrl: p.websiteUrl || prev.websiteUrl,
          dateOfBirth: p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().split("T")[0]
            : prev.dateOfBirth,
        }));
      })
      .catch(() => {
        setFormData((prev) => ({
          ...prev,
          email: email || prev.email,
          phone: phone || prev.phone,
        }));
      });
  }, [loadEvent]);

  const isStudent = registrationType === "student";
  const isStudentRider = registrationType === "student_rider";
  const isRider = registrationType === "rider";
  const isPillion = registrationType === "pillion";
  const isPublic = registrationType === "public";

  const showStudent = isStudent || isStudentRider;
  const showClub = isStudent || isStudentRider || isRider;
  const showPersonal = isRider || isStudentRider || isPillion;
  const showAddressFull = isRider;
  const showAddressCity = isStudent || isPublic || isPillion;
  const showBike = isRider || isStudentRider;
  const showBikeRequired = isRider;
  const showEmergency = isStudentRider || isRider;
  const showSocial = isRider || isStudentRider || isPillion;
  const showUploads = isRider;
  const showInterest = isPublic;
  const showPillionMapping = isPillion;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (
      name === "phone" ||
      name === "emergencyContactPhone" ||
      name === "riderPhone" ||
      name === "linkedPillionMobile"
    ) {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setFormData((p) => ({ ...p, [name]: numeric }));
    } else if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target.name === "profileImage") setProfileImage(file);
    if (e.target.name === "licenseImage") setLicenseImage(file);
  };

  const selectType = (value) => {
    setFormData((p) => ({ ...p, registrationType: value }));
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.registrationType;
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegistrationForm(formData, registrationType);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please correct the highlighted fields");
      const first = Object.keys(errors)[0];
      document.querySelector(`[name="${first}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setFieldErrors({});
    setError("");
    setSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "acceptedTerms") {
        data.append(k, v ? "true" : "false");
      } else if (v !== "" && v !== null && v !== undefined) {
        data.append(k, v);
      }
    });
    data.append("eventId", eventId);
    if (showUploads && profileImage) data.append("profileImage", profileImage);
    if (showUploads && licenseImage) data.append("licenseImage", licenseImage);

    try {
      await registrationService.create(data);
      if (formData.email) sessionStorage.setItem("userEmail", formData.email);
      if (formData.phone) sessionStorage.setItem("userPhone", formData.phone);
      setSubmittedSummary({
        fullName: formData.fullName,
        registrationType: formData.registrationType,
      });
      setShowSuccess(true);
      toast.success("Registration complete! Check your email.");
      setFormData(INITIAL_FORM);
      setProfileImage(null);
      setLicenseImage(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      toast.error(msg);
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
      <button
        type="button"
        className="reg-portal-back"
        onClick={() => navigate("/")}
        aria-label="Back home"
      >
        <X size={20} />
      </button>

      <div className="reg-portal-wrap">
        <header className="reg-portal-hero">
          <h1>
            REGISTRATION
            <span className="portal-outline">PORTAL</span>
          </h1>
          <p className="reg-portal-sub">
            Select the type of registration below. Join as an individual rider or
            partner your club with the network.
          </p>
          {event && eventId !== "community" && (
            <p className="reg-portal-event">Event: {event.title}</p>
          )}
        </header>

        <div className="reg-mode-toggle">
          <button type="button" className="reg-mode-btn active">
            <User size={14} />
            User Registration
          </button>
          <button
            type="button"
            className="reg-mode-btn"
            onClick={() => navigate("/clubs/collaborate")}
          >
            <Shield size={14} />
            Club Registration
          </button>
        </div>

        <div className="reg-form-card">
          <div className="reg-form-card-title">
            <User size={22} />
            <h2>User Registration</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="reg-form-alert">{error}</div>}

            <Section icon={User} title="Registration Category" required>
              <div className="reg-type-grid">
                {REGISTRATION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`reg-type-pill ${registrationType === t.value ? "selected" : ""}`}
                    onClick={() => selectType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {fieldErrors.registrationType && (
                <p className="reg-field-error">{fieldErrors.registrationType}</p>
              )}
            </Section>

            {registrationType && (
              <>
                <Section icon={User} title="Basic Info" required>
                  <Field
                    label="Full Name"
                    name="fullName"
                    required
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full legal name"
                    error={fieldErrors.fullName}
                  />
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    error={fieldErrors.email}
                  />
                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    required
                    icon={Phone}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    error={fieldErrors.phone}
                  />
                </Section>

                {showPersonal && (
                  <Section icon={Calendar} title="Personal Details" required={isRider}>
                    <Field
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      icon={Calendar}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={maxDob}
                      error={fieldErrors.dateOfBirth}
                    />
                    <Field
                      label="Blood Group"
                      name="bloodGroup"
                      icon={Droplets}
                      as="select"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      error={fieldErrors.bloodGroup}
                      options={
                        <>
                          <option value="">Select Blood Group</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </>
                      }
                    />
                  </Section>
                )}

                {showStudent && (
                  <Section icon={GraduationCap} title="Student Details" required>
                    <Field
                      label="College Name"
                      name="collegeName"
                      required
                      value={formData.collegeName}
                      onChange={handleChange}
                      error={fieldErrors.collegeName}
                    />
                    <Field
                      label="Department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      error={fieldErrors.department}
                    />
                    <Field
                      label="Year"
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g. 2nd Year"
                      error={fieldErrors.year}
                    />
                  </Section>
                )}

                {showAddressFull && (
                  <Section icon={MapPin} title="Address Info" required>
                    <Field
                      label="Address"
                      name="address"
                      required
                      icon={MapPin}
                      as="textarea"
                      value={formData.address}
                      onChange={handleChange}
                      error={fieldErrors.address}
                    />
                    <Field
                      label="City"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      error={fieldErrors.city}
                    />
                    <Field
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      error={fieldErrors.state}
                    />
                    <Field
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      error={fieldErrors.pincode}
                    />
                  </Section>
                )}

                {showAddressCity && !showAddressFull && (
                  <Section icon={MapPin} title="Location" required>
                    <Field
                      label="City"
                      name="city"
                      required
                      icon={MapPin}
                      value={formData.city}
                      onChange={handleChange}
                      error={fieldErrors.city}
                    />
                  </Section>
                )}

                {showClub && (
                  <Section icon={Shield} title="Club Affiliation" required>
                    <Field
                      label="Club Name"
                      name="clubName"
                      required
                      as="select"
                      value={formData.clubName}
                      onChange={handleChange}
                      error={fieldErrors.clubName}
                      options={
                        <>
                          <option value="">Select your club</option>
                          {PREDEFINED_CLUBS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </>
                      }
                    />
                    {formData.clubName === CLUB_OTHERS && (
                      <Field
                        label="Club Identity"
                        name="clubNameCustom"
                        required
                        icon={Shield}
                        value={formData.clubNameCustom}
                        onChange={handleChange}
                        placeholder="Enter your club's full name"
                        error={fieldErrors.clubNameCustom}
                      />
                    )}
                  </Section>
                )}

                {showBike && (
                  <Section
                    icon={Bike}
                    title="Bike Information"
                    required={showBikeRequired}
                  >
                    {!showBikeRequired && (
                      <p className="reg-section-note">Optional for Student Riders</p>
                    )}
                    {isRider && (
                      <Field
                        label="Riding Experience"
                        name="ridingExperience"
                        required
                        value={formData.ridingExperience}
                        onChange={handleChange}
                        placeholder="Years / type of riding"
                        error={fieldErrors.ridingExperience}
                      />
                    )}
                    <Field
                      label="Bike Model"
                      name="bikeModel"
                      required={showBikeRequired}
                      icon={Bike}
                      value={formData.bikeModel}
                      onChange={handleChange}
                      error={fieldErrors.bikeModel}
                    />
                    {(isRider || isStudentRider) && (
                      <>
                        <Field
                          label="Bike Registration Number"
                          name="bikeRegistrationNumber"
                          icon={FileText}
                          value={formData.bikeRegistrationNumber}
                          onChange={handleChange}
                          error={fieldErrors.bikeRegistrationNumber}
                        />
                        {isRider && (
                          <Field
                            label="License Number"
                            name="licenseNumber"
                            icon={FileText}
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            error={fieldErrors.licenseNumber}
                          />
                        )}
                      </>
                    )}
                  </Section>
                )}

                {isRider && (
                  <Section icon={Users} title="Pillion Management">
                    <div className="reg-terms">
                      <label className="reg-terms-check">
                        <input
                          type="checkbox"
                          name="hasLinkedPillion"
                          checked={formData.hasLinkedPillion}
                          onChange={handleChange}
                        />
                        <span className="reg-terms-text">
                          Add a pillion with this rider registration
                        </span>
                      </label>
                    </div>
                    {formData.hasLinkedPillion && (
                      <>
                        <Field
                          label="Pillion Name"
                          name="linkedPillionName"
                          required
                          icon={User}
                          value={formData.linkedPillionName}
                          onChange={handleChange}
                          error={fieldErrors.linkedPillionName}
                        />
                        <Field
                          label="Pillion Mobile Number"
                          name="linkedPillionMobile"
                          required
                          icon={Phone}
                          value={formData.linkedPillionMobile}
                          onChange={handleChange}
                          error={fieldErrors.linkedPillionMobile}
                        />
                        <Field
                          label="Pillion T-shirt Size"
                          name="linkedPillionTShirtSize"
                          required
                          as="select"
                          value={formData.linkedPillionTShirtSize}
                          onChange={handleChange}
                          error={fieldErrors.linkedPillionTShirtSize}
                          options={
                            <>
                              <option value="">Select Size</option>
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </>
                          }
                        />
                      </>
                    )}
                  </Section>
                )}

                {showPillionMapping && (
                  <>
                    <Section icon={FileText} title="Pillion Details" required>
                      <Field
                        label="T-shirt Size"
                        name="tShirtSize"
                        required
                        as="select"
                        value={formData.tShirtSize}
                        onChange={handleChange}
                        error={fieldErrors.tShirtSize}
                        options={
                          <>
                            <option value="">Select Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </>
                        }
                      />
                    </Section>
                    <Section icon={Bike} title="Map To Rider" required>
                      <Field
                        label="Rider Mobile Number"
                        name="riderPhone"
                        type="tel"
                        icon={Phone}
                        value={formData.riderPhone}
                        onChange={handleChange}
                        placeholder="Registered rider mobile"
                        error={fieldErrors.riderPhone}
                      />
                      <Field
                        label="Rider Registration ID"
                        name="riderRegistrationId"
                        icon={FileText}
                        value={formData.riderRegistrationId}
                        onChange={handleChange}
                        placeholder="Optional if phone is provided"
                        error={fieldErrors.riderRegistrationId}
                      />
                    </Section>
                  </>
                )}

                {showEmergency && (
                  <Section icon={Users} title="Emergency Contact" required>
                    <Field
                      label="Emergency Contact Name"
                      name="emergencyContactName"
                      required
                      icon={User}
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      error={fieldErrors.emergencyContactName}
                    />
                    <Field
                      label="Emergency Contact Phone"
                      name="emergencyContactPhone"
                      type="tel"
                      required
                      icon={Phone}
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      error={fieldErrors.emergencyContactPhone}
                    />
                  </Section>
                )}

                {showInterest && (
                  <Section icon={Heart} title="Your Interest" required>
                    <Field
                      label="Interest / Reason"
                      name="interestReason"
                      required
                      as="textarea"
                      value={formData.interestReason}
                      onChange={handleChange}
                      placeholder="Why would you like to connect with BUC India?"
                      error={fieldErrors.interestReason}
                    />
                  </Section>
                )}

                {showSocial && (
                  <Section icon={Globe} title="Social Presence">
                    <Field
                      label="Facebook"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleChange}
                    />
                    <Field
                      label="Instagram"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleChange}
                    />
                    <Field
                      label="Twitter / X"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleChange}
                    />
                    <Field
                      label="YouTube"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                    />
                    <Field
                      label="Personal Website"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                    />
                  </Section>
                )}

                {showUploads && (
                  <Section icon={Camera} title="Uploads">
                    <p className="reg-section-note">Optional — profile & license images</p>
                    <UploadField
                      label="Profile Image"
                      name="profileImage"
                      icon={Camera}
                      file={profileImage}
                      onChange={handleFile}
                    />
                    <UploadField
                      label="License Image"
                      name="licenseImage"
                      icon={FileText}
                      file={licenseImage}
                      onChange={handleFile}
                    />
                  </Section>
                )}

                <div className="reg-section">
                  <div className="reg-section-head">
                    <Shield size={16} />
                    <h3>
                      Declaration & Legal Agreement<span className="req">*</span>
                    </h3>
                  </div>
                  <div className="reg-terms">
                    <label className="reg-terms-check">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        checked={formData.acceptedTerms}
                        onChange={handleChange}
                      />
                      <span className="reg-terms-text">
                        I confirm that I have read and understood all{" "}
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.preventDefault();
                            setShowTermsModal(true);
                          }}
                        >
                          Terms and Conditions
                        </button>
                        , voluntarily agree to abide by them, and accept full
                        responsibility for my participation.
                        <span className="ast"> *</span>
                      </span>
                    </label>
                    {fieldErrors.acceptedTerms && (
                      <p className="reg-field-error">{fieldErrors.acceptedTerms}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="reg-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Complete Registration"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {showTermsModal && (
        <div
          className="reg-modal-overlay"
          onClick={() => setShowTermsModal(false)}
          role="presentation"
        >
          <div
            className="reg-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <h4>Terms & Conditions</h4>
            <p>{TERMS_SUMMARY}</p>
            <button
              type="button"
              className="reg-modal-close"
              onClick={() => setShowTermsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="reg-success-overlay">
          <div className="reg-success-card">
            <div className="reg-success-icon">
              <CheckCircle2 size={40} />
            </div>
            <h3>Registration Successful</h3>
            <p>
              Thank you,{" "}
              <span className="highlight">
                {submittedSummary?.fullName || "Rider"}
              </span>
              . Your{" "}
              <span className="highlight">
                {getRegistrationTypeLabel(submittedSummary?.registrationType)}
              </span>{" "}
              registration is confirmed. A confirmation email has been sent.
            </p>
            <button
              type="button"
              className="reg-submit-btn"
              onClick={() => {
                setShowSuccess(false);
                navigate("/");
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRegister;

