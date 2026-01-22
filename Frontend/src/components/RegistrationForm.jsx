import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { registrationService } from "../services/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bike,
  Check,
  UserPlus,
  X,
  CreditCard,
  Image as ImageIcon,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const RegistrationForm = ({ isOpen, onClose, type, eventTitle, eventId }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bikeModel: "",
    bikeYear: "",
    bikeRegistrationNumber: "",
    ridingExperience: "",
    licenseNumber: "",
    licenseProof: null,
    emergencyContact: "",
    emergencyPhone: "",
    gender: "",
    bloodGroup: "",
    medicalCondition: "None",
    tShirtSize: "L",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split("T")[0];
  }, []);

  const exportToExcel = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${type === "community" ? "community" : "event"}-registration-${timestamp}.xlsx`;

    const row = {
      Type: type,
      EventTitle: type === "event" ? (eventTitle ?? "") : "",
      FirstName: formData.firstName,
      LastName: formData.lastName,
      Email: formData.email,
      Phone: formData.phone,
      DOB: formData.dob,
      Address: formData.address,
      City: formData.city,
      State: formData.state,
      Pincode: formData.pincode,
      BikeModel: formData.bikeModel,
      BikeYear: formData.bikeYear,
      BikeRegistrationNumber: formData.bikeRegistrationNumber,
      RidingExperience: formData.ridingExperience,
      LicenseNumber: formData.licenseNumber,
      EmergencyContact: formData.emergencyContact,
      EmergencyPhone: formData.emergencyPhone,
      BloodGroup: formData.bloodGroup,
      Gender: formData.gender,
      MedicalCondition: formData.medicalCondition,
      TShirtSize: formData.tShirtSize,
      SubmittedAt: new Date().toLocaleString(),
    };

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([row]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    XLSX.writeFile(workbook, fileName);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "licenseProof") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const formatWhatsAppMessage = () => {
    const title =
      type === "community"
        ? "New Community Registration"
        : `Event Registration - ${eventTitle}`;
    return `*${title}*

*Personal Information:*
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
DOB: ${formData.dob}

*Address:*
${formData.address}
${formData.city}, ${formData.state}

*Motorcycle Information:*
Bike: ${formData.bikeModel} (${formData.bikeYear})
Registration Number: ${formData.bikeRegistrationNumber}
Riding Experience: ${formData.ridingExperience}
License Number: ${formData.licenseNumber}

*Emergency Contact:*
Name: ${formData.emergencyContact}
Phone: ${formData.emergencyPhone}

Registration completed successfully!`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.phone === formData.emergencyPhone) {
      setError("Phone number and emergency contact number must be different.");
      return;
    }

    const birthDate = new Date(formData.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("eventId", eventId || "community"); // Fallback for community registration
      data.append("fullName", `${formData.firstName} ${formData.lastName}`);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("dateOfBirth", formData.dob);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("pincode", formData.pincode);
      data.append("emergencyContactName", formData.emergencyContact);
      data.append("emergencyContactPhone", formData.emergencyPhone);
      data.append("bikeModel", formData.bikeModel);
      data.append("bikeRegistrationNumber", formData.bikeRegistrationNumber);
      data.append("licenseNumber", formData.licenseNumber);
      data.append("anyMedicalCondition", formData.medicalCondition);
      data.append("tShirtSize", formData.tShirtSize);
      if (formData.licenseProof) {
        data.append("licenseImage", formData.licenseProof);
      }

      await registrationService.create(data);

      const message = formatWhatsAppMessage();
      const whatsappUrl = `https://wa.me/918867718080?text=${encodeURIComponent(message)}`;

      exportToExcel();
      setShowSuccess(true);
      toast.success("Registration successful!");

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 1000);

      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dob: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          bikeModel: "",
          bikeYear: "",
          bikeRegistrationNumber: "",
          ridingExperience: "",
          licenseNumber: "",
          licenseProof: null,
          emergencyContact: "",
          emergencyPhone: "",
          gender: "",
          bloodGroup: "",
          medicalCondition: "None",
          tShirtSize: "L",
        });
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = showSuccess ? (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center border border-green-500">
        <div className="mb-6">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {type === "community"
              ? "Registration Successful!"
              : "Event Registration Complete!"}
          </h3>
          <p className="text-gray-300">
            Your registration details have been saved to Excel and are being
            sent to WhatsApp. You will be redirected automatically.
          </p>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
      <div className="bg-gray-900 w-full h-full max-w-none max-h-none rounded-none border-t border-gray-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60 backdrop-blur">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <UserPlus className="h-6 w-6 text-orange-500 mr-2" />
            {type === "community"
              ? "Join Community"
              : `Register for ${eventTitle}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm text-center font-medium">
                <ShieldCheck className="h-4 w-4 inline-block mr-2" />
                Privacy Assurance: Your information is protected by industry-standard encryption. We maintain strict confidentiality and will never share your personal data with third parties without your explicit consent.
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 text-orange-500 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1 ml-1">
                      Date of Birth (Must be 18+)
                    </label>
                    <input
                      type="date"
                      name="dob"
                      max={maxDate}
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none w-full"
                      required
                    />
                  </div>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  >
                    <option value="">Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nottosay">Prefer not to say</option>
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="md:col-span-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 text-orange-500 mr-2" />
                  Health & Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="medicalCondition"
                    placeholder="Any Medical Condition? (Type 'None' if none)"
                    value={formData.medicalCondition}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <select
                    name="tShirtSize"
                    value={formData.tShirtSize}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  >
                    <option value="">Select T-Shirt Size</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Bike className="h-5 w-5 text-orange-500 mr-2" />
                  Motorcycle Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="bikeModel"
                    placeholder="Bike Make & Model"
                    value={formData.bikeModel}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    name="bikeYear"
                    placeholder="Year"
                    value={formData.bikeYear}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="bikeRegistrationNumber"
                    placeholder="Registration Number"
                    value={formData.bikeRegistrationNumber}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <select
                    name="ridingExperience"
                    value={formData.ridingExperience}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  >
                    <option value="">Riding Experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">
                      Intermediate (3-5 years)
                    </option>
                    <option value="experienced">
                      Experienced (6-10 years)
                    </option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 text-orange-500 mr-2" />
                  License Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Driving License Number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1 ml-1 flex items-center">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Upload License Proof (Photo)
                    </label>
                    <input
                      type="file"
                      name="licenseProof"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Phone className="h-5 w-5 text-orange-500 mr-2" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Emergency Contact Name"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="Emergency Contact Phone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
                <ShieldCheck className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="text-blue-400 font-medium">Privacy Assurance:</span> Your information is protected by industry-standard encryption. We maintain strict confidentiality and will never share your personal data with third parties without your explicit consent.
                </p>
              </div>

              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>
                        {type === "community"
                          ? "Join Community"
                          : "Register for Event"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RegistrationForm;
