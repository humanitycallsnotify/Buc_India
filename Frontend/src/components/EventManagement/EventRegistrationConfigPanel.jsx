import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Settings2,
  User,
  Bike,
  Shield,
  HeartPulse,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Mail,
  Smartphone,
  FileText,
  Calendar,
  Users,
  IndianRupee,
} from "lucide-react";
import {
  REGISTRATION_FIELD_SECTIONS,
  QUESTION_TYPES,
  createDefaultRegistrationFields,
  createDefaultRegistrationSettings,
  createQuestionId,
} from "../../constants/eventRegistrationConfig";

const SECTION_ICONS = { User, Bike, Shield, HeartPulse };

const EventRegistrationConfigPanel = ({
  registrationFields,
  setRegistrationFields,
  registrationSettings,
  setRegistrationSettings,
  customQuestions,
  setCustomQuestions,
}) => {
  const [openSections, setOpenSections] = useState({
    fields: true,
    settings: true,
    questions: false,
    declaration: false,
  });
  const [showDeclarationPreview, setShowDeclarationPreview] = useState(false);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleField = (key, prop) => {
    setRegistrationFields((prev) => {
      const current = prev[key] || { enabled: false, required: false };
      const next = { ...current, [prop]: !current[prop] };
      if (prop === "enabled" && !next.enabled) next.required = false;
      return { ...prev, [key]: next };
    });
  };

  const updateSetting = (name, value) => {
    setRegistrationSettings((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: createQuestionId(),
        label: "",
        type: "text",
        required: false,
        options: [],
        order: prev.length,
      },
    ]);
    setOpenSections((p) => ({ ...p, questions: true }));
  };

  const updateQuestion = (id, patch) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const removeQuestion = (id) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const moveQuestion = (index, direction) => {
    setCustomQuestions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
  };

  const CollapseHeader = ({ id, title, icon: Icon, accent = "text-copper" }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-5 bg-carbon border border-white/10 hover:border-copper/40 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-sm bg-copper/10 ${accent}`}>
          <Icon size={18} />
        </div>
        <span className="font-heading text-lg uppercase text-white tracking-wide">{title}</span>
      </div>
      <ChevronDown
        size={20}
        className={`text-steel-dim transition-transform duration-300 ${openSections[id] ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <div className="md:col-span-2 space-y-4 border-t border-white/5 pt-8">
      <div className="flex items-center gap-3 mb-2">
        <Settings2 className="text-copper" size={22} />
        <h4 className="font-heading text-2xl uppercase text-white">
          Registration Form <span className="text-copper">Configuration</span>
        </h4>
      </div>
      <p className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-6">
        Configure fields, settings, and custom questions for this event&apos;s registration form.
      </p>

      {/* Field sections */}
      <CollapseHeader id="fields" title="Form Fields" icon={Settings2} />
      <AnimatePresence>
        {openSections.fields && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            {REGISTRATION_FIELD_SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section.icon] || User;
              return (
                <div key={section.id} className="bg-carbon-light border border-white/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <Icon size={16} className="text-copper" />
                    <span className="font-body text-[10px] uppercase tracking-widest text-copper font-bold">
                      {section.title}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.fields.map(({ key, label }) => (
                      <div
                        key={key}
                        className="bg-carbon border border-white/10 p-4 rounded-sm hover:border-copper/30 transition-colors"
                      >
                        <p className="font-body text-xs text-white font-bold mb-3">{label}</p>
                        <label className="flex items-center gap-2 cursor-pointer text-steel-dim text-[10px] uppercase tracking-wider mb-2">
                          <input
                            type="checkbox"
                            checked={registrationFields[key]?.enabled !== false}
                            onChange={() => toggleField(key, "enabled")}
                            className="w-4 h-4 accent-amber-500"
                          />
                          Enabled
                        </label>
                        <label
                          className={`flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-wider ${
                            registrationFields[key]?.enabled === false
                              ? "opacity-40 pointer-events-none"
                              : "text-steel-dim"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={registrationFields[key]?.required === true}
                            onChange={() => toggleField(key, "required")}
                            disabled={registrationFields[key]?.enabled === false}
                            className="w-4 h-4 accent-amber-500"
                          />
                          Required
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <CollapseHeader id="settings" title="Registration Settings" icon={Calendar} />
      <AnimatePresence>
        {openSections.settings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-carbon-light border border-white/5 p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">
                Registration Opens
              </label>
              <input
                type="date"
                value={registrationSettings.registrationOpenDate || ""}
                onChange={(e) => updateSetting("registrationOpenDate", e.target.value)}
                className="w-full bg-carbon border border-white/10 p-3 font-body text-xs text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">
                Registration Closes
              </label>
              <input
                type="date"
                value={registrationSettings.registrationCloseDate || ""}
                onChange={(e) => updateSetting("registrationCloseDate", e.target.value)}
                className="w-full bg-carbon border border-white/10 p-3 font-body text-xs text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold flex items-center gap-2">
                <Users size={12} /> Capacity
              </label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={registrationSettings.capacity || ""}
                onChange={(e) => updateSetting("capacity", e.target.value)}
                className="w-full bg-carbon border border-white/10 p-3 font-body text-xs text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold flex items-center gap-2">
                <IndianRupee size={12} /> Registration Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Free"
                value={registrationSettings.registrationFee || ""}
                onChange={(e) => updateSetting("registrationFee", e.target.value)}
                className="w-full bg-carbon border border-white/10 p-3 font-body text-xs text-white"
              />
            </div>
            {[
              { key: "waitingListEnabled", label: "Enable waiting list when full" },
              { key: "allowDuplicateRegistration", label: "Allow duplicate registration" },
              { key: "autoCloseWhenFull", label: "Auto-close when capacity reached" },
              { key: "verifyEmailOtp", label: "Email OTP verification", icon: Mail },
              { key: "verifyMobileOtp", label: "Mobile OTP (when available)", icon: Smartphone, disabled: true },
              { key: "requireDeclaration", label: "Require declaration acceptance" },
            ].map(({ key, label, icon: Icon, disabled }) => (
              <label
                key={key}
                className={`flex items-center gap-3 bg-carbon border border-white/10 p-4 cursor-pointer ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={registrationSettings[key] === true}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 accent-amber-500"
                />
                {Icon && <Icon size={14} className="text-copper" />}
                <span className="font-body text-xs text-white">{label}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Declaration */}
      <CollapseHeader id="declaration" title="Declaration" icon={FileText} />
      <AnimatePresence>
        {openSections.declaration && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-carbon-light border border-white/5 p-6 space-y-4"
          >
            <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">
              Custom declaration text (leave empty for default terms)
            </label>
            <textarea
              rows={5}
              value={registrationSettings.declarationText || ""}
              onChange={(e) => updateSetting("declarationText", e.target.value)}
              placeholder="Enter declaration text shown to registrants..."
              className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white resize-none"
            />
            <button
              type="button"
              onClick={() => setShowDeclarationPreview(!showDeclarationPreview)}
              className="flex items-center gap-2 text-copper font-body text-[10px] uppercase tracking-widest font-bold"
            >
              <Eye size={14} /> {showDeclarationPreview ? "Hide Preview" : "Preview Declaration"}
            </button>
            {showDeclarationPreview && (
              <div className="bg-carbon border border-copper/20 p-4 text-steel-dim text-sm whitespace-pre-wrap">
                {registrationSettings.declarationText?.trim() ||
                  "Default BUC India Terms & Conditions will be shown to registrants."}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom questions */}
      <CollapseHeader id="questions" title="Custom Questions" icon={Plus} />
      <AnimatePresence>
        {openSections.questions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-carbon-light border border-white/5 p-6 space-y-4"
          >
            {customQuestions.map((q, index) => (
              <div key={q.id} className="bg-carbon border border-white/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <GripVertical size={16} className="text-steel-dim mt-2 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Question label"
                      value={q.label}
                      onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                      className="bg-carbon-light border border-white/10 p-3 font-body text-xs text-white md:col-span-2"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value })}
                      className="bg-carbon-light border border-white/10 p-3 font-body text-xs text-white"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-steel-dim">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                        className="accent-amber-500"
                      />
                      Required
                    </label>
                    {["dropdown", "radio"].includes(q.type) && (
                      <input
                        type="text"
                        placeholder="Options (comma-separated)"
                        value={(q.options || []).join(", ")}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                          })
                        }
                        className="bg-carbon-light border border-white/10 p-3 font-body text-xs text-white md:col-span-2"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => moveQuestion(index, -1)} className="text-steel-dim hover:text-white text-xs px-2">↑</button>
                    <button type="button" onClick={() => moveQuestion(index, 1)} className="text-steel-dim hover:text-white text-xs px-2">↓</button>
                    <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 border border-dashed border-copper/40 text-copper px-4 py-3 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-copper/10 transition-colors"
            >
              <Plus size={14} /> Add Question
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventRegistrationConfigPanel;

export {
  createDefaultRegistrationFields,
  createDefaultRegistrationSettings,
};
