import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, MapPin, Music, Star, Clock, Link, Bike,
  FileText, Calendar, Trophy, CheckCircle, Shield, ChevronDown
} from "lucide-react";
import { talentService } from "../services/api";

const TALENT_CATEGORIES = {
  "🎤 Performing Arts": [
    "Singing (Solo)", "Singing (Group/Band)", "Rap / Beatboxing",
    "Dancing (Solo)", "Dancing (Group)", "Choreography",
    "Instrument Playing (Guitar, Drums, Violin, etc.)",
    "DJ / Music Mixing", "Acting / Drama", "Stand-up Comedy", "Mimicry",
  ],
  "🎨 Creative Arts": [
    "Drawing / Sketching", "Painting", "Digital Art / Graphic Design",
    "Photography", "Videography", "Short Film Making",
    "Content Creation (YouTube / Reels)",
  ],
  "🏍️ Biker & Event-Specific Talents": [
    "Riding Skills (Slow Race, Balance, Control)", "Motorcycle Vlogging",
    "Travel Storytelling", "Bike Maintenance Skills Demo",
  ],
  "🧠 Skills & Knowledge": [
    "Public Speaking", "Anchoring / Hosting", "Motivational Speaking",
    "Storytelling", "Debate",
  ],
  "💪 Fitness & Performance": [
    "Fitness / Bodybuilding", "Yoga / Flexibility", "Martial Arts",
    "Parkour / Freestyle Movement",
  ],
  "🎭 Others": [
    "Magic Show", "Fashion Walk / Modeling",
    "Unique Talent (Specify)", "Other (Please Specify)",
  ],
};

const ALL_SUBCATEGORIES = Object.entries(TALENT_CATEGORIES).flatMap(([group, items]) =>
  items.map(item => ({ group, item }))
);

const initialFormData = {
  fullName: "", age: "", gender: "", phone: "", email: "", city: "",
  talentCategory: "", subTalentDescription: "",
  experienceLevel: "", yearsOfExperience: "",
  portfolioLink: "",
  isRider: "", bikeModel: "", ridingExperience: "",
  shortDescription: "", whyParticipate: "",
  availableDates: "",
  openToPerformLive: "", openToCompetition: "",
  pastAchievements: "", socialMediaLinks: "",
  consentInfoTrue: false, consentRules: false, consentMedia: false,
};

const TalentRegistrationForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setFormData(prev => ({ ...prev, talentCategory: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "fullName", "age", "gender", "phone", "email", "city",
      "talentCategory", "subTalentDescription", "experienceLevel", "yearsOfExperience",
      "shortDescription", "whyParticipate", "availableDates",
    ];
    for (const field of required) {
      if (!formData[field]) {
        return toast.error(`Please fill in: ${field.replace(/([A-Z])/g, " $1")}`);
      }
    }
    if (!formData.consentInfoTrue || !formData.consentRules || !formData.consentMedia) {
      return toast.error("Please check all three consent checkboxes before submitting.");
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      await talentService.submit(payload);
      setShowSuccess(true);
      setFormData(initialFormData);
      setSelectedGroup("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-12 md:p-20 text-center animate-fade-in text-white bg-carbon-light border border-white/5 flex flex-col justify-center items-center">
        <div className="w-24 h-24 bg-copper/10 rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="text-copper" size={48} />
        </div>
        <h2 className="font-heading text-4xl uppercase mb-4">Registration Successful!</h2>
        <p className="font-text text-steel-dim mb-8 max-w-lg">
          Your talent registration has been submitted successfully. Our team will review your profile and get in touch!
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          className="px-10 py-4 bg-copper text-carbon font-heading text-lg uppercase hover:bg-white transition-all duration-300"
        >
          Submit Another
        </button>
      </div>
    );
  }

  const subcatsForGroup = selectedGroup
    ? (TALENT_CATEGORIES[selectedGroup] || [])
    : [];

  return (
    <div className="bg-carbon-light border border-white/5 text-white max-w-4xl mx-auto p-6 md:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-8 mb-12 gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="BUC India Logo" className="w-16 h-16 rounded-full border border-copper/30 object-cover" />
          <div>
            <h1 className="font-heading text-3xl uppercase tracking-wider text-white">BUC India</h1>
            <span className="text-copper font-body text-[10px] tracking-[0.2em] uppercase">Bikers Unity Calls</span>
          </div>
        </div>
        <h2 className="font-heading text-2xl uppercase flex items-center gap-3 text-steel-dim sm:border-l sm:border-white/10 sm:pl-8">
          <Star size={24} className="text-copper" /> Talent Registration
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* Basic Details */}
        <Section title="👤 Basic Details" required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="fullName" icon={User} value={formData.fullName} onChange={handleChange} required />
            <InputField label="Age" name="age" type="number" icon={Clock} value={formData.age} onChange={handleChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors appearance-none">
                <option value="">Select Gender</option>
                {["Male", "Female", "Other", "Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <InputField label="Phone Number" name="phone" type="tel" icon={Phone} value={formData.phone} onChange={handleChange} required />
            <InputField label="Email ID" name="email" type="email" icon={Mail} value={formData.email} onChange={handleChange} required />
            <InputField label="City / Location" name="city" icon={MapPin} value={formData.city} onChange={handleChange} required />
          </div>
        </Section>

        {/* Talent Details */}
        <Section title="🎯 Talent Details" required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Talent Category Group Dropdown */}
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Talent Group <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors appearance-none"
                >
                  <option value="">Select Talent Group</option>
                  {Object.keys(TALENT_CATEGORIES).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={14} />
              </div>
            </div>

            {/* Talent Sub-category Dropdown */}
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Talent Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="talentCategory"
                  value={formData.talentCategory}
                  onChange={handleChange}
                  required
                  disabled={!selectedGroup}
                  className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors appearance-none disabled:opacity-40"
                >
                  <option value="">Select Specific Talent</option>
                  {subcatsForGroup.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={14} />
              </div>
            </div>

            <div className="md:col-span-2">
              <TextAreaField label="Sub-Talent / Description" name="subTalentDescription" value={formData.subTalentDescription} onChange={handleChange} required placeholder="Describe your specific talent in detail..." />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Experience Level <span className="text-red-500">*</span></label>
              <div className="flex gap-4 mt-2 flex-wrap">
                {["Beginner", "Intermediate", "Professional"].map(level => (
                  <label key={level} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${formData.experienceLevel === level ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="experienceLevel" value={level} checked={formData.experienceLevel === level} onChange={handleChange} className="hidden" />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <InputField label="Years of Experience" name="yearsOfExperience" type="number" icon={Clock} value={formData.yearsOfExperience} onChange={handleChange} required />
          </div>
        </Section>

        {/* Proof of Talent */}
        <Section title="🎥 Proof of Talent">
          <InputField label="Portfolio Link (Google Drive / YouTube / Instagram)" name="portfolioLink" icon={Link} value={formData.portfolioLink} onChange={handleChange} placeholder="https://..." />
        </Section>

        {/* Biker Info */}
        <Section title="🏍️ Biker Info (Optional)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Are you a Rider?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.isRider === "true" && opt === "Yes") || (formData.isRider === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="isRider" value={opt === "Yes" ? "true" : "false"} checked={formData.isRider === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <InputField label="Bike Model" name="bikeModel" icon={Bike} value={formData.bikeModel} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Riding Experience" name="ridingExperience" icon={Bike} value={formData.ridingExperience} onChange={handleChange} placeholder="e.g. 5 years touring rider..." />
            </div>
          </div>
        </Section>

        {/* Additional Info */}
        <Section title="📝 Additional Info" required>
          <div className="space-y-6">
            <TextAreaField label="Short Description About Yourself" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required placeholder="Tell us about yourself in 2-3 sentences..." />
            <TextAreaField label="Why Do You Want to Participate?" name="whyParticipate" value={formData.whyParticipate} onChange={handleChange} required placeholder="Share your motivation..." />
          </div>
        </Section>

        {/* Availability */}
        <Section title="📅 Availability" required>
          <InputField label="Available Dates" name="availableDates" icon={Calendar} value={formData.availableDates} onChange={handleChange} required placeholder="e.g. June 15-20, July weekends..." />
        </Section>

        {/* Pro Filter */}
        <Section title="💡 Participation Preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Open to Perform Live on Stage?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.openToPerformLive === "true" && opt === "Yes") || (formData.openToPerformLive === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="openToPerformLive" value={opt === "Yes" ? "true" : "false"} checked={formData.openToPerformLive === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Open for Competition?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.openToCompetition === "true" && opt === "Yes") || (formData.openToCompetition === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="openToCompetition" value={opt === "Yes" ? "true" : "false"} checked={formData.openToCompetition === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Optional */}
        <Section title="🏆 Optional Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField label="Past Achievements / Awards" name="pastAchievements" value={formData.pastAchievements} onChange={handleChange} placeholder="List any awards, achievements, or recognitions..." />
            <TextAreaField label="Social Media Links" name="socialMediaLinks" value={formData.socialMediaLinks} onChange={handleChange} placeholder="Instagram, YouTube, Facebook links..." />
          </div>
        </Section>

        {/* Legal Consent */}
        <Section title="⚠️ Legal & Consent">
          <div className="space-y-4">
            {[
              { name: "consentInfoTrue", label: "I confirm all information provided is true and accurate." },
              { name: "consentRules", label: "I agree to the event rules & safety guidelines." },
              { name: "consentMedia", label: "I give permission to use my photos/videos for promotion." },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name={name}
                  checked={formData[name]}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-copper bg-carbon border border-white/10 cursor-pointer"
                />
                <span className="font-text text-xs text-steel-dim group-hover:text-white transition-colors leading-relaxed">
                  {label} <span className="text-red-500">*</span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Talent Registration"}
        </button>
      </form>
    </div>
  );
};

const Section = ({ title, required, children }) => (
  <div className="space-y-6">
    <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
      {title} {required && <span className="text-red-500">*</span>}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, icon: Icon, name, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div className="space-y-1">
    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-carbon border border-white/10 ${Icon ? "pl-12" : "pl-4"} pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors placeholder:text-white/20`}
      />
    </div>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, required = false, placeholder = "" }) => (
  <div className="space-y-1">
    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={3}
      placeholder={placeholder}
      className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors resize-none placeholder:text-white/20"
    />
  </div>
);

export default TalentRegistrationForm;
