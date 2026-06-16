import React, { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Filter, X, Camera, FileText, Upload, Shield, GraduationCap, Bike, Users, User, Mail, Phone, Trash2, Calendar } from "lucide-react";
import { profileService, clubService } from "../../services/api";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import EditUserModal from "./EditUserModal";

const REGISTRATION_TYPES = ["All", "Rider", "Public User", "Student", "Student Rider", "Pillion", "PS"];

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  // Admin edit states
  const [clubs, setClubs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubData = await clubService.getPublic();
        setClubs(clubData || []);
      } catch (err) {
        console.error("Failed to fetch clubs:", err);
      }
    };
    fetchClubs();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allUsers = await profileService.getAllAdmin();
      const processedUsers = allUsers.map(u => {
        // Ensure clubName is always defined on every user object so the column header is generated dynamically
        u.clubName = "-";
        if (u.clubId && typeof u.clubId === 'object' && u.clubId.name) {
          u.clubName = u.clubId.name;
        } else if (u.clubId && typeof u.clubId === 'string') {
          u.clubName = u.clubId;
        }
        return u;
      });
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Failed to load users from server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterData = useCallback(() => {
    let filtered = [...users];
    if (filterName.trim()) {
      filtered = filtered.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(filterName.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(filterName.toLowerCase()))
      );
    }
    if (filterType !== "All") {
      filtered = filtered.filter(u => u.registrationType === filterType);
    }
    setFilteredUsers(filtered);
  }, [users, filterName, filterType]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const columns = [
    { key: "sno", label: "S.No", width: "60px" },
    { key: "actions", label: "Actions", width: "120px" },
    { key: "profileImage", label: "Profile Image", width: "110px" },
    { key: "licenseImage", label: "License Image", width: "110px" },
    { key: "bucId", label: "BUC ID", width: "110px" },
    { key: "registrationType", label: "Registration Type", width: "140px" },
    { key: "fullName", label: "Full Name", width: "150px" },
    { key: "phone", label: "Phone Number", width: "120px" },
    { key: "participatingInYoga", label: "Yoga", width: "80px" },
    { key: "participatingInRally", label: "Rally", width: "80px" },
    { key: "participatingInMVD2026", label: "MVD 2026", width: "90px" },
    { key: "email", label: "Email Address", width: "180px" },
    { key: "tshirtSize", label: "T-Shirt Size", width: "110px" },
    { key: "collegeName", label: "College Name", width: "150px" },
    { key: "collegeIdNo", label: "Student ID Number", width: "140px" },
    { key: "dateOfBirth", label: "Date of Birth", width: "110px" },
    { key: "bloodGroup", label: "Blood Group", width: "100px" },
    { key: "address", label: "Address", width: "200px" },
    { key: "city", label: "City", width: "120px" },
    { key: "state", label: "State", width: "120px" },
    { key: "pincode", label: "Pincode", width: "100px" },
    { key: "bikeModel", label: "Bike Model", width: "120px" },
    { key: "bikeRegistrationNumber", label: "Bike Registration", width: "150px" },
    { key: "licenseNumber", label: "License Number", width: "150px" },
    { key: "clubName", label: "Associated Club", width: "150px" },
    { key: "emergencyContactName", label: "Emergency Contact Name", width: "160px" },
    { key: "emergencyContactPhone", label: "Emergency Contact Phone", width: "160px" },
    { key: "facebookUrl", label: "Facebook", width: "150px" },
    { key: "instagramUrl", label: "Instagram", width: "150px" },
    { key: "twitterUrl", label: "Twitter / X", width: "150px" },
    { key: "youtubeUrl", label: "YouTube", width: "150px" },
    { key: "websiteUrl", label: "Personal Website", width: "150px" },
    { key: "createdAt", label: "Registered At", width: "120px" },
  ];

  const renderCellValue = (column, user, index) => {
    if (column.key === "sno") return index + 1;
    if (column.key === "actions") {
      return (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
          {/* Edit Button */}
          <button
            onClick={() => handleEditClick(user)}
            title="Edit User"
            style={{
              background: "rgba(193, 154, 107, 0.15)",
              color: "#c19a6b",
              border: "1px solid rgba(193, 154, 107, 0.3)",
              borderRadius: "6px",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "10px",
              fontWeight: "bold",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#c19a6b";
              e.currentTarget.style.color = "#111";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(193, 154, 107, 0.15)";
              e.currentTarget.style.color = "#c19a6b";
            }}
          >
            EDIT
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleDeleteUser(user._id, user.fullName)}
            title="Delete User"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "6px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    }
    const value = user[column.key];
    if (column.key === "email") {
      if (value === null || value === undefined || value === "") return "-";
      return String(value);
    }
    if (
      column.key === "participatingInYoga" ||
      column.key === "participatingInRally" ||
      column.key === "participatingInMVD2026"
    ) {
      return value === true ? "Yes" : "No";
    }
    if (column.key === "profileImage" || column.key === "licenseImage") {
      if (!value) return "-";
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Image
        </a>
      );
    }
    if (column.key === "dateOfBirth" || column.key === "createdAt" || column.key === "updatedAt") {
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) return date.toLocaleDateString();
        } catch (e) {}
      }
    }
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const getAvailableFields = () => {
    if (filteredUsers.length === 0) return [];
    const excludeFields = ["_id", "password", "licenseImagePublicId", "profileImagePublicId", "__v", "updatedAt"];
    const firstReg = filteredUsers[0];
    const keys = Object.keys(firstReg).filter((key) => !excludeFields.includes(key));
    return keys.map((key) => ({ key, label: formatColumnName(key) }));
  };

  const handleExportClick = (type) => {
    if (filteredUsers.length === 0) {
      alert("No users to export");
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

    const title = `BUC India - Registered Users${filterType !== "All" ? ` (${filterType})` : ""}`;
    
    if (exportType === "excel") {
      exportToExcel(filteredUsers, null, selectedFields);
    } else if (exportType === "pdf") {
      exportToPDF(filteredUsers, null, selectedFields, { eventTitle: title });
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

  const clearFilters = () => {
    setFilterName("");
    setFilterType("All");
  };

  const handleDeleteUser = async (id, fullName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${fullName || 'this user'}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      await profileService.delete(id);
      alert("User deleted successfully");
      loadData(); // Reload the list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="view-registrations">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Users</h1>
          <p className="page-subtitle">
            Total: {filteredUsers.length} user(s)
            {filterType !== "All" && <span style={{ color: "#c19a6b", marginLeft: 8 }}>— {filterType}</span>}
          </p>
        </div>
        <div className="header-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />

          {/* Role Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-input"
            style={{ minWidth: 140 }}
          >
            {REGISTRATION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {(filterName || filterType !== "All") && (
            <button onClick={clearFilters} className="clear-filters-button" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <X size={14} /> Clear
            </button>
          )}

          {/* Export Actions */}
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

          <button
            onClick={loadData}
            className="refresh-button"
            title="Refresh Data"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Role Filter Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {REGISTRATION_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: "4px 14px",
              borderRadius: 999,
              border: filterType === type ? "1px solid #c19a6b" : "1px solid rgba(255,255,255,0.1)",
              background: filterType === type ? "rgba(193,154,107,0.15)" : "transparent",
              color: filterType === type ? "#c19a6b" : "#888",
              fontSize: 10,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {type}
            {type !== "All" && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({users.filter(u => u.registrationType === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading users...</p>
        </div>
      ) : columns.length === 0 ? (
        <div className="empty-state">
          <p>No users found for the selected criteria.</p>
        </div>
      ) : (
        <div className="registrations-table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} style={column.width !== "auto" ? { width: column.width } : {}}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="empty-table-message">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user._id || index}>
                    {columns.map((column) => (
                      <td key={`${user._id || index}-${column.key}`}>
                        {renderCellValue(column, user, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
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

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        clubs={clubs}
        onSuccess={loadData}
      />
    </div>
  );
};

export default ViewUsers;
