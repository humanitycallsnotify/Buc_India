// Database Service - Manages all data operations
// In production, replace localStorage with API calls to your backend

const EVENTS_KEY = "buc_events";
const REGISTRATIONS_KEY = "buc_registrations";

export const databaseService = {
  // Event Management
  getEvents: () => {
    try {
      const events = localStorage.getItem(EVENTS_KEY);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error("Error getting events:", error);
      return [];
    }
  },

  saveEvent: (event) => {
    try {
      const events = databaseService.getEvents();
      const newEvent = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      events.push(newEvent);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      return newEvent;
    } catch (error) {
      console.error("Error saving event:", error);
      throw error;
    }
  },

  updateEvent: (eventId, updatedEvent) => {
    try {
      const events = databaseService.getEvents();
      const index = events.findIndex((e) => e.id === eventId);
      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        return events[index];
      }
      return null;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  deleteEvent: (eventId) => {
    try {
      const events = databaseService.getEvents();
      const filteredEvents = events.filter((e) => e.id !== eventId);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  // Registration Management
  getRegistrations: () => {
    try {
      const registrations = localStorage.getItem(REGISTRATIONS_KEY);
      return registrations ? JSON.parse(registrations) : [];
    } catch (error) {
      console.error("Error getting registrations:", error);
      return [];
    }
  },

  saveRegistration: (registration) => {
    try {
      const registrations = databaseService.getRegistrations();
      const newRegistration = {
        ...registration,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
      };
      registrations.push(newRegistration);
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
      return newRegistration;
    } catch (error) {
      console.error("Error saving registration:", error);
      throw error;
    }
  },

  getRegistrationsByEvent: (eventId) => {
    try {
      const registrations = databaseService.getRegistrations();
      return registrations.filter((r) => r.eventId === eventId);
    } catch (error) {
      console.error("Error getting registrations by event:", error);
      return [];
    }
  },

  deleteRegistration: (registrationId) => {
    try {
      const registrations = databaseService.getRegistrations();
      const filteredRegistrations = registrations.filter(
        (r) => r.id !== registrationId,
      );
      localStorage.setItem(
        REGISTRATIONS_KEY,
        JSON.stringify(filteredRegistrations),
      );
      return true;
    } catch (error) {
      console.error("Error deleting registration:", error);
      throw error;
    }
  },
};

// Initialize database with empty tables if they don't exist
if (!localStorage.getItem(EVENTS_KEY)) {
  // Initialize with sample dummy events for testing
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const sampleEvents = [
    {
      id: "1",
      title: "Mountain Ride Adventure",
      description:
        "Join us for an exciting mountain biking adventure through scenic trails. Perfect for all skill levels. We'll explore beautiful landscapes and enjoy a day of riding together.",
      eventDate: nextWeek.toISOString().split("T")[0],
      eventTime: "06:00 AM",
      location: "Mountain View Point, Pune",
      meetingPoint: "BUC India Office, Koregaon Park",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "City Night Ride",
      description:
        "Experience the city like never before with our night ride event. We'll cruise through the city streets, enjoy the nightlife, and end with a group dinner.",
      eventDate: nextMonth.toISOString().split("T")[0],
      eventTime: "08:00 PM",
      location: "City Center, Mumbai",
      meetingPoint: "Marine Drive, Gateway of India",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Weekend Highway Cruise",
      description:
        "A relaxing weekend ride on the highway. Perfect for riders who want to enjoy a long ride with beautiful scenery. Refreshments and rest stops included.",
      eventDate: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "07:00 AM",
      location: "Mumbai-Pune Expressway",
      meetingPoint: "Toll Plaza, Mumbai End",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Monsoon Trail Ride",
      description:
        "A scenic ride through the lush green trails during the monsoon season. Experience nature at its best.",
      eventDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "06:30 AM",
      location: "Lonavala Ghats",
      meetingPoint: "Chandni Chowk, Pune",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Republic Day Parade Ride",
      description:
        "Annual Republic Day ride to celebrate the national spirit. A grand procession through the city.",
      eventDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "07:30 AM",
      location: "MG Road, Bangalore",
      meetingPoint: "Cubbon Park",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "6",
      title: "Coastal Highway Run",
      description:
        "Ride along the beautiful Konkan coast. Enjoy the sea breeze and stunning ocean views.",
      eventDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "05:30 AM",
      location: "Ratnagiri Coast",
      meetingPoint: "Panvel Plaza",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "7",
      title: "Desert Safari Ride",
      description:
        "Explore the golden sands of Rajasthan on two wheels. A challenging yet rewarding experience.",
      eventDate: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "04:00 PM",
      location: "Jaisalmer Desert",
      meetingPoint: "Sam Sand Dunes",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "8",
      title: "Heritage City Tour",
      description:
        "Discover the rich history of Jaipur with a guided motorcycle tour of its palaces and forts.",
      eventDate: new Date(today.getTime() - 150 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "09:00 AM",
      location: "Jaipur Pink City",
      meetingPoint: "Hawa Mahal",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "9",
      title: "Winter Highlands Ride",
      description:
        "A chilly ride through the northern highlands. Experience the winter beauty of the hills.",
      eventDate: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "08:00 AM",
      location: "Shimla Hills",
      meetingPoint: "The Ridge",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "10",
      title: "Coffee Estate Trail",
      description:
        "Ride through the aromatic coffee plantations of Coorg. A refreshing and scenic journey.",
      eventDate: new Date(today.getTime() - 210 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      eventTime: "07:00 AM",
      location: "Madikeri, Coorg",
      meetingPoint: "Raja's Seat",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(EVENTS_KEY, JSON.stringify(sampleEvents));
}

if (!localStorage.getItem(REGISTRATIONS_KEY)) {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([]));
}
