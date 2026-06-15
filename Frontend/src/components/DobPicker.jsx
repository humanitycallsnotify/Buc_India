import React, { useMemo } from "react";
import { Calendar } from "lucide-react";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const parseIsoDate = (value) => {
  if (!value || typeof value !== "string") {
    return { year: "", month: "", day: "" };
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { year: "", month: "", day: "" };
  }
  return { year: match[1], month: match[2], day: match[3] };
};

const getDaysInMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};

const buildIsoDate = (year, month, day) => {
  if (!year || !month || !day) return "";
  const maxDay = getDaysInMonth(year, month);
  const safeDay = Math.min(Number(day), maxDay);
  return `${year}-${month}-${String(safeDay).padStart(2, "0")}`;
};

const DobPicker = ({
  label = "Date of Birth",
  name = "dateOfBirth",
  value = "",
  onChange,
  required = false,
  icon: Icon = Calendar,
  minYear,
  maxYear,
}) => {
  const today = new Date();
  const resolvedMaxYear = maxYear ?? today.getFullYear();
  const resolvedMinYear = minYear ?? resolvedMaxYear - 100;

  const { year, month, day } = useMemo(() => parseIsoDate(value), [value]);

  const years = useMemo(() => {
    const list = [];
    for (let y = resolvedMaxYear; y >= resolvedMinYear; y -= 1) {
      list.push(y);
    }
    return list;
  }, [resolvedMaxYear, resolvedMinYear]);

  const days = useMemo(() => {
    const total = getDaysInMonth(year, month);
    return Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [year, month]);

  const emitChange = (nextYear, nextMonth, nextDay) => {
    const iso = buildIsoDate(nextYear, nextMonth, nextDay);
    onChange({ target: { name, value: iso } });
  };

  const selectClassName =
    "w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none";

  return (
    <div className="space-y-1">
      <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={16} />
          )}
          <select
            name={`${name}-year`}
            value={year}
            onChange={(e) => emitChange(e.target.value, month, day)}
            required={required}
            className={`${selectClassName} ${Icon ? "pl-12" : "pl-4"}`}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <select
          name={`${name}-month`}
          value={month}
          onChange={(e) => emitChange(year, e.target.value, day)}
          required={required}
          className={selectClassName}
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          name={`${name}-day`}
          value={day}
          onChange={(e) => emitChange(year, month, e.target.value)}
          required={required}
          className={selectClassName}
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {Number(d)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DobPicker;
