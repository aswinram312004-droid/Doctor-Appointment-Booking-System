import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Edit2, Trash2, Search, X, Check, 
  Clock, Mail, Phone, Stethoscope, ToggleLeft, ToggleRight,
  AlertCircle, Save, Plus
} from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    available_from: '09:00',
    available_to: '17:00',
    slot_minutes: 30,
    is_active: true
  });

  const getToken = () => localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    const token = getToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch doctors');
      
      const data = await response.json();
      setDoctors(data);
      setFilteredDoctors(data);
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
    const filtered = doctors.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open modal for add/edit
  const openModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
        phone: doctor.phone || '',
        available_from: doctor.available_from,
        available_to: doctor.available_to,
        slot_minutes: doctor.slot_minutes,
        is_active: doctor.is_active
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        specialization: '',
        email: '',
        phone: '',
        available_from: '09:00',
        available_to: '17:00',
        slot_minutes: 30,
        is_active: true
      });
    }
    setShowModal(true);
  };

  // Save doctor (add or update)
  const saveDoctor = async () => {
    const token = getToken();
    const url = editingDoctor 
      ? `${API_BASE_URL}/doctors/${editingDoctor.id}`
      : `${API_BASE_URL}/doctors`;
    
    const method = editingDoctor ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save doctor');
      }
      
      await fetchDoctors();
      setShowModal(false);
      alert(editingDoctor ? 'Doctor updated successfully!' : 'Doctor added successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete doctor
// Delete doctor
const deleteDoctor = async (doctor) => {
  if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.name}? This action cannot be undone.`)) {
    return;
  }
  
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctor.id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete doctor');
    }
    
    // Show success message
    alert(data.message || 'Doctor deleted successfully!');
    
    // Refresh the doctors list
    await fetchDoctors();
    
  } catch (err) {
    console.error('Delete error:', err);
    
    // Show detailed error message
    if (err.message.includes('active appointments')) {
      alert(err.message + '\n\nPlease deactivate the doctor instead of deleting.');
    } else {
      alert('Error deleting doctor: ' + err.message);
    }
  }
};
  // Toggle doctor active status
// Toggle doctor active status (soft delete)
const toggleActiveStatus = async (doctor) => {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctor.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ...doctor, 
        is_active: !doctor.is_active 
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    
    await fetchDoctors();
    alert(`Doctor ${doctor.is_active ? 'deactivated' : 'activated'} successfully!`);
  } catch (err) {
    alert('Error updating status: ' + err.message);
  }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
            Manage <span className="text-gradient">Doctors</span>
          </h1>
          <p className="text-[#64748B]">
            Total Doctors: {doctors.length} | Active: {doctors.filter(d => d.is_active).length}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-sky-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, specialization, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add New Doctor
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                  !doctor.is_active ? 'border-amber-200 opacity-75' : 'border-sky-100'
                }`}
              >
                <div className="p-5">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleActiveStatus(doctor)}
                      className="text-gray-400 hover:text-[#378ADD] transition-colors"
                      title={doctor.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {doctor.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                      <Stethoscope size={28} className="text-[#378ADD]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-lg">Dr. {doctor.name}</h3>
                      <p className="text-sm text-[#378ADD] font-medium">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2 text-sm border-t border-[#F1F5F9] pt-3">
                    <p className="flex items-center gap-2 text-[#64748B]">
                      <Mail size={14} className="text-[#378ADD]" />
                      {doctor.email}
                    </p>
                    <p className="flex items-center gap-2 text-[#64748B]">
                      <Phone size={14} className="text-[#378ADD]" />
                      {doctor.phone || 'Not provided'}
                    </p>
                    <p className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={14} className="text-[#378ADD]" />
                      Available: {doctor.available_from} - {doctor.available_to}
                    </p>
                    <p className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={14} className="text-[#378ADD]" />
                      Slot Duration: {doctor.slot_minutes} min
                    </p>
                  </div>

                  {/* Action Buttons */}
<div className="mt-4 flex gap-2">
  <button
    onClick={() => openModal(doctor)}
    className="flex-1 px-3 py-2 text-sm font-medium text-[#378ADD] bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
  >
    <Edit2 size={14} />
    Edit
  </button>
  <button
    onClick={() => toggleActiveStatus(doctor)}
    className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1 ${
      doctor.is_active 
        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
        : 'text-green-600 bg-green-50 hover:bg-green-100'
    }`}
  >
    {doctor.is_active ? 'Deactivate' : 'Activate'}
  </button>
  <button
    onClick={() => deleteDoctor(doctor)}
    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
    disabled={doctor.hasActiveAppointments}
  >
    <Trash2 size={14} />
    Delete
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
              <Stethoscope size={32} className="text-[#378ADD]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">No Doctors Found</h3>
            <p className="text-[#64748B] mb-4">
              {searchTerm ? "No doctors match your search criteria." : "No doctors have been added yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors"
              >
                <Plus size={18} />
                Add Your First Doctor
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0F172A]">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  placeholder="Dr. John Doe"
                />
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  placeholder="Cardiology, Neurology, etc."
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  placeholder="doctor@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Availability Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Available From</label>
                  <input
                    type="time"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Available To</label>
                  <input
                    type="time"
                    name="available_to"
                    value={formData.available_to}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                  />
                </div>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Slot Duration (minutes)</label>
                <select
                  name="slot_minutes"
                  value={formData.slot_minutes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378ADD]"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#378ADD] rounded focus:ring-[#378ADD]"
                />
                <label className="text-sm font-medium text-[#0F172A]">Doctor is active and accepting appointments</label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDoctor}
                className="flex-1 px-4 py-2.5 bg-[#378ADD] text-white rounded-xl hover:bg-[#185FA5] transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;