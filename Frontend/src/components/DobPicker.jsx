import React, { useEffect, useMemo, useRef, useState } from "react";
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
  if (!match) return { year: "", month: "", day: "" };
  return { year: match[1], month: match[2], day: match[3] };
};

const isoToDisplay = (iso) => {
  const { year, month, day } = parseIsoDate(iso);
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const formatDobInput = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
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

const isValidIsoDate = (iso) => {
  const { year, month, day } = parseIsoDate(iso);
  if (!year || !month || !day) return false;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date <= today
  );
};

const displayToIso = (display) => {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const iso = buildIsoDate(match[3], match[2], match[1]);
  return isValidIsoDate(iso) ? iso : "";
};

const DobPicker = ({
  label = "Date of Birth",
  name = "dateOfBirth",
  value = "",
  onChange,
  required = false,
  minYear,
  maxYear,
}) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const today = new Date();
  const resolvedMaxYear = maxYear ?? today.getFullYear();
  const resolvedMinYear = minYear ?? resolvedMaxYear - 100;

  const [inputText, setInputText] = useState(() => isoToDisplay(value));
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState("");
  const [pickerMonth, setPickerMonth] = useState("");
  const [pickerDay, setPickerDay] = useState("");

  useEffect(() => {
    setInputText(isoToDisplay(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const years = useMemo(() => {
    const list = [];
    for (let y = resolvedMaxYear; y >= resolvedMinYear; y -= 1) {
      list.push(y);
    }
    return list;
  }, [resolvedMaxYear, resolvedMinYear]);

  const pickerDays = useMemo(() => {
    const total = getDaysInMonth(pickerYear, pickerMonth);
    return Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [pickerYear, pickerMonth]);

  const emitChange = (iso) => {
    onChange({ target: { name, value: iso } });
  };

  const openPicker = () => {
    const parsed = parseIsoDate(value);
    setPickerYear(parsed.year || String(resolvedMaxYear - 25));
    setPickerMonth(parsed.month || "01");
    setPickerDay(parsed.day || "01");
    setIsOpen(true);
  };

  const applyPickerSelection = (year, month, day) => {
    const iso = buildIsoDate(year, month, day);
    if (!isValidIsoDate(iso)) return;
    setInputText(isoToDisplay(iso));
    emitChange(iso);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const formatted = formatDobInput(e.target.value);
    setInputText(formatted);

    if (formatted.length === 10) {
      const iso = displayToIso(formatted);
      if (iso) emitChange(iso);
    } else if (value) {
      emitChange("");
    }
  };

  const handleInputBlur = () => {
    if (!inputText.trim()) {
      emitChange("");
      return;
    }
    const iso = displayToIso(inputText);
    if (iso) {
      setInputText(isoToDisplay(iso));
      emitChange(iso);
    } else {
      setInputText(isoToDisplay(value));
    }
  };

  const handlePickerChange = (part, partValue) => {
    let nextYear = pickerYear;
    let nextMonth = pickerMonth;
    let nextDay = pickerDay;

    if (part === "year") nextYear = partValue;
    if (part === "month") nextMonth = partValue;
    if (part === "day") nextDay = partValue;

    setPickerYear(nextYear);
    setPickerMonth(nextMonth);
    setPickerDay(nextDay);

    if (nextYear && nextMonth && nextDay) {
      const maxDay = getDaysInMonth(nextYear, nextMonth);
      const safeDay = Math.min(Number(nextDay), maxDay);
      const safeDayStr = String(safeDay).padStart(2, "0");
      if (safeDayStr !== nextDay) setPickerDay(safeDayStr);
      applyPickerSelection(nextYear, nextMonth, safeDayStr);
    }
  };

  const selectClassName =
    "w-full bg-carbon border border-white/10 px-3 py-2.5 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none";

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Calendar
          className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none"
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          required={required}
          placeholder="DD/MM/YYYY"
          inputMode="numeric"
          autoComplete="bday"
          maxLength={10}
          className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
          aria-label="Open date picker"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-steel-dim hover:text-copper transition-colors"
        >
          <Calendar size={16} />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 p-4 bg-carbon-light border border-white/10 shadow-xl">
            <p className="font-body text-[10px] uppercase tracking-widest text-copper mb-3">
              Select Date of Birth
            </p>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={pickerYear}
                onChange={(e) => handlePickerChange("year", e.target.value)}
                className={selectClassName}
                aria-label="Year"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={pickerMonth}
                onChange={(e) => handlePickerChange("month", e.target.value)}
                className={selectClassName}
                aria-label="Month"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={pickerDay}
                onChange={(e) => handlePickerChange("day", e.target.value)}
                className={selectClassName}
                aria-label="Day"
              >
                <option value="">Day</option>
                {pickerDays.map((d) => (
                  <option key={d} value={d}>
                    {Number(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DobPicker;
