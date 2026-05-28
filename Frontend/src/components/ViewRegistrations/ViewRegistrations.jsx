import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Download, Trash2, X, AlertTriangle, RefreshCw } from "lucide-react";
import { eventService, registrationService } from "../../services/api";
import {
  exportToExcel,
  exportToPDF,
  exportToDocx,
  STANDARD_EXPORT_FIELDS,
} from "../../utils/exportUtils";
import {
  getRegistrationTypeLabel,
  resolveClubName,
  REGISTRATION_TYPES,
} from "../../constants/registrationConstants";
import { generateCertificate } from "../../utils/certificateUtils";
import "./ViewRegistrations.css";

const ViewRegistrations = () => {
  const location = useLocation();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("current");
  const [events, setEvents] = useState([]);
  const [viewingLicense, setViewingLicense] = useState(null);
  const [filterEventName, setFilterEventName] = useState("");
  const [filterEventDate, setFilterEventDate] = useState("");
  const [filterClubName, setFilterClubName] = useState("");
  const [filterRegistrationType, setFilterRegistrationType] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null); // 'excel', 'pdf', or 'docx'
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [qrData, setQrData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allEvents = await eventService.getAll();
      setEvents(allEvents);

      // Find current active event to set initial selectedEvent if it's "current"
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeEvents = allEvents
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate);
          return eventDate >= today;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      let eventToFetch = selectedEvent;
      if (selectedEvent === "current") {
        eventToFetch = activeEvents[0]?._id || "all";
      }

      const allRegistrations = await registrationService.getAll(eventToFetch === "all" ? undefined : eventToFetch);
      setRegistrations(allRegistrations);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data from server");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEventName = useCallback((eventInput) => {
    if (typeof eventInput === 'object' && eventInput !== null) {
      return eventInput.title;
    }
    if (eventInput === "community") {
      return "Community Registration";
    }
    const event = events.find((e) => e._id === eventInput);
    return event ? event.title : "Unknown Event";
  }, [events]);

  const getEventByInput = useCallback(
    (eventInput) => {
      if (typeof eventInput === "object" && eventInput !== null) {
        return eventInput;
      }
      if (eventInput === "community") {
        return null;
      }
      return events.find((e) => e._id === eventInput) || null;
    },
    [events],
  );

  const filterRegistrations = useCallback(() => {
    let filtered = [...registrations];

    // Then apply event name filter
    if (filterEventName.trim()) {
      filtered = filtered.filter((reg) => {
        const eventName = typeof reg.eventId === 'object' ? reg.eventId?.title : getEventName(reg.eventId);
        return (
          eventName &&
          eventName.toLowerCase().includes(filterEventName.toLowerCase())
        );
      });
    }

    // Then apply event date filter
    if (filterEventDate) {
      filtered = filtered.filter((reg) => {
        const eventDate = typeof reg.eventId === 'object' ? reg.eventId?.eventDate : events.find(e => e._id === reg.eventId)?.eventDate;
        if (!eventDate) return false;
        const formattedDate = new Date(eventDate).toISOString().split('T')[0];
        return formattedDate === filterEventDate;
      });
    }

    if (filterClubName.trim()) {
      const clubSearch = filterClubName.trim().toLowerCase();
      filtered = filtered.filter((reg) => {
        const club = resolveClubName(reg).toLowerCase();
        return club !== "-" && club.includes(clubSearch);
      });
    }

    if (filterRegistrationType) {
      filtered = filtered.filter(
        (reg) => reg.registrationType === filterRegistrationType,
      );
    }

    setFilteredRegistrations(filtered);
  }, [registrations, filterEventName, filterEventDate, filterClubName, filterRegistrationType, events, getEventName]);

  useEffect(() => {
    filterRegistrations();
  }, [filterRegistrations]);

  const FIELD_LABELS = {
    registrationType: "Registration Type",
    resolvedClubName: "Club Name",
    clubName: "Club (Selected)",
    clubNameCustom: "Club (Custom Name)",
    fullName: "Full Name",
    collegeName: "College",
    department: "Department",
    year: "Year",
    ridingExperience: "Riding Experience",
    interestReason: "Interest / Reason",
    acceptedTerms: "Terms Accepted",
    tShirtSize: "T-shirt Size",
    hasLinkedPillion: "Linked Pillion",
    linkedPillion: "Linked Pillion Details",
    riderReference: "Mapped Rider",
    registeredAt: "Registered At",
  };

  const getAvailableFields = () => {
    if (filteredRegistrations.length === 0) return [];

    const excludeFields = [
      "_id",
      "eventId",
      "licenseImagePublicId",
      "licenseImage",
      "profileImage",
      "profileImagePublicId",
      "__v",
      "createdAt",
      "updatedAt",
    ];
    const firstReg = filteredRegistrations[0];
    const keys = Object.keys(firstReg).filter(
      (key) => !excludeFields.includes(key),
    );

    const fields = keys.map((key) => ({
      key,
      label: FIELD_LABELS[key] || formatColumnName(key),
    }));

    if (!fields.find((f) => f.key === "resolvedClubName")) {
      fields.unshift({ key: "resolvedClubName", label: "Club Name" });
    }
    if (!fields.find((f) => f.key === "registrationType")) {
      fields.unshift({ key: "registrationType", label: "Registration Type" });
    }

    fields.push({ key: "eventName", label: "Event Name" });

    return fields;
  };

  const handleQuickExport = (type) => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations to export");
      return;
    }
    const keys = [
      ...STANDARD_EXPORT_FIELDS.map((f) => f.key),
      "collegeName",
      "department",
      "year",
      "address",
      "state",
      "pincode",
      "emergencyContactName",
      "emergencyContactPhone",
      "ridingExperience",
      "interestReason",
      "tShirtSize",
      "hasLinkedPillion",
      "linkedPillion",
      "riderReference",
      "eventName",
    ];
    const title = getCurrentEventHeading();
    if (type === "excel") {
      exportToExcel(filteredRegistrations, getEventName, keys);
    } else if (type === "pdf") {
      exportToPDF(filteredRegistrations, getEventName, keys, { eventTitle: title });
    }
  };

  const handleExportClick = (type) => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations to export");
      return;
    }

    const fields = getAvailableFields();
    setAvailableFields(fields);
    // Select all fields by default
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

    const exportEventTitle = getCurrentEventHeading();

    if (exportType === "excel") {
      exportToExcel(filteredRegistrations, getEventName, selectedFields);
    } else if (exportType === "pdf") {
      exportToPDF(filteredRegistrations, getEventName, selectedFields, {
        eventTitle: exportEventTitle,
      });
    } else if (exportType === "docx") {
      exportToDocx(filteredRegistrations, getEventName, selectedFields, {
        eventTitle: exportEventTitle,
      });
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
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        return prev.filter((key) => key !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  const selectAllFields = () => {
    setSelectedFields(availableFields.map((f) => f.key));
  };

  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  const handleViewLicense = (registration) => {
    // Find the license field dynamically - check common field names
    const licenseField =
      Object.keys(registration).find(
        (key) =>
          key.toLowerCase().includes("license") &&
          key.toLowerCase().includes("proof"),
      ) ||
      Object.keys(registration).find((key) =>
        key.toLowerCase().includes("licenseimage"),
      ) ||
      Object.keys(registration).find((key) =>
        key.toLowerCase().includes("licenseproof"),
      ) ||
      Object.keys(registration).find((key) =>
        key.toLowerCase().includes("proof"),
      ) ||
      Object.keys(registration).find((key) =>
        key.toLowerCase().includes("license"),
      );

    const licenseValue = registration.licenseImage || (licenseField ? registration[licenseField] : null);
    const userName =
      registration.fullName ||
      registration.name ||
      registration.firstName + " " + registration.lastName ||
      registration.email ||
      "User";

    setViewingLicense({
      ...registration,
      licenseField: licenseField,
      licenseValue: licenseValue,
      userName: userName,
    });
  };

  const closeLicenseViewer = () => {
    setViewingLicense(null);
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "license-proof.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const confirmDelete = (registrationId) => {
    setShowDeleteConfirm(registrationId);
  };

  const handleDelete = async (registrationId) => {
    setDeletingId(registrationId);
    setShowDeleteConfirm(null);
    try {
      await registrationService.delete(registrationId);
      // Brief delay for animation to be visible
      setTimeout(() => {
        setRegistrations((prev) => prev.filter((r) => r._id !== registrationId));
        setDeletingId(null);
      }, 500);
    } catch (error) {
      console.error("Error deleting registration:", error);
      alert("Failed to delete registration");
      setDeletingId(null);
    }
  };

  const getCurrentEventHeading = () => {
    if (selectedEvent === "all") {
      return "All Events";
    }

    if (selectedEvent === "current") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeEvents = events
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate);
          return eventDate >= today;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      const currentEvent = activeEvents[0];
      return currentEvent ? currentEvent.title : "Current Active Event";
    }

    return getEventName(selectedEvent);
  };

  // Convert camelCase to readable format
  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Dynamically generate columns from registration data
  const getDynamicColumns = () => {
    const excludeFields = [
      "_id",
      "eventId",
      "licenseImagePublicId",
      "licenseImage",
      "profileImage",
      "profileImagePublicId",
      "__v",
      "createdAt",
      "updatedAt",
      "clubNameCustom",
      "resolvedClubName",
    ];

    const priorityKeys = [
      { key: "registrationType", label: "Type" },
      { key: "fullName", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "clubDisplay", label: "Club Name" },
      { key: "city", label: "City" },
      { key: "registeredAt", label: "Registered At" },
    ];

    if (filteredRegistrations.length > 0) {
      const firstReg = filteredRegistrations[0];
      const keys = Object.keys(firstReg).filter(
        (key) =>
          !excludeFields.includes(key) &&
          !priorityKeys.some((p) => p.key === key || p.key === "clubDisplay" && key === "clubName"),
      );

      const dynamicColumns = [
        { key: "sno", label: "S.No", type: "sno", width: "60px" },
        ...priorityKeys.map((col) => ({
          key: col.key,
          label: col.label,
          type: "text",
          width: "auto",
        })),
        ...keys
          .filter((key) => key !== "clubName" && key !== "registrationType")
          .map((key) => ({
            key,
            label: formatColumnName(key),
            type: "text",
            width: "auto",
          })),
        { key: "licenseProof", label: "License Image", type: "image", width: "120px" },
        { key: "eventName", label: "Event", type: "text", width: "200px" },
        { key: "certificate", label: "Certificate", type: "certificate", width: "130px" },
        { key: "actions", label: "Actions", type: "action", width: "100px" },
      ];

      return dynamicColumns;
    }

    return [];
  };

  const columns = getDynamicColumns();

  const renderCellValue = (column, reg, index) => {
    if (column.key === "sno") {
      return index + 1;
    }

    if (column.key === "eventName") {
      return getEventName(reg.eventId) || "-";
    }

    if (column.key === "registrationType") {
      return getRegistrationTypeLabel(reg.registrationType) || "-";
    }

    if (column.key === "clubDisplay" || column.key === "resolvedClubName") {
      return reg.resolvedClubName || resolveClubName(reg);
    }

    if (column.key === "acceptedTerms") {
      return reg.acceptedTerms === true ? "Yes" : "No";
    }

    if (column.key === "hasLinkedPillion") {
      return reg.hasLinkedPillion === true ? "Yes" : "No";
    }

    if (column.key === "linkedPillion") {
      const linked = reg.linkedPillion;
      if (!linked || !linked.name) return "-";
      return `${linked.name} | ${linked.mobile || "-"} | ${linked.tShirtSize || "-"}`;
    }

    if (column.key === "riderReference") {
      const ref = reg.riderReference;
      if (!ref || (!ref.riderRegistrationId && !ref.riderPhone)) return "-";
      return `${ref.riderName || "-"} (${ref.riderPhone || "-"})`;
    }

    if (column.key === "actions") {
      return (
        <button
          onClick={() => confirmDelete(reg._id)}
          className={`delete-button-small ${deletingId === reg._id ? 'deleting' : ''}`}
          title="Delete"
          disabled={deletingId === reg._id}
        >
          {deletingId === reg._id ? "..." : <Trash2 size={16} />}
        </button>
      );
    }

    if (column.key === "certificate") {
      const eventObj = getEventByInput(reg.eventId);
      if (!eventObj || !eventObj.certificateEnabled) {
        return "-";
      }

      const eventDateLabel = eventObj.eventDate
        ? new Date(eventObj.eventDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      const riderName =
        reg.fullName || reg.name || `${reg.firstName || ""} ${reg.lastName || ""}`.trim();

      const certificateUrl = `${window.location.origin}/certificate?name=${encodeURIComponent(
        riderName || "",
      )}&eventTitle=${encodeURIComponent(
        getEventName(reg.eventId) || "",
      )}&eventDate=${encodeURIComponent(
        eventDateLabel || "",
      )}&location=${encodeURIComponent(eventObj.location || "")}&registrationId=${encodeURIComponent(
        reg._id || "",
      )}`;

      return (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => generateCertificate(reg, eventObj)}
            className="view-license-button"
            title="Download certificate"
          >
            Download
          </button>
          <button
            type="button"
            onClick={() => setQrData({ url: certificateUrl, name: riderName })}
            className="view-license-button"
            title="Show QR code"
          >
            QR Code
          </button>
        </div>
      );
    }

    if (column.key === "licenseProof") {
      const licenseValue = reg.licenseImage || reg.licenseProof || reg.license;
      if (!licenseValue) return "-";
      return (
        <button
          onClick={() => handleViewLicense(reg)}
          className="view-license-button"
          title="View License Proof"
        >
          View Proof
        </button>
      );
    }

    if (column.key === "licenseNumber") {
      return reg.licenseNumber || "-";
    }

    // Check if the field contains license proof (handle various field name variations)
    const value = reg[column.key];
    const keyLower = column.key.toLowerCase();

    if (
      (keyLower.includes("license") ||
        keyLower.includes("proof") ||
        keyLower.includes("document") || 
        keyLower === "licenseimage") &&
      value && column.key !== "licenseNumber"
    ) {
      return (
        <button
          onClick={() => handleViewLicense(reg)}
          className="view-license-button"
          title="View License"
        >
          View
        </button>
      );
    }

    // Handle date fields
    if (
      column.key.toLowerCase().includes("date") ||
      column.key.toLowerCase().includes("at")
    ) {
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          // Not a valid date
        }
      }
    }

    // Handle riding gears fields
    if (column.key === "requestRidingGears") {
      return value === true ? "Yes" : "No";
    }

    if (column.key === "requestedGears") {
      if (!value || typeof value !== "object") return "-";
      const gears = [];
      if (value.helmet) gears.push("Helmet");
      if (value.gloves) gears.push("Gloves");
      if (value.jacket) gears.push("Jacket");
      if (value.boots) gears.push("Boots");
      if (value.kneeGuards) gears.push("Knee Guards");
      if (value.elbowGuards) gears.push("Elbow Guards");
      return gears.length > 0 ? gears.join(", ") : "-";
    }

    // For regular fields, return the value or '-'
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    // If value is an object, stringify it
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <div className="view-registrations">
      <div className="page-header">
        <div>
          <h1 className="page-title">View Registrations</h1>
          <p className="page-subtitle">
            Total: {filteredRegistrations.length} registration(s)
          </p>
          <p className="page-subtitle event-heading">
            Event: {getCurrentEventHeading()}
          </p>
        </div>
        <div className="header-actions">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="event-filter"
          >
            <option value="current">Current Event</option>
            <option value="all">All Events</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by event name..."
            value={filterEventName}
            onChange={(e) => setFilterEventName(e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            value={filterEventDate}
            onChange={(e) => setFilterEventDate(e.target.value)}
            className="filter-input"
            placeholder="Filter by date"
          />
          <input
            type="text"
            placeholder="Filter by club..."
            value={filterClubName}
            onChange={(e) => setFilterClubName(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterRegistrationType}
            onChange={(e) => setFilterRegistrationType(e.target.value)}
            className="filter-input"
          >
            <option value="">All types</option>
            {REGISTRATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {(filterEventName ||
            filterEventDate ||
            filterClubName ||
            filterRegistrationType) && (
            <button
              onClick={() => {
                setFilterEventName("");
                setFilterEventDate("");
                setFilterClubName("");
                setFilterRegistrationType("");
              }}
              className="clear-filters-button"
            >
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
          <button
            onClick={() => handleQuickExport("excel")}
            className="export-button excel"
            disabled={filteredRegistrations.length === 0}
            title="Export all key fields to Excel"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleQuickExport("pdf")}
            className="export-button pdf"
            disabled={filteredRegistrations.length === 0}
            title="Export all key fields to PDF"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleExportClick("excel")}
            className="export-button excel-secondary"
            disabled={filteredRegistrations.length === 0}
            title="Choose columns to export"
          >
            Custom Excel
          </button>
          <button
            onClick={() => handleExportClick("pdf")}
            className="export-button pdf-secondary"
            disabled={filteredRegistrations.length === 0}
            title="Choose columns to export"
          >
            Custom PDF
          </button>
          <button
            onClick={() => {
              setSelectedFields(STANDARD_EXPORT_FIELDS.map((f) => f.key));
              setExportType("docx");
              setShowExportModal(false);
              exportToDocx(filteredRegistrations, getEventName, STANDARD_EXPORT_FIELDS.map((f) => f.key), {
                eventTitle: getCurrentEventHeading(),
              });
            }}
            className="export-button word"
            disabled={filteredRegistrations.length === 0}
          >
            Export Word
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading registrations...</p>
        </div>
      ) : columns.length === 0 ? (
        <div className="empty-state">
          <p>
            No registrations found for the selected criteria.
          </p>
        </div>
      ) : (
        <div className="registrations-table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={
                      column.width !== "auto" ? { width: column.width } : {}
                    }
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="empty-table-message">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, index) => (
                  <tr key={reg._id || index}>
                    {columns.map((column) => (
                      <td key={`${reg._id || index}-${column.key}`}>
                        {renderCellValue(column, reg, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewingLicense && (
        <div className="license-viewer-overlay" onClick={closeLicenseViewer}>
          <div className="license-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="license-viewer-header">
              <h3>
                License Proof -{" "}
                {viewingLicense.userName ||
                  viewingLicense.fullName ||
                  viewingLicense.name ||
                  viewingLicense.email ||
                  "User"}
              </h3>
              <div className="header-button-group">
                {viewingLicense.licenseValue && (
                  <button 
                    className="download-button-small"
                    onClick={() => downloadImage(viewingLicense.licenseValue, `${(viewingLicense.userName || 'user').replace(/\s+/g, '_')}_license.jpg`)}
                    title="Download Image"
                  >
                    <Download size={18} />
                  </button>
                )}
                <button onClick={closeLicenseViewer} className="close-button">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="license-viewer-content">
              {viewingLicense.licenseValue ? (
                typeof viewingLicense.licenseValue === "string" &&
                (viewingLicense.licenseValue.startsWith("data:image") ||
                  viewingLicense.licenseValue.startsWith("blob:") ||
                  viewingLicense.licenseValue.startsWith("http")) ? (
                  <div className="license-image-container">
                    <img
                      src={viewingLicense.licenseValue}
                      alt="License Proof"
                      className="license-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="license-image-error"
                      style={{ display: "none" }}
                    >
                      <p>
                        Unable to display image. The file may be corrupted or in
                        an unsupported format.
                      </p>
                      <p className="license-note">
                        File data exists but cannot be rendered.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="license-file-info">
                    <p>
                      <strong>File Reference:</strong>{" "}
                      {String(viewingLicense.licenseValue).substring(0, 100)}
                    </p>
                    <p className="license-note">
                      Note: This appears to be a file reference. Please check
                      the uploaded file in your storage system.
                    </p>
                  </div>
                )
              ) : (
                <div className="no-license">
                  <p>No license proof available for this registration.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <AlertTriangle size={48} color="#3B82F6" />
            </div>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this registration? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteConfirm(null)}
              >
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

      {showExportModal && (
        <div className="export-modal-overlay" onClick={handleExportCancel}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>
                Select Fields to Export (
                {exportType === "excel"
                  ? "Excel"
                  : exportType === "docx"
                    ? "Word"
                    : "PDF"})
              </h3>
              <button onClick={handleExportCancel} className="close-button">
                ✕
              </button>
            </div>
            <div className="export-modal-content">
              <div className="export-modal-actions">
                <button onClick={selectAllFields} className="select-all-button">
                  Select All
                </button>
                <button
                  onClick={deselectAllFields}
                  className="deselect-all-button"
                >
                  Deselect All
                </button>
                <span className="selected-count">
                  {selectedFields.length} of {availableFields.length} fields
                  selected
                </span>
              </div>
              <div className="fields-list">
                {availableFields.map((field) => (
                  <label key={field.key} className="field-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleFieldSelection(field.key)}
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="export-modal-footer">
              <button
                onClick={handleExportCancel}
                className="cancel-export-button"
              >
                Cancel
              </button>
              <button
                onClick={handleExportConfirm}
                className="confirm-export-button"
                disabled={selectedFields.length === 0}
              >
                Export{" "}
                {exportType === "excel"
                  ? "Excel"
                  : exportType === "docx"
                    ? "Word"
                    : "PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {qrData && (
        <div className="delete-modal-overlay" onClick={() => setQrData(null)}>
          <div
            className="delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <Download size={36} color="#3B82F6" />
            </div>
            <h2>Scan to Download Certificate</h2>
            <p className="mb-4 text-sm text-gray-300">
              Rider: <span className="font-semibold">{qrData.name || "Participant"}</span>
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  qrData.url,
                )}`}
                alt="Certificate QR Code"
              />
            </div>
            <p className="text-xs text-gray-400 break-all text-center mb-4">
              {qrData.url}
            </p>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setQrData(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRegistrations;
