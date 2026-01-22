import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, FileText, X, Check, ShieldCheck } from 'lucide-react';

const ProposeEventForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    location: '',
    meetingPoint: '',
    description: '',
    expectedAttendees: '',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    eventType: '',
    requirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatWhatsAppMessage = () => {
    return `*New Event Proposal*

*Event Details:*
Title: ${formData.eventTitle}
Date: ${formData.eventDate}
Time: ${formatTime(formData.eventTime)}
Location: ${formData.location}
Meeting Point: ${formData.meetingPoint}
Type: ${formData.eventType}
Expected Attendees: ${formData.expectedAttendees}

*Description:*
${formData.description}

*Organizer Information:*
Name: ${formData.organizerName}
Phone: ${formData.organizerPhone}
Email: ${formData.organizerEmail}

*Special Requirements:*
${formData.requirements || 'None'}

Event proposal submitted successfully!`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const message = formatWhatsAppMessage();
      const whatsappUrl = `https://wa.me/918867718080?text=${encodeURIComponent(message)}`;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

      setTimeout(() => {
        setFormData({
          eventTitle: '',
          eventDate: '',
          eventTime: '',
          location: '',
          meetingPoint: '',
          description: '',
          expectedAttendees: '',
          organizerName: '',
          organizerPhone: '',
          organizerEmail: '',
          eventType: '',
          requirements: ''
        });
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Event proposal error:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center border border-green-500">
          <div className="mb-6">
            <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Event Proposal Submitted!</h3>
            <p className="text-gray-300">
              Your event proposal is being sent for review. 
              You will be redirected automatically.
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Calendar className="h-6 w-6 text-orange-500 mr-2" />
            Propose New Event
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            📱 Your event proposal will be sent to our Whatsapp for review and approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg text-sm text-center font-medium">
            <ShieldCheck className="h-4 w-4 inline-block mr-2" />
            Your data will be kept confidential and will not be shared with anyone.
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-orange-500 mr-2" />
              Event Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="eventTitle"
                placeholder="Event Title"
                value={formData.eventTitle}
                onChange={handleInputChange}
                className="md:col-span-2 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Event Location"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="meetingPoint"
                placeholder="Meeting Point"
                value={formData.meetingPoint}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                required
              >
                <option value="">Select Event Type</option>
                <option value="group-ride">Group Ride</option>
                <option value="charity-ride">Charity Ride</option>
                <option value="workshop">Workshop</option>
                <option value="social-gathering">Social Gathering</option>
                <option value="rally">Rally</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 text-orange-500 mr-2" />
              Event Details
            </h4>
            <div className="space-y-4">
              <textarea
                name="description"
                placeholder="Event Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="number"
                name="expectedAttendees"
                placeholder="Expected Number of Attendees"
                value={formData.expectedAttendees}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <textarea
                name="requirements"
                placeholder="Special Requirements (Optional)"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 text-orange-500 mr-2" />
              Organizer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="organizerName"
                placeholder="Your Name"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="organizerPhone"
                placeholder="Your Phone"
                value={formData.organizerPhone}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
              <input
                type="email"
                name="organizerEmail"
                placeholder="Your Email"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5" />
                  <span>Submit Event Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposeEventForm;
