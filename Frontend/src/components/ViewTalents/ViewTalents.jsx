import React, { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, X, Trash2, Edit3 } from "lucide-react";
import { talentService } from "../../services/api";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const EXPERIENCE_LEVELS = ["All", "Beginner", "Intermediate", "Professional"];

const TABLE_COLUMNS = [
  { key: "sno", label: "S.No" },
  { key: "actions", label: "Actions" },
  { key: "approvalStatus", label: "Approval" },
  { key: "bucId", label: "BUC ID" },
  { key: "fullName", label: "Full Name" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "talentCategory", label: "Talent" },
  { key: "tshirtSize", label: "T-Shirt" },
  { key: "experienceLevel", label: "Experience" },
  { key: "yearsOfExperience", label: "Years Exp." },
  { key: "portfolioLink", label: "Portfolio" },
  { key: "isRider", label: "Rider?" },
  { key: "bikeModel", label: "Bike Model" },
  { key: "openToPerformLive", label: "Live Perf?" },
  { key: "openToCompetition", label: "Competition?" },
  { key: "availableDates", label: "Available Dates" },
  { key: "createdAt", label: "Registered On" },
];

const EXCLUDE_EXPORT_KEYS = new Set(["actions"]);

const ViewTalents = () => {
  const [talents, setTalents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const [editingTalent, setEditingTalent] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await talentService.getAll();
      setTalents(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error("Error loading talents:", error);
      alert("Failed to load talent registrations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = useCallback(() => {
    let result = [...talents];
    if (filterName.trim()) {
      const q = filterName.toLowerCase();
      result = result.filter(
        (t) =>
          (t.fullName && t.fullName.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.talentCategory && t.talentCategory.toLowerCase().includes(q)),
      );
    }
    if (filterLevel !== "All") {
      result = result.filter((t) => t.experienceLevel === filterLevel);
    }
    setFiltered(result);
  }, [talents, filterName, filterLevel]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const openEditModal = (talent) => {
    setEditingTalent(talent);
    setEditData({
      fullName: talent.fullName || "",
      age: talent.age || "",
      gender: talent.gender || "",
      phone: talent.phone || "",
      email: talent.email || "",
      city: talent.city || "",
      talentCategory: talent.talentCategory || "",
      tshirtSize: talent.tshirtSize || "",
      experienceLevel: talent.experienceLevel || "Beginner",
      yearsOfExperience: talent.yearsOfExperience || "",
      portfolioLink: talent.portfolioLink || "",
      bikeModel: talent.bikeModel || "",
      approvalStatus: talent.approvalStatus || "pending",
    });
  };

  const handleApprove = async (talentId) => {
    try {
      setApprovingId(talentId);
      const response = await talentService.approve(talentId);
      const updated = response?.talent;
      if (!updated) {
        await loadData();
        return;
      }
      setTalents((prev) => prev.map((t) => (t._id === talentId ? updated : t)));
      setFiltered((prev) => prev.map((t) => (t._id === talentId ? updated : t)));
    } catch (error) {
      console.error("Approve talent failed:", error);
      alert(error?.response?.data?.message || "Failed to approve talent.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (talentId) => {
    try {
      setDeletingId(talentId);
      await talentService.delete(talentId);
      setTalents((prev) => prev.filter((t) => t._id !== talentId));
      setFiltered((prev) => prev.filter((t) => t._id !== talentId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Delete talent failed:", error);
      alert(error?.response?.data?.message || "Failed to delete talent.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTalent?._id) return;
    try {
      setSavingEdit(true);
      const response = await talentService.update(editingTalent._id, editData);
      const updated = response?.talent;
      if (!updated) {
        await loadData();
      } else {
        setTalents((prev) => prev.map((t) => (t._id === editingTalent._id ? updated : t)));
        setFiltered((prev) => prev.map((t) => (t._id === editingTalent._id ? updated : t)));
      }
      setEditingTalent(null);
    } catch (error) {
      console.error("Edit talent failed:", error);
      alert(error?.response?.data?.message || "Failed to update talent.");
    } finally {
      setSavingEdit(false);
    }
  };

  const getAvailableFields = () => {
    const keys = TABLE_COLUMNS.map((c) => c.key).filter((k) => !EXCLUDE_EXPORT_KEYS.has(k));
    return keys.map((key) => ({ key, label: key }));
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

    const title = `BUC India - Talent Registrations${
      filterLevel !== "All" ? ` (${filterLevel})` : ""
    }`;

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
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey],
    );
  };

  const selectAllFields = () => setSelectedFields(availableFields.map((f) => f.key));
  const deselectAllFields = () => setSelectedFields([]);

  const renderCell = (col, talent, index) => {
    if (col.key === "sno") return index + 1;
    if (col.key === "actions") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleApprove(talent._id)}
            disabled={approvingId === talent._id || talent.approvalStatus === "approved"}
            className="view-license-button"
            title={talent.approvalStatus === "approved" ? "Already approved" : "Approve"}
          >
            {approvingId === talent._id ? "..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => openEditModal(talent)}
            className="view-license-button"
            title="Edit talent"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(talent._id)}
            className={`delete-button-small ${deletingId === talent._id ? "deleting" : ""}`}
            title="Delete talent"
            disabled={deletingId === talent._id}
          >
            {deletingId === talent._id ? "..." : <Trash2 size={16} />}
          </button>
        </div>
      );
    }

    const val = talent[col.key];
    if (val === null || val === undefined || val === "") return "-";

    if (col.key === "approvalStatus") {
      const approved = val === "approved";
      return (
        <span className="text-xs font-semibold" style={{ color: approved ? "#22c55e" : "#c19a6b" }}>
          {approved ? "Approved" : "Pending"}
        </span>
      );
    }

    if (col.key === "isRider" || col.key === "openToPerformLive" || col.key === "openToCompetition") {
      return val ? "Yes" : "No";
    }

    if (col.key === "portfolioLink" && val) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-xs"
        >
          View Link
        </a>
      );
    }

    if (col.key === "createdAt") {
      try {
        return new Date(val).toLocaleDateString();
      } catch {
        return String(val);
      }
    }

    return String(val);
  };

  return (
    <div className="view-registrations">
      <div className="page-header">
        <div>
          <h1 className="page-title">Talent Registrations</h1>
          <p className="page-subtitle">
            Total: {filtered.length} talent(s)
            {filterLevel !== "All" && (
              <span style={{ color: "#c19a6b", marginLeft: 8 }}>— {filterLevel}</span>
            )}
          </p>
        </div>
        <div className="header-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
          <input
            type="text"
            placeholder="Search by name, email, or talent..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-input"
            style={{ minWidth: 160 }}
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {(filterName || filterLevel !== "All") && (
            <button
              onClick={() => {
                setFilterName("");
                setFilterLevel("All");
              }}
              className="clear-filters-button"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
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

          <button onClick={loadData} className="refresh-button" title="Refresh Data" disabled={isLoading}>
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading talents...</p>
        </div>
      ) : (
        <div className="registrations-table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length} className="empty-table-message">
                    No talents found.
                  </td>
                </tr>
              ) : (
                filtered.map((talent, index) => (
                  <tr key={talent._id || index}>
                    {TABLE_COLUMNS.map((col) => (
                      <td key={`${talent._id || index}-${col.key}`}>{renderCell(col, talent, index)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showExportModal && (
        <div
          className="export-modal-overlay"
          onClick={handleExportCancel}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="export-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
            }}
          >
            <div
              className="export-modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ margin: 0, color: "#fff" }}>
                Select Fields to Export ({exportType === "excel" ? "Excel" : "PDF"})
              </h3>
              <button
                onClick={handleExportCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>
            <div className="export-modal-content" style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
                <button onClick={selectAllFields} style={{ background: "#c19a6b", color: "#111", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                  Select All
                </button>
                <button onClick={deselectAllFields} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                  Deselect All
                </button>
                <span style={{ color: "#888", fontSize: "12px", marginLeft: "auto" }}>
                  {selectedFields.length} of {availableFields.length} selected
                </span>
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
              <button onClick={handleExportCancel} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleExportConfirm} disabled={selectedFields.length === 0} style={{ background: selectedFields.length === 0 ? "rgba(255,255,255,0.1)" : "#c19a6b", color: selectedFields.length === 0 ? "#888" : "#111", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: selectedFields.length === 0 ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                Export {exportType === "excel" ? "Excel" : "PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="export-modal-overlay" onClick={() => setShowDeleteConfirm(null)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", width: "90%", maxWidth: "420px", padding: "18px" }}>
            <h3 style={{ margin: 0, color: "#fff", marginBottom: 10 }}>Delete Talent?</h3>
            <p style={{ color: "#aaa", fontSize: 13, marginTop: 0 }}>
              This will permanently delete the talent entry.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm)} disabled={deletingId === showDeleteConfirm} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>
                {deletingId === showDeleteConfirm ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTalent && (
        <div className="export-modal-overlay" onClick={() => setEditingTalent(null)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", width: "92%", maxWidth: "640px", padding: "18px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Edit Talent</h3>
              <button onClick={() => setEditingTalent(null)} style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              {["fullName", "age", "gender", "phone", "email", "city", "talentCategory", "tshirtSize", "experienceLevel", "yearsOfExperience", "portfolioLink", "bikeModel", "approvalStatus"].map((k) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: "#aaa", fontSize: 12 }}>{k}</label>
                  <input
                    value={editData[k] ?? ""}
                    onChange={(e) => setEditData((p) => ({ ...p, [k]: e.target.value }))}
                    style={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 10px", color: "#fff" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button onClick={() => setEditingTalent(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={savingEdit} style={{ background: "#c19a6b", border: "none", color: "#111", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 800 }}>
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTalents;

