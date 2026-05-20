import React, { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Filter, X } from "lucide-react";
import { profileService } from "../../services/api";

const REGISTRATION_TYPES = ["All", "PC", "Rider", "Student Rider", "Student"];

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allUsers = await profileService.getAllAdmin();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
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

  const getDynamicColumns = () => {
    const excludeFields = [
      "_id", "password", "licenseImagePublicId", "profileImagePublicId", "__v", "updatedAt"
    ];
    if (filteredUsers.length > 0) {
      const firstReg = filteredUsers[0];
      const keys = Object.keys(firstReg).filter(key => !excludeFields.includes(key));
      return [
        { key: "sno", label: "S.No", width: "60px" },
        ...keys.map(key => ({ key, label: formatColumnName(key), width: "auto" }))
      ];
    }
    return [];
  };

  const columns = getDynamicColumns();

  const renderCellValue = (column, user, index) => {
    if (column.key === "sno") return index + 1;
    const value = user[column.key];
    if (column.key === "profileImage" || column.key === "licenseImage") {
      if (!value) return "-";
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Image
        </a>
      );
    }
    if (column.key.toLowerCase().includes("date") || column.key.toLowerCase().includes("at")) {
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

  // PDF Export
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    const pdfColumns = columns.filter(c =>
      !["profileImage", "licenseImage"].includes(c.key)
    );

    const tableRows = filteredUsers.map((user, index) =>
      `<tr>${pdfColumns.map(col => {
        if (col.key === "sno") return `<td>${index + 1}</td>`;
        const val = user[col.key];
        if (val === null || val === undefined || val === "") return `<td>-</td>`;
        if (col.key.toLowerCase().includes("date") || col.key.toLowerCase().includes("at")) {
          try {
            const date = new Date(val);
            if (!isNaN(date.getTime())) return `<td>${date.toLocaleDateString()}</td>`;
          } catch (e) {}
        }
        if (typeof val === "object") return `<td>${JSON.stringify(val)}</td>`;
        return `<td>${val}</td>`;
      }).join("")}</tr>`
    ).join("");

    const filterLabel = filterType !== "All" ? ` — ${filterType}` : "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BUC India — Registered Users${filterLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 9px; padding: 16px; color: #111; }
          h1 { font-size: 16px; margin-bottom: 4px; }
          .subtitle { font-size: 10px; color: #666; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #1a1a1a; color: #fff; padding: 6px 8px; text-align: left; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
          td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
          tr:nth-child(even) { background: #f9f9f9; }
          .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; border-bottom: 2px solid #c19a6b; padding-bottom: 12px; }
          .header-text h1 { color: #1a1a1a; }
          .header-text p { color: #c19a6b; font-size: 10px; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 7px; font-weight: bold; text-transform: uppercase; background: #c19a6b22; color: #c19a6b; border: 1px solid #c19a6b55; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-text">
            <h1>BUC India — Registered Users${filterLabel}</h1>
            <p>Bikers Unity Calls | Total: ${filteredUsers.length} registrations | Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>${pdfColumns.map(col => `<th>${col.label}</th>`).join("")}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterType("All");
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

          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
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
    </div>
  );
};

export default ViewUsers;
