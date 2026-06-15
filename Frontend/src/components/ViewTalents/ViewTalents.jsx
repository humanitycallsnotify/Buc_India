import React, { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, X, Star, Trash2 } from "lucide-react";
import { talentService } from "../../services/api";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const EXPERIENCE_LEVELS = ["All", "Beginner", "Intermediate", "Professional"];

const ViewTalents = () => {
  const [talents, setTalents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [talentToDelete, setTalentToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await talentService.getAll();
      setTalents(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading talents:", error);
      alert("Failed to load talent registrations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const confirmDelete = async () => {
    if (!talentToDelete) return;
    try {
      await talentService.delete(talentToDelete);
      loadData(); // Refresh the list
      setTalentToDelete(null);
    } catch (error) {
      console.error("Error deleting talent:", error);
      alert("Failed to delete talent registration.");
    }
  };

  const applyFilters = useCallback(() => {
    let result = [...talents];
    if (filterName.trim()) {
      result = result.filter(t =>
        (t.fullName && t.fullName.toLowerCase().includes(filterName.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(filterName.toLowerCase())) ||
        (t.talentCategory && t.talentCategory.toLowerCase().includes(filterName.toLowerCase()))
      );
    }
    if (filterLevel !== "All") {
      result = result.filter(t => t.experienceLevel === filterLevel);
    }
    setFiltered(result);
  }, [talents, filterName, filterLevel]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const TABLE_COLUMNS = [
    { key: "sno", label: "S.No" },
    { key: "actions", label: "Actions" },
    { key: "bucId", label: "BUC ID" },
    { key: "fullName", label: "Full Name" },
    { key: "age", label: "Age" },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    { key: "talentCategory", label: "Talent" },
    { key: "subTalentDescription", label: "Description" },
    { key: "experienceLevel", label: "Experience" },
    { key: "yearsOfExperience", label: "Years Exp." },
    { key: "portfolioLink", label: "Portfolio" },
    { key: "isRider", label: "Rider?" },
    { key: "bikeModel", label: "Bike Model" },
    { key: "openToPerformLive", label: "Live Perf?" },
    { key: "openToCompetition", label: "Competition?" },
    { key: "shortDescription", label: "About" },
    { key: "availableDates", label: "Available Dates" },
    { key: "pastAchievements", label: "Achievements" },
    { key: "socialMediaLinks", label: "Social Links" },
    { key: "createdAt", label: "Registered On" },
  ];

  const renderCell = (col, talent, index) => {
    if (col.key === "sno") return index + 1;
    if (col.key === "actions") {
      return (
        <button
          onClick={() => setTalentToDelete(talent._id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete Registration"
        >
          <Trash2 size={18} />
        </button>
      );
    }
    
    const val = talent[col.key];
    if (val === null || val === undefined || val === "") return "-";
    if (col.key === "isRider" || col.key === "openToPerformLive" || col.key === "openToCompetition") {
      return val ? "Yes" : "No";
    }
    if (col.key === "portfolioLink" && val) {
      return <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">View Link</a>;
    }
    if (col.key === "createdAt" && val) {
      try {
        return new Date(val).toLocaleDateString();
      } catch { return val; }
    }
    if (col.key === "dateOfBirth" && val) {
      try {
        return new Date(val).toLocaleDateString();
      } catch { return val; }
    }
    return String(val);
  };

  const getAvailableFields = () => {
    return TABLE_COLUMNS.filter(c => c.key !== "sno" && c.key !== "actions");
  };

  const handleExportClick = (type) => {
    if (filtered.length === 0) {
      alert("No talents to export");
      return;
    }
    const fields = getAvailableFields();
    setAvailableFields(fields);
    setSelectedFields(fields.map((f) => f.key));
    setExportType(type);
    setShowExportModal(true);
  };

  const handleExportConfirm = () => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export");
      return;
    }
    setShowExportModal(false);

    const title = `BUC India - Talent Registrations${filterLevel !== "All" ? ` (${filterLevel})` : ""}`;
    
    if (exportType === "excel") {
      exportToExcel(filtered, null, selectedFields);
    } else if (exportType === "pdf") {
      exportToPDF(filtered, null, selectedFields, { eventTitle: title });
    }

    setExportType(null);
    setSelectedFields([]);
  };

  const handleExportCancel = () => {
    setShowExportModal(false);
    setExportType(null);
    setSelectedFields([]);
  };

  const toggleFieldSelection = (fieldKey) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => setSelectedFields(availableFields.map((f) => f.key));
  const deselectAllFields = () => setSelectedFields([]);

  return (
    <div className="view-registrations">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={20} style={{ color: "#c19a6b" }} /> Talent Registrations
          </h1>
          <p className="page-subtitle">
            Total: {filtered.length} talent(s)
            {filterLevel !== "All" && <span style={{ color: "#c19a6b", marginLeft: 8 }}>— {filterLevel}</span>}
          </p>
        </div>
        <div className="header-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
          <input
            type="text"
            placeholder="Search name, email or talent..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-input"
            style={{ minWidth: 140 }}
          >
            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {(filterName || filterLevel !== "All") && (
            <button onClick={() => { setFilterName(""); setFilterLevel("All"); }} className="clear-filters-button" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <X size={14} /> Clear
            </button>
          )}
          <button
            onClick={() => handleExportClick("excel")}
            className="refresh-button"
            title="Export to Excel"
            style={{ background: "#217346", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={16} /> Excel
          </button>
          <button
            onClick={() => handleExportClick("pdf")}
            className="refresh-button"
            title="Export to PDF"
            style={{ background: "#c19a6b", color: "#111", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={16} /> PDF
          </button>
          <button onClick={loadData} className="refresh-button" title="Refresh" disabled={isLoading}>
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Experience Level Filter Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {EXPERIENCE_LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            style={{
              padding: "4px 14px", borderRadius: 999,
              border: filterLevel === level ? "1px solid #c19a6b" : "1px solid rgba(255,255,255,0.1)",
              background: filterLevel === level ? "rgba(193,154,107,0.15)" : "transparent",
              color: filterLevel === level ? "#c19a6b" : "#888",
              fontSize: 10, fontWeight: "bold", textTransform: "uppercase",
              letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {level}
            {level !== "All" && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({talents.filter(t => t.experienceLevel === level).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading talent registrations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No talent registrations found.</p>
        </div>
      ) : (
        <div className="registrations-table-container">
          <table className="registrations-table">
            <thead>
              <tr>{TABLE_COLUMNS.map(col => <th key={col.key}>{col.label}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((talent, index) => (
                <tr key={talent._id || index}>
                  {TABLE_COLUMNS.map(col => (
                    <td key={`${talent._id}-${col.key}`}>{renderCell(col, talent, index)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showExportModal && (
        <div className="export-modal-overlay" onClick={handleExportCancel} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()} style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", width: "90%", maxWidth: "500px", display: "flex", flexDirection: "column", maxHeight: "80vh"
          }}>
            <div className="export-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Select Fields to Export ({exportType === "excel" ? "Excel" : "PDF"})</h3>
              <button onClick={handleExportCancel} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <div className="export-modal-content" style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
                <button onClick={selectAllFields} style={{ background: "#c19a6b", color: "#111", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Select All</button>
                <button onClick={deselectAllFields} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Deselect All</button>
                <span style={{ color: "#888", fontSize: "12px", marginLeft: "auto" }}>{selectedFields.length} of {availableFields.length} selected</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {availableFields.map((field) => (
                  <label key={field.key} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ccc", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedFields.includes(field.key)} onChange={() => toggleFieldSelection(field.key)} style={{ accentColor: "#c19a6b" }} />
                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="export-modal-footer" style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={handleExportCancel} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleExportConfirm} disabled={selectedFields.length === 0} style={{ background: selectedFields.length === 0 ? "rgba(255,255,255,0.1)" : "#c19a6b", color: selectedFields.length === 0 ? "#888" : "#111", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: selectedFields.length === 0 ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                Export {exportType === "excel" ? "Excel" : "PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {talentToDelete && (
        <div className="export-modal-overlay" onClick={() => setTalentToDelete(null)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()} style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", width: "90%", maxWidth: "400px", display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }}>
            <div className="export-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={18} className="text-red-500" /> Confirm Deletion
              </h3>
              <button onClick={() => setTalentToDelete(null)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <div className="export-modal-content" style={{ padding: "20px 16px", color: "#ccc", fontSize: "14px", lineHeight: "1.5" }}>
              Are you sure you want to permanently delete this talent registration? This action cannot be undone.
            </div>
            <div className="export-modal-footer" style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setTalentToDelete(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseOut={(e) => e.currentTarget.style.background="transparent"}>Cancel</button>
              <button onClick={confirmDelete} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background="#dc2626"} onMouseOut={(e) => e.currentTarget.style.background="#ef4444"}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTalents;
