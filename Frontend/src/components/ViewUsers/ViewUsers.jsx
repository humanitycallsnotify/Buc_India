import React, { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { profileService } from "../../services/api";

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterName, setFilterName] = useState("");
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
    setFilteredUsers(filtered);
  }, [users, filterName]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  // Convert camelCase to readable format
  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getDynamicColumns = () => {
    const excludeFields = ["_id", "password", "licenseImagePublicId", "profileImagePublicId", "__v", "createdAt", "updatedAt"];
    
    if (filteredUsers.length > 0) {
      const firstReg = filteredUsers[0];
      const keys = Object.keys(firstReg).filter(key => !excludeFields.includes(key));

      return [
        { key: "sno", label: "S.No", width: "60px" },
        ...keys.map(key => ({
          key: key,
          label: formatColumnName(key),
          width: "auto",
        }))
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

  return (
    <div className="view-registrations">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Users</h1>
          <p className="page-subtitle">Total: {filteredUsers.length} user(s)</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
          {filterName && (
            <button onClick={() => setFilterName("")} className="clear-filters-button">
              Clear Filters
            </button>
          )}
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
