import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Send } from "lucide-react";
import BackButton from "./BackButton";
import TermsModal from "./TermsModal";
import { membershipApplicationService } from "../services/api";
import {
  MEMBERSHIP_APPLICATION_TERMS,
  MEMBERSHIP_FINAL_ACCEPTANCE,
} from "../constants/membershipApplicationTerms";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  bike: "",
  experience: "",
  motivation: "",
};

const MembershipApplication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the Volunteer Terms & Conditions");
      return;
    }
    setSubmitting(true);
    try {
      await membershipApplicationService.submit({
        ...form,
        termsAccepted: true,
      });
      toast.success("Application submitted! Our team will review it soon.");
      setForm(initialForm);
      setTermsAccepted(false);
      navigate("/members");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-carbon text-white py-24">
      <div className="max-w-3xl mx-auto px-6">
        <BackButton fallback="/members" label="Back to Members" />

        <div className="mt-8 mb-12">
          <span className="text-copper font-body text-xs uppercase tracking-[0.3em] font-bold">
            Brotherhood Application
          </span>
          <h1 className="font-heading text-5xl md:text-6xl uppercase mt-2 leading-none">
            Apply For{" "}
            <span className="text-copper">Membership</span>
          </h1>
          <p className="font-text text-steel-dim mt-4">
            This is separate from event registration. Tell us about yourself and
            why you want to join BUC India.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { name: "fullName", label: "Full Name", required: true },
            { name: "phone", label: "Phone", required: true, type: "tel" },
            { name: "email", label: "Email", required: true, type: "email" },
            { name: "city", label: "City", required: true },
            { name: "state", label: "State", required: true },
            { name: "bike", label: "Bike Model", required: true },
          ].map(({ name, label, required, type = "text" }) => (
            <div key={name}>
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim block mb-2">
                {label}
              </label>
              <input
                type={type}
                value={form[name]}
                onChange={(e) => update(name, e.target.value)}
                required={required}
                className="w-full bg-carbon-light border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper"
              />
            </div>
          ))}

          <div>
            <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim block mb-2">
              Riding Experience
            </label>
            <textarea
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              rows={3}
              className="w-full bg-carbon-light border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper resize-none"
              placeholder="Years riding, types of rides, clubs..."
            />
          </div>

          <div>
            <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim block mb-2">
              Why do you want to join BUC India? *
            </label>
            <textarea
              value={form.motivation}
              onChange={(e) => update("motivation", e.target.value)}
              required
              rows={4}
              className="w-full bg-carbon-light border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper resize-none"
            />
          </div>

          <div className="flex items-start gap-3 pt-4">
            <input
              id="membershipTerms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 accent-copper"
            />
            <label htmlFor="membershipTerms" className="font-text text-xs text-steel-dim leading-relaxed cursor-pointer">
              I accept the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-copper underline hover:text-white"
              >
                Volunteer Terms & Conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-copper text-carbon font-heading text-xl uppercase hover:bg-white transition-colors disabled:opacity-50"
          >
            <Send size={20} />
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          title="Membership Application Terms"
          subtitle="Volunteer Terms & Conditions"
          introText="By applying for BUC India membership, I agree to the following:"
          terms={MEMBERSHIP_APPLICATION_TERMS}
          finalAcceptanceTitle="Final Acceptance"
          finalAcceptanceItems={MEMBERSHIP_FINAL_ACCEPTANCE}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
        />
      </div>
    </section>
  );
};

export default MembershipApplication;

