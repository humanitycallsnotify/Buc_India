import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  RefreshCw,
  X,
  Star,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Save,
  Edit3,
} from "lucide-react";
import { talentService } from "../../services/api";

const EXPERIENCE_LEVELS = ["All", "Beginner", "Intermediate", "Professional"];

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
    { key: "fullName", label: "Full Name" },
    { key: "age", label: "Age" },
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
    { key: "approvalStatus", label: "Approval" },
    { key: "createdAt", label: "Registered On" },
    { key: "actions", label: "Actions" },
  ];

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
      subTalentDescription: talent.subTalentDescription || "",
      experienceLevel: talent.experienceLevel || "Beginner",
      yearsOfExperience: talent.yearsOfExperience || "",
      shortDescription: talent.shortDescription || "",
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
        setTalents((prev) =>
          prev.map((t) => (t._id === editingTalent._id ? updated : t)),
        );
        setFiltered((prev) =>
          prev.map((t) => (t._id === editingTalent._id ? updated : t)),
        );
      }
      setEditingTalent(null);
    } catch (error) {
      console.error("Edit talent failed:", error);
      alert(error?.response?.data?.message || "Failed to update talent.");
    } finally {
      setSavingEdit(false);
    }
  };

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
    if (col.key === "isRider" || col.key === "openToPerformLive" || col.key === "openToCompetition") {
      return val ? "Yes" : "No";
    }
    if (col.key === "portfolioLink" && val) {
      return <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">View Link</a>;
    }
    if (col.key === "approvalStatus") {
      const approved = val === "approved";
      return (
        <span
          className="text-xs font-semibold"
          style={{ color: approved ? "#22c55e" : "#c19a6b" }}
        >
          {approved ? "Approved" : "Pending"}
        </span>
      );
    }
    if (col.key === "createdAt" && val) {
      try {
        return new Date(val).toLocaleDateString();
      } catch { return val; }
    }
    return String(val);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    const pdfCols = TABLE_COLUMNS.filter(c => !["portfolioLink", "socialMediaLinks", "actions"].includes(c.key));

    const tableRows = filtered.map((t, i) =>
      `<tr>${pdfCols.map(col => {
        if (col.key === "sno") return `<td>${i + 1}</td>`;
        const val = t[col.key];
        if (val === null || val === undefined || val === "") return `<td>-</td>`;
        if (["isRider", "openToPerformLive", "openToCompetition"].includes(col.key)) return `<td>${val ? "Yes" : "No"}</td>`;
        if (col.key === "createdAt") {
          try { return `<td>${new Date(val).toLocaleDateString()}</td>`; } catch { return `<td>${val}</td>`; }
        }
        if (col.key === "approvalStatus") {
          return `<td>${val === "approved" ? "Approved" : "Pending"}</td>`;
        }
        return `<td>${String(val).slice(0, 80)}</td>`;
      }).join("")}</tr>`
    ).join("");

    const levelLabel = filterLevel !== "All" ? ` — ${filterLevel}` : "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BUC India — Talent Registrations${levelLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 8px; padding: 16px; color: #111; }
          .header { border-bottom: 2px solid #c19a6b; padding-bottom: 10px; margin-bottom: 12px; }
          .header h1 { font-size: 15px; }
          .header p { color: #c19a6b; font-size: 9px; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #1a1a1a; color: #fff; padding: 5px 7px; text-align: left; font-size: 7px; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
          td { padding: 4px 7px; border-bottom: 1px solid #eee; vertical-align: top; max-width: 120px; word-wrap: break-word; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BUC India — Talent Registrations${levelLabel}</h1>
          <p>Bikers Unity Calls | Total: ${filtered.length} entries | Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead><tr>${pdfCols.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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
            onClick={handleExportPDF}
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

      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <AlertTriangle size={48} color="#3B82F6" />
            </div>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete this talent registration? This action
              cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTalent && (
        <div className="delete-modal-overlay" onClick={() => setEditingTalent(null)}>
          <div
            className="delete-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 700, width: "92%" }}
          >
            <div className="delete-modal-icon">
              <CheckCircle2 size={40} color="#3B82F6" />
            </div>
            <h2>Edit Talent Registration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-left">
              {[
                ["fullName", "Full Name"],
                ["age", "Age"],
                ["gender", "Gender"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["city", "City"],
                ["talentCategory", "Talent"],
                ["subTalentDescription", "Description"],
                ["experienceLevel", "Experience Level"],
                ["yearsOfExperience", "Years of Experience"],
                ["approvalStatus", "Approval Status"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs uppercase tracking-wide text-gray-400">
                  {label}
                  {key === "experienceLevel" || key === "approvalStatus" || key === "gender" ? (
                    <select
                      value={editData[key] || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full mt-1 bg-[#111] border border-white/10 p-2 text-white"
                    >
                      {key === "experienceLevel" && (
                        <>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Professional">Professional</option>
                        </>
                      )}
                      {key === "approvalStatus" && (
                        <>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                        </>
                      )}
                      {key === "gender" && (
                        <>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editData[key] || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full mt-1 bg-[#111] border border-white/10 p-2 text-white"
                    />
                  )}
                </label>
              ))}
              <label className="md:col-span-2 text-xs uppercase tracking-wide text-gray-400">
                About
                <textarea
                  value={editData.shortDescription || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  className="w-full mt-1 bg-[#111] border border-white/10 p-2 text-white min-h-[90px]"
                />
              </label>
            </div>
            <div className="delete-modal-actions mt-5">
              <button className="cancel-btn" onClick={() => setEditingTalent(null)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleSaveEdit} disabled={savingEdit}>
                <Save size={14} style={{ marginRight: 6 }} />
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTalents;
