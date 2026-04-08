import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, Filter, Clock, MapPin, User, Stethoscope, X, AlertCircle, Bell, UserCircle } from 'lucide-react';

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [uniqueDoctors, setUniqueDoctors] = useState([]);
  const [viewModal, setViewModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New states for expiry notifications
  const [expiredAppointments, setExpiredAppointments] = useState([]);
  const [showExpiryNotification, setShowExpiryNotification] = useState(false);
  const [dismissedExpiries, setDismissedExpiries] = useState(new Set());

  const getToken = () => localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  // Check for expired appointments periodically
  useEffect(() => {
    const checkExpiredAppointments = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/appointments/expired-notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const expired = await response.json();
          
          // Filter out already dismissed ones
          const newExpired = expired.filter(apt => !dismissedExpiries.has(apt.id));
          
          if (newExpired.length > 0) {
            setExpiredAppointments(newExpired);
            setShowExpiryNotification(true);
          }
        }
      } catch (err) {
        console.error('Error checking expired appointments:', err);
      }
    };

    // Check immediately on mount
    checkExpiredAppointments();
    
    // Check every minute
    const interval = setInterval(checkExpiredAppointments, 60000);
    
    return () => clearInterval(interval);
  }, [dismissedExpiries]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError('Please login to view your appointments');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        console.log(data)
        
const transformedAppointments = data.map(apt => ({
  id: apt.id,
  doctorName: apt.doctor?.name || 'Unknown Doctor',
  doctorSpecialty: apt.doctor?.specialization || 'General Medicine',
  patientName: apt.patient?.name || 'Patient',
  date: apt.slot?.date || apt.slot_date,
  time: apt.slot?.time || apt.slot_time,
  reason: apt.notes || 'Consultation',
  status: apt.status,
  bookedAt: apt.created_at,
  expiresAt: apt.expires_at,
  expiryNotified: apt.expiry_notified,
  hospital: 'Main Hospital',
  doctorImage: null,
}));

        setAppointments(transformedAppointments);
        setFilteredAppointments(transformedAppointments);
        
        const doctors = [...new Set(transformedAppointments.map(apt => apt.doctorName))];
        setUniqueDoctors(doctors);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Mark expiry as acknowledged
  const acknowledgeExpiry = async (appointmentId) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/appointments/${appointmentId}/mark-expiry-notified`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Add to dismissed set
      setDismissedExpiries(prev => new Set([...prev, appointmentId]));
      
      // Remove from expired list
      setExpiredAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // If no more expired appointments, hide notification
      if (expiredAppointments.length <= 1) {
        setShowExpiryNotification(false);
      }

      // Update appointment status in main list
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'expired' }
            : apt
        )
      );
    } catch (err) {
      console.error('Error acknowledging expiry:', err);
    }
  };

  // Dismiss all expiry notifications
  const dismissAllExpiries = () => {
    expiredAppointments.forEach(apt => {
      setDismissedExpiries(prev => new Set([...prev, apt.id]));
    });
    setExpiredAppointments([]);
    setShowExpiryNotification(false);
  };

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }
    
    if (selectedDoctor) {
      filtered = filtered.filter(apt => apt.doctorName === selectedDoctor);
    }
    
    setFilteredAppointments(filtered);
  }, [searchTerm, selectedDate, selectedDoctor, appointments]);

  const uniqueDates = [...new Set(appointments.map(apt => apt.date))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedDoctor('');
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login to cancel appointments');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      const updated = appointments.filter(apt => apt.id !== id);
      setAppointments(updated);
      
      const doctors = [...new Set(updated.map(apt => apt.doctorName))];
      setUniqueDoctors(doctors);
      
      if (viewModal?.id === id) {
        setViewModal(null);
      }
      
      alert('Appointment cancelled successfully');
    } catch (err) {
      alert('Error cancelling appointment: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    try {
      // Handle time in HH:MM:SS format
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr;
    }
  };

  const isAppointmentExpired = (apt) => {
    if (apt.status === 'expired') return true;
    if (!apt.expiresAt) return false;
    return new Date(apt.expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#378ADD]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Error Loading Appointments</h3>
            <p className="text-[#64748B] mb-4">{error}</p>
            <a
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      {/* Expiry Notification Banner */}
      {showExpiryNotification && expiredAppointments.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Bell className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 mb-2">
                  Appointments Expired ({expiredAppointments.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {expiredAppointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{apt.doctor_name}</p>
                        <p className="text-gray-600">{apt.slot_date} at {apt.slot_time}</p>
                      </div>
                      <button
                        onClick={() => acknowledgeExpiry(apt.id)}
                        className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={dismissAllExpiries}
                  className="mt-3 text-sm text-amber-700 hover:text-amber-900"
                >
                  Dismiss All
                </button>
              </div>
              <button
                onClick={() => setShowExpiryNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
            My <span className="text-gradient">Appointments</span>
          </h1>
          <p className="text-[#64748B]">
            You have {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-sky-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by doctor, patient, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD] bg-white appearance-none cursor-pointer"
                >
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD] bg-white appearance-none cursor-pointer"
                >
                  <option value="">All Doctors</option>
                  {uniqueDoctors.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || selectedDate || selectedDoctor) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Grid */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((apt) => {
              const isExpired = isAppointmentExpired(apt);
              
              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                    isExpired ? 'border-amber-200 opacity-75' : 'border-sky-100'
                  }`}
                >
                  <div className="p-5">
                    {/* Expiry Badge */}
                    {isExpired && (
                      <div className="mb-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium">This appointment has expired</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Doctor Image with fallback to UserCircle icon */}
                        {apt.doctorImage ? (
                          <img
                            src={apt.doctorImage}
                            alt={apt.doctorName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#378ADD]"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center border-2 border-[#378ADD]">
                                <svg class="w-8 h-8 text-[#378ADD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center border-2 border-[#378ADD]">
                            <UserCircle size={32} className="text-[#378ADD]" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-[#0F172A]">{apt.doctorName}</h3>
                          <p className="text-sm text-[#378ADD] font-medium">{apt.doctorSpecialty}</p>
                          <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {apt.hospital}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewModal(apt)}
                        className="text-[#378ADD] hover:text-[#185FA5] text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <CalendarIcon size={14} className="text-[#378ADD]" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <Clock size={14} className="text-[#378ADD]" />
                          <span>{formatTime(apt.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <User size={14} className="text-[#378ADD]" />
                          <span>{apt.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <Stethoscope size={14} className="text-[#378ADD]" />
                          <span className="truncate">{apt.reason}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {apt.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    {!isExpired && apt.status !== 'cancelled' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => cancelAppointment(apt.id)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
              <CalendarIcon size={32} className="text-[#378ADD]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">No Appointments Found</h3>
            <p className="text-[#64748B] mb-4">
              {appointments.length === 0 
                ? "You haven't booked any appointments yet." 
                : "No appointments match your filters."}
            </p>
            <a
              href="/doctors"
              className="inline-block px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Book an Appointment
            </a>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0F172A]">Appointment Details</h2>
              <button onClick={() => setViewModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {isAppointmentExpired(viewModal) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700">
                  <AlertCircle size={18} />
                  <span className="text-sm">This appointment has expired</span>
                </div>
              )}

              <div className="flex items-center gap-3 pb-3 border-b">
                {viewModal.doctorImage ? (
                  <img
                    src={viewModal.doctorImage}
                    alt={viewModal.doctorName}
                    className="w-14 h-14 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        <svg class="w-7 h-7 text-[#378ADD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>`;
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                    <UserCircle size={28} className="text-[#378ADD]" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#0F172A]">{viewModal.doctorName}</p>
                  <p className="text-sm text-[#378ADD]">{viewModal.doctorSpecialty}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <CalendarIcon size={16} className="text-[#378ADD]" /> 
                  <strong>Date:</strong> {formatDate(viewModal.date)}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-[#378ADD]" /> 
                  <strong>Time:</strong> {formatTime(viewModal.time)}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-[#378ADD]" /> 
                  <strong>Hospital:</strong> {viewModal.hospital}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-[#378ADD]" /> 
                  <strong>Patient:</strong> {viewModal.patientName}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Stethoscope size={16} className="text-[#378ADD]" /> 
                  <strong>Reason:</strong> {viewModal.reason}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-[#378ADD]" /> 
                  <strong>Status:</strong> 
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    viewModal.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    viewModal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    viewModal.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewModal.status || 'pending'}
                  </span>
                </p>
                {viewModal.expiresAt && (
                  <p className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-[#378ADD]" /> 
                    <strong>Expires:</strong> {new Date(viewModal.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {!isAppointmentExpired(viewModal) && viewModal.status !== 'cancelled' && (
              <button
                onClick={() => cancelAppointment(viewModal.id)}
                className="w-full mt-6 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;