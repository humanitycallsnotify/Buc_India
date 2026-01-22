import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventService, registrationService } from "../../services/api";
import "./DashboardHome.css";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("current");
  const [activeEvent, setActiveEvent] = useState(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [events, registrations] = await Promise.all([
        eventService.getAll(),
        registrationService.getAll()
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingActiveEvents = events
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      setActiveEvents(upcomingActiveEvents);
      
      const currentEvent = upcomingActiveEvents[0] || null;
      let targetEvent = currentEvent;

      if (selectedEventId !== "current") {
        targetEvent = upcomingActiveEvents.find((e) => e._id === selectedEventId) || currentEvent;
      }

      setActiveEvent(targetEvent);

      if (targetEvent) {
        const eventRegistrations = registrations.filter(
          (r) => (r.eventId?._id || r.eventId) === targetEvent._id
        );
        setRegisteredCount(eventRegistrations.length);
      } else {
        setRegisteredCount(0);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      updateActiveEventSelection();
    }
  }, [selectedEventId]);

  const updateActiveEventSelection = async () => {
    try {
      const currentEvent = activeEvents[0] || null;
      let targetEvent = currentEvent;

      if (selectedEventId !== "current") {
        targetEvent = activeEvents.find((e) => e._id === selectedEventId) || currentEvent;
      }

      setActiveEvent(targetEvent);

      if (targetEvent) {
        const registrations = await registrationService.getAll(targetEvent._id);
        setRegisteredCount(registrations.length);
      } else {
        setRegisteredCount(0);
      }
    } catch (error) {
      console.error("Failed to update event selection:", error);
    }
  };

  const handlePostNewEvent = () => {
    navigate("/admin/events");
  };

  const handleViewRegistrations = () => {
    navigate("/admin/registrations");
  };

  const handleViewParticipantsForSelectedEvent = () => {
    const eventIdToPass =
      selectedEventId === "current"
        ? activeEvents[0]?._id || "current"
        : selectedEventId;
    navigate("/admin/registrations", {
      state: { selectedEventId: eventIdToPass },
    });
  };

  if (loading) {
    return <div className="no-active-event">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-home">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Administrative Control Panel</p>

      <div className="active-event-section">
        <h2 className="section-title">Active Event</h2>
        {activeEvents.length > 0 && (
          <div className="dashboard-event-picker">
            <label className="dashboard-event-picker-label">
              Choose event:
            </label>
            <select
              className="dashboard-event-picker-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="current">Current (nearest upcoming)</option>
              {activeEvents.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {activeEvent ? (
          <div className="active-event-card">
            <div className="event-header-info">
              <h3>{activeEvent.title}</h3>
              <span className="active-badge">Active</span>
            </div>
            <p className="event-description">{activeEvent.description}</p>
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-label">Date:</span>
                <span className="meta-value">
                  {new Date(activeEvent.eventDate).toLocaleDateString()} at {activeEvent.eventTime}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Location:</span>
                <span className="meta-value">{activeEvent.location}</span>
              </div>
              {activeEvent.meetingPoint && (
                <div className="meta-item">
                  <span className="meta-label">Meeting Point:</span>
                  <span className="meta-value">{activeEvent.meetingPoint}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-active-event">
            <p>No active event at the moment.</p>
          </div>
        )}

        <div className="registered-count-card">
          <div className="count-display">
            <h3>{registeredCount}</h3>
            <p>Registered Participants</p>
            <p className="count-subtitle">
              {activeEvent
                ? `For event: ${activeEvent.title}`
                : "No active event selected"}
            </p>
            <button
              type="button"
              className="view-participants-button"
              onClick={handleViewParticipantsForSelectedEvent}
              disabled={!activeEvent}
            >
              View Participants
            </button>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={handlePostNewEvent}>
            <h3>Post New Event</h3>
            <p>Create and publish a new event for the community</p>
          </div>
          <div className="action-card" onClick={handleViewRegistrations}>
            <h3>View Registrations</h3>
            <p>See all registered participants and export data</p>
          </div>
        </div>
      </div>

      <div className="info-note">
        <p>
          <strong>💡 Tip:</strong> Click "View Public Site" in the top
          navigation to see how your events appear to users. Events you create
          here will automatically appear on the public events page!
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;
