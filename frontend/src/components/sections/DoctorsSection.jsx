import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Stethoscope, 
  Mail, Phone, Star, X, Check, Search, Filter, ArrowRight,
  AlertCircle, ChevronLeft, ChevronRight, UserCircle
} from 'lucide-react';

const DoctorsSection = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState(['All']);

  const getToken = () => localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      setError('Please login to view doctors');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      
      // Transform backend data to frontend format
      const transformedDoctors = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialization,
        email: doc.email,
        phone: doc.phone || 'Not provided',
        hospital: 'Main Hospital',
        experience: '10+ years', // You can add this to DB
        rating: 4.5, // You can add rating system
        reviews: 128,
        about: `Dr. ${doc.name} is a renowned ${doc.specialization} specialist with extensive experience.`,
        available_from: doc.available_from,
        available_to: doc.available_to,
        slot_minutes: doc.slot_minutes,
        is_active: doc.is_active,
        image: null // Will use fallback
      }));
      
      setDoctors(transformedDoctors);
      setFilteredDoctors(transformedDoctors);
      
      // Extract unique specialties
      const uniqueSpecialties = ['All', ...new Set(transformedDoctors.map(doc => doc.specialty))];
      setSpecialties(uniqueSpecialties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors
  useEffect(() => {
    let filtered = doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialty && selectedSpecialty !== 'All') {
      filtered = filtered.filter(doc => doc.specialty === selectedSpecialty);
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  const handleViewDetails = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#378ADD]"></div>
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
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Error Loading Doctors</h3>
            <p className="text-[#64748B] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
            Meet Our Expert <span className="text-gradient">Medical Team</span>
          </h1>
          <p className="text-[#64748B]">
            Board-certified doctors with decades of experience.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-sky-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD] bg-white appearance-none cursor-pointer"
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            
            {(searchTerm || selectedSpecialty !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('All');
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-sm text-[#64748B]">
            Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
              <Stethoscope size={32} className="text-[#378ADD]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">No Doctors Found</h3>
            <p className="text-[#64748B] mb-4">
              No doctors match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('All');
              }}
              className="px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onViewDetails }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-sky-100">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <UserCircle size={32} className="text-[#378ADD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">{doctor.name}</h3>
            <p className="text-sm text-[#378ADD] font-medium">{doctor.specialty}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm border-t border-[#F1F5F9] pt-3">
          <p className="flex items-center gap-2 text-[#64748B]">
            <MapPin size={14} className="text-[#378ADD]" />
            {doctor.hospital}
          </p>
          <p className="flex items-center gap-2 text-[#64748B]">
            <Clock size={14} className="text-[#378ADD]" />
            Available: {doctor.available_from} - {doctor.available_to}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={14} className={i <= doctor.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
              ))}
              <span className="text-xs text-[#64748B] ml-1">({doctor.reviews})</span>
            </div>
            <span className="text-xs text-[#64748B]">{doctor.experience}</span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(doctor.id)}
          className="w-full mt-4 px-3 py-2 text-sm font-medium text-white bg-[#378ADD] rounded-xl hover:bg-[#185FA5] transition-colors flex items-center justify-center gap-2"
        >
          View Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DoctorsSection;