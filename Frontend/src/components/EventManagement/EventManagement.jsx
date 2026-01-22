import React, { useState, useEffect } from "react";
import { eventService, registrationService } from "../../services/api";
import TimePicker from "../EventPicker/TimePicker";
import { toast } from "react-toastify";
import { Share2, Users, CheckCircle } from "lucide-react";
import "./EventManagement.css";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    meetingPoint: "",
    isActive: true,
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filterName, filterDate, activeTab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventsData, registrationsData] = await Promise.all([
        eventService.getAll(),
        registrationService.getAll()
      ]);
      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationCount = (eventId) => {
    return registrations.filter(reg => 
      (typeof reg.eventId === 'object' ? reg.eventId?._id : reg.eventId) === eventId
    ).length;
  };

  const handleShare = (eventId) => {
    const registrationLink = `${window.location.origin}/event-register/${eventId}`;
    navigator.clipboard.writeText(registrationLink).then(() => {
      toast.success("Registration link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filter by Tab (Upcoming vs Past)
    filtered = filtered.filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      
      if (activeTab === "upcoming") {
        return eventDate >= now;
      } else {
        return eventDate < now;
      }
    });

    if (filterName.trim()) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(filterName.toLowerCase()),
      );
    }

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const d = new Date(event.eventDate).toISOString().split('T')[0];
        return d === filterDate;
      });
    }

    setFilteredEvents(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingEvent && !bannerFile) {
      toast.error("Event banner is mandatory");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (bannerFile) {
      data.append('banner', bannerFile);
    }

    setSubmitLoading(true);
    try {
      if (editingEvent) {
        await eventService.update(editingEvent._id, data);
        toast.success("Event updated successfully");
      } else {
        await eventService.create(data);
        toast.success("Event created successfully");
      }
      resetForm();
      loadEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      meetingPoint: "",
      isActive: true,
    });
    setBannerFile(null);
    setBannerPreview(null);
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      eventTime: event.eventTime || "",
      location: event.location || "",
      meetingPoint: event.meetingPoint || "",
      isActive: event.isActive !== undefined ? event.isActive : true,
    });
    setBannerPreview(event.banner);
    setShowForm(true);
  };

  const handleDelete = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    setDeleting(true);
    try {
      await eventService.delete(eventToDelete);
      toast.success("Event deleted successfully");
      loadEvents();
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="event-management">
      <div className="page-header">
        <h1 className="page-title">Event Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="add-event-button"
          disabled={loading || submitLoading}
        >
          + Post New Event
        </button>
      </div>

      {showForm && (
        <div className="event-form-container">
          <div className="event-form">
            <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter event title"
                  />
                </div>
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group time-input-group">
                  <label>Event Time *</label>
                  <TimePicker
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Meeting Point *</label>
                <input
                  type="text"
                  name="meetingPoint"
                  value={formData.meetingPoint}
                  onChange={handleInputChange}
                  required
                  placeholder="Starting point/meeting location"
                />
              </div>

              <div className="form-group">
                <label>Event Image / Banner {editingEvent ? "" : "*"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingEvent}
                />
                {bannerPreview && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-700">
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Event Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe the event details..."
                />
              </div>

              <div className="form-group status-toggle-group">
                <label className="toggle-label">Event Visibility Status</label>
                <div className="toggle-container">
                  <span className={`status-text ${formData.isActive ? 'active' : 'inactive'}`}>
                    {formData.isActive ? 'Visible (Public)' : 'Hidden (Draft)'}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="toggle-hint">
                  {formData.isActive 
                    ? "This event is currently live and visible on the public website." 
                    : "This event is hidden from the public. Only admins can see it."}
                </p>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={submitLoading}>
                  {submitLoading ? "Processing..." : (editingEvent ? "Update Event" : "Create Event")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        <div className="events-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
        </div>

        <div className="events-list-header">
          <h2>
            {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Events ({filteredEvents.length})
          </h2>
          <div className="events-filters">
            <input
              type="text"
              placeholder="Search by event name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="filter-input"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-input"
            />
            {(filterName || filterDate) && (
              <button
                onClick={() => {
                  setFilterName("");
                  setFilterDate("");
                }}
                className="clear-filters-button"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
             <p className="mt-4 text-gray-400">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <p>
              {events.length === 0
                ? "No events yet. Create your first event!"
                : "No events match your filters. Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-card-image">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="event-image"
                  />
                </div>
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <div className="card-header-right">
                    {activeTab === 'upcoming' && (
                      <button 
                        className="share-icon-button"
                        onClick={() => handleShare(event._id)}
                        title="Share Registration Link"
                      >
                        <Share2 size={18} />
                      </button>
                    )}
                    <span
                      className={`status-badge ${event.isActive ? "active" : "inactive"}`}
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="event-card-body">
                  <p className="event-description line-clamp-2">{event.description}</p>
                  <div className="event-stats">
                    <div className="stat-item" title="Total Registered">
                      <Users size={16} className="stat-icon text-blue-400" />
                      <span>{getRegistrationCount(event._id)} Registered</span>
                    </div>
                  </div>
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span>
                        {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Meeting Point:</span>
                      <span>{event.meetingPoint}</span>
                    </div>
                  </div>
                </div>
                <div className="event-card-actions">
                  <button
                    onClick={() => handleEdit(event)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">⚠️</div>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                onClick={confirmDelete} 
                className="confirm-delete-btn"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEventToDelete(null);
                }} 
                className="cancel-delete-btn"
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
