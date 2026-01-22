import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { eventService, registrationService } from "../../services/api";
import {
  User,
  Mail,
  Phone,
  Bike,
  Droplets,
  Shirt,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  Calendar,
  CreditCard,
  Activity,
  FileText,
  ShieldCheck,
} from "lucide-react";
import "./PublicRegister.css";

const PublicRegister = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
    dateOfBirth: "",
    bloodGroup: "",
    anyMedicalCondition: "",
    tShirtSize: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    if (eventId === "community") {
      setEvent({ title: "Community Member", _id: "community" });
      setLoading(false);
      return;
    }
    try {
      const allEvents = await eventService.getAll();
      const foundEvent = allEvents.find((e) => e._id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError("Event not found");
      }
    } catch (err) {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "licenseImage") {
      setFormData((prev) => ({ ...prev, licenseImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mandatory fields
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
      "bikeModel",
      "bikeRegistrationNumber",
      "licenseNumber",
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

    if (!formData.licenseImage) {
      errors.licenseImage = "Driving License image is mandatory";
    }

    // Age validation (18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old";
      }
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
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
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
        data.append("licenseImage", formData.licenseImage);
      } else {
        data.append(key, formData[key]);
      }
    });
    data.append("eventId", eventId);

    try {
      await registrationService.create(data);
      setShowSuccessOverlay(true);
      toast.success("Registration successful!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="public-register">
      <div className="register-container">
        <button
          className="back-btn-float"
          onClick={() => navigate("/")}
          title="Back to home"
        >
          <X size={24} />
        </button>
        <div className="register-header">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Event <span className="text-orange-500">Registration</span>
          </h2>
          {event && (
            <p className="mt-4 text-xl text-gray-400">
              Registering for:{" "}
              <span className="text-white font-semibold">{event.title}</span>
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm text-center font-medium mb-6">
              <ShieldCheck size={20} className="inline-block mr-2" />
              Privacy Assurance: Your information is protected by
              industry-standard encryption. We maintain strict confidentiality
              and will never share your personal data with third parties without
              your explicit consent.
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-section">
              <h3>Personal Information</h3>
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
                    <span className="field-error">
                      {fieldErrors.dateOfBirth}
                    </span>
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
                    <span className="field-error">
                      {fieldErrors.bloodGroup}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>T-Shirt Size (Optional)</label>
                  <select
                    name="tShirtSize"
                    value={formData.tShirtSize}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
            </div>

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
                    className={
                      fieldErrors.emergencyContactName ? "input-error" : ""
                    }
                  />
                  {fieldErrors.emergencyContactName && (
                    <span className="field-error">
                      {fieldErrors.emergencyContactName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="+91 1234567890"
                    className={
                      fieldErrors.emergencyContactPhone ? "input-error" : ""
                    }
                  />
                  {fieldErrors.emergencyContactPhone && (
                    <span className="field-error">
                      {fieldErrors.emergencyContactPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>
                Bike Information{" "}
                <span className="section-required">(All fields required)</span>
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
                    className={
                      fieldErrors.bikeRegistrationNumber ? "input-error" : ""
                    }
                  />
                  {fieldErrors.bikeRegistrationNumber && (
                    <span className="field-error">
                      {fieldErrors.bikeRegistrationNumber}
                    </span>
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
                    <span className="field-error">
                      {fieldErrors.licenseNumber}
                    </span>
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
                  {formData.licenseImage && (
                    <p className="file-selected">✓ File selected</p>
                  )}
                  {fieldErrors.licenseImage && (
                    <span className="field-error">
                      {fieldErrors.licenseImage}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>
                  Medical Conditions (if any) (Write 'None' if not applicable)*
                </label>
                <textarea
                  name="anyMedicalCondition"
                  value={formData.anyMedicalCondition}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Please mention any medical conditions or allergies (Write 'None' if not applicable)"
                  className={
                    fieldErrors.anyMedicalCondition ? "input-error" : ""
                  }
                />
                {fieldErrors.anyMedicalCondition && (
                  <span className="field-error">
                    {fieldErrors.anyMedicalCondition}
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/events")}
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
              <span className="text-orange-500 font-bold">{event?.title}</span>{" "}
              has been confirmed. See you on the road!
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-xl"
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
