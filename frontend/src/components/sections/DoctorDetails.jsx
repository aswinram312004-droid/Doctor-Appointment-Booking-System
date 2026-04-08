import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, MapPin, Mail, Phone, 
  Star, ArrowLeft, Check, X, AlertCircle, UserCircle, CreditCard
} from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
     reason: ''
  });
  const [errors, setErrors] = useState({});

  const getToken = () => localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      days.push(formattedDate);
    }
    return days;
  };

  const availableDates = getNext7Days();

  // Fetch doctor details
  const fetchDoctorDetails = async () => {
    const token = getToken();
    if (!token) {
      setError('Please login to view doctor details');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching doctor details for ID:', id);
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Doctor not found');
        }
        throw new Error('Failed to fetch doctor details');
      }
      
      const data = await response.json();
      console.log('Doctor data received:', data);
      
      setDoctor({
        ...data,
        hospital: 'Main Hospital',
        about: `Dr. ${data.name} is a renowned ${data.specialization} specialist with extensive experience in treating various conditions. Dr. ${data.name} has successfully treated thousands of patients and is known for providing compassionate care.`,
        rating: 4.5,
        reviews: 128
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots for selected date
  const fetchSlots = async (date) => {
    const token = getToken();
    if (!token) return;

    setSlotsLoading(true);
    try {
      console.log('Fetching slots for date:', date);
      const response = await fetch(`${API_BASE_URL}/doctors/${id}/slots?date=${date}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      
      const data = await response.json();
      console.log('Slots received:', data);
      
      setSlots(prev => ({
        ...prev,
        [date]: data.slots || []
      }));
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlots(prev => ({
        ...prev,
        [date]: []
      }));
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate && !slots[selectedDate]) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  // Set first available date as default when doctor loads
  useEffect(() => {
    if (doctor && !selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [doctor]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.is_booked) {
      setSelectedSlot(slot);
    }
  };

  const handleBookNow = () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    // Validate
    const newErrors = {};
     if (!bookingData.reason.trim()) newErrors.reason = 'Reason for visit required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = getToken();
    const payload = {
      doctor_id: parseInt(id),
      slot_date: selectedDate,
      slot_time: selectedSlot.slot_time,
      notes: bookingData.reason
    };

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Booking failed');
      }

      setBookingConfirmed(true);
      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#378ADD] mb-4"></div>
            <p className="text-[#64748B]">Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Error Loading Doctor</h3>
            <p className="text-[#64748B] mb-4">{error}</p>
            <button
              onClick={() => navigate('/doctors')}
              className="px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Doctor Not Found</h3>
            <p className="text-[#64748B] mb-4">The doctor you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/doctors')}
              className="px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSlots = slots[selectedDate] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctors')}
          className="mb-6 flex items-center gap-2 text-[#64748B] hover:text-[#378ADD] transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Doctors
        </button>

        {/* Doctor Info */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                  <UserCircle size={64} className="text-[#378ADD]" />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{doctor.name}</h1>
                <p className="text-lg text-[#378ADD] font-medium mb-4">{doctor.specialization}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <MapPin size={16} className="text-[#378ADD]" />
                    <span>{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Clock size={16} className="text-[#378ADD]" />
                    <span>Available: {doctor.available_from} - {doctor.available_to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Mail size={16} className="text-[#378ADD]" />
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Phone size={16} className="text-[#378ADD]" />
                    <span>{doctor.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={16} className={i <= doctor.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                    <span className="text-sm text-[#64748B] ml-2">({doctor.reviews} reviews)</span>
                  </div>
                  <div className="text-sm text-[#64748B]">•</div>
                  <div className="text-sm text-[#64748B]">10+ years experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">About</h2>
          <p className="text-[#64748B] leading-relaxed">{doctor.about}</p>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Book Appointment</h2>
          
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#0F172A] mb-3">Select Date</label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 text-center rounded-xl border transition-all ${
                    selectedDate === date
                      ? 'bg-[#378ADD] text-white border-[#378ADD]'
                      : 'border-gray-200 text-[#64748B] hover:border-[#378ADD]'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-bold">
                    {new Date(date).getDate()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0F172A] mb-3">Select Time Slot</label>
              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#378ADD]"></div>
                </div>
              ) : currentSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {currentSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={slot.is_booked}
                      className={`p-2 text-center rounded-lg border transition-all ${
                        slot.is_booked
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedSlot?.id === slot.id
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'border-gray-200 text-[#64748B] hover:border-[#378ADD]'
                      }`}
                    >
                      {slot.slot_time}
                      {slot.is_booked && <span className="text-xs block">Booked</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-[#64748B]">No available slots for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Book Button */}
          {selectedSlot && !selectedSlot.is_booked && (
            <button
              onClick={handleBookNow}
              className="w-full py-3 bg-[#378ADD] text-white rounded-xl font-semibold hover:bg-[#185FA5] transition-colors"
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#0F172A]">Confirm Booking</h3>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {!bookingConfirmed ? (
                <>
                  <div className="bg-sky-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-[#0F172A] mb-1"><strong>Doctor:</strong> {doctor.name}</p>
                    <p className="text-sm text-[#0F172A] mb-1"><strong>Date:</strong> {selectedDate}</p>
                    <p className="text-sm text-[#0F172A]"><strong>Time:</strong> {selectedSlot?.slot_time}</p>
                  </div>

                  <div className="space-y-4">
  
 

                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-2">Reason for Visit *</label>
                      <textarea
                        rows="3"
                        value={bookingData.reason}
                        onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD] ${
                          errors.reason ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Describe your symptoms or reason for visit"
                      />
                      {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleBookingSubmit}
                    className="w-full mt-6 py-3 bg-[#1D9E75] text-white rounded-xl font-semibold hover:bg-[#0F6E56] transition-colors"
                  >
                    Confirm Booking
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-[#0F172A] mb-2">Booking Confirmed!</h4>
                  <p className="text-[#64748B]">Your appointment has been successfully booked.</p>
                  <p className="text-[#64748B] text-sm mt-2">Redirecting to appointments...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;