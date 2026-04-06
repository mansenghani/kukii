import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, UserPlus, Filter, MoreVertical, Edit2, Trash2, Calendar, Upload, X } from 'lucide-react';

const initialStaffData = [
  {
    id: '#CH-0002',
    name: 'Bhavik Kukadiya',
    joinDate: 'JOINED MAR 2026',
    role: 'Head Chef',
    contact: '3425235534',
    shift: 'Morning',
    shiftSub: 'Full Time • Mon-Fri',
    status: 'ACTIVE',
    avatar: 'https://i.pravatar.cc/150?u=bhavik',
  },
  {
    id: '#CH-0003',
    name: 'jay shah',
    joinDate: 'JOINED MAR 2026',
    role: 'Head Chef',
    contact: '9999',
    shift: 'Morning',
    shiftSub: 'Full Time • Mon-Fri',
    status: 'ACTIVE',
    avatar: 'https://i.pravatar.cc/150?u=jay',
  },
  {
    id: '#MG-0004',
    name: 'man seinghani',
    joinDate: 'JOINED MAR 2026',
    role: 'Manager',
    contact: '9099940404',
    shift: 'Full Day',
    shiftSub: 'Full Time • Mon-Fri',
    status: 'INACTIVE',
    initials: 'MS',
  },
  {
    id: '#MG-0005',
    name: 'jitendrabhai Mohanbhai',
    joinDate: 'JOINED MAR 2026',
    role: 'Manager',
    contact: '9099940404',
    shift: 'Full Day',
    shiftSub: 'Full Time • Mon-Fri',
    status: 'INACTIVE',
    initials: 'JM',
  },
];

const AdminStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [formData, setFormData] = useState({ name: '', role: 'Manager', contact: '', shift: 'Morning' });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name,
      role: staff.role,
      contact: staff.contact,
      shift: staff.shift
    });
    setIsActiveToggle(staff.status === 'ACTIVE');
    setEditingId(staff._id);
    setImagePreview(staff.avatar || null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', role: 'Manager', contact: '', shift: 'Morning' });
    setIsActiveToggle(true);
    setEditingId(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/staff', {
        headers: { Authorization: `Bearer ${localStorage.getItem('kuki_admin_token')}` }
      });
      setStaffList(res.data);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`/api/staff/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('kuki_admin_token')}` }
        });
        fetchStaff();
      } catch (err) {
        console.error('Failed to delete staff', err);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.contact) {
      alert("Please fill in the Full Name and Phone Number fields.");
      return;
    }

    const payload = {
      ...formData,
      status: isActiveToggle ? 'ACTIVE' : 'INACTIVE',
      avatar: imagePreview || ''
    };

    try {
      if (editingId) {
        await axios.put(`/api/staff/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('kuki_admin_token')}` }
        });
      } else {
        await axios.post('/api/staff', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('kuki_admin_token')}` }
        });
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      console.error('Failed to save staff', err);
      const detailedError = err.response?.data?.error || err.message;
      alert("Failed to save staff: " + (err.response?.data?.message || "") + " | " + detailedError);
    }
  };
  const primaryColor = '#7B3F3F';
  const bgColor = '#FAF9F6';

  return (
    <div className="w-full h-full flex flex-col font-sans bg-[#FAF9F6] p-6 md:p-10 rounded-[2rem] shadow-sm">
      {/* Top Search Bar area (matching design) */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search staff, roles, or ID..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7B3F3F]/20"
        />
      </div>

      <div className="mb-2 uppercase text-[10px] tracking-widest text-[#7B3F3F] font-bold">
        ADMIN / STAFF DIRECTORY
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-500 text-sm">Curating the heart of the guest experience.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-[#7B3F3F] hover:bg-[#6A3535] text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm border border-gray-100 cursor-pointer">
            <span className="text-gray-500">Role:</span>
            <span className="font-medium">All Positions</span>
            <Filter className="w-3 h-3 text-gray-400 ml-1" />
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm border border-gray-100 cursor-pointer">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">All</span>
            <Filter className="w-3 h-3 text-gray-400 ml-1" />
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm border border-gray-100 cursor-pointer">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-medium">Join Date: Newest</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wide uppercase text-[11px]">
          DISPLAYING {staffList.length} OF {staffList.length} STAFF
          <button className="p-2 bg-white rounded-full shadow-sm ml-2">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Staff Member</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Shift Timing</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staffList.map((staff, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 text-sm text-gray-500 font-medium">#{staff._id?.slice(-6).toUpperCase()}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {staff.avatar ? (
                      <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold uppercase">
                        {staff.initials}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 capitalize">{staff.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{staff.joinDate}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-gray-700">{staff.role}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{staff.contact}</td>
                <td className="py-4 px-6">
                  <div className="text-sm font-bold text-gray-900">{staff.shift}</div>
                  <div className="text-[11px] text-gray-400">{staff.shiftSub}</div>
                </td>
                <td className="py-4 px-6">
                  {staff.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(staff)} className="p-2 text-gray-400 hover:text-[#7B3F3F] hover:bg-red-50 rounded-lg transition-colors border border-gray-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(staff._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl relative z-10 flex overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Side: Upload Area */}
            <div className="w-2/5 bg-[#FDFBF9] p-12 flex flex-col items-center justify-center border-r border-gray-100">
              <label className="w-40 h-40 rounded-full border-2 border-dashed border-[#d2c9c9] flex items-center justify-center mb-6 bg-white hover:bg-gray-50 transition-colors mx-auto cursor-pointer relative overflow-hidden group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus className="w-12 h-12 text-gray-300 ml-2 group-hover:scale-110 transition-transform" />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-center text-[#7B3F3F]/70 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[180px]">
                Drag and drop a<br />profile photo or<br />click to upload
              </p>
            </div>

            {/* Right Side: Form Area */}
            <div className="w-3/5 p-12 pb-10 flex flex-col">
              <h2 className="text-4xl font-serif text-gray-900 mb-2 italic tracking-tight">{editingId ? 'Edit Staff' : 'Add New Staff'}</h2>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-10">
                Employee Profile Details
              </p>

              <div className="space-y-6 flex-1">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7B3F3F]/80 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Julian Vercetti"
                    className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#7B3F3F] transition-colors bg-transparent placeholder-gray-300 text-gray-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Role */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#7B3F3F]/80 uppercase tracking-widest mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#7B3F3F] transition-colors bg-transparent text-gray-800 font-medium appearance-none cursor-pointer"
                    >
                      <option>Manager</option>
                      <option>Head Chef</option>
                      <option>Waiter</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#7B3F3F]/80 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#7B3F3F] transition-colors bg-transparent placeholder-gray-300 text-gray-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 items-end">
                  {/* Shift Timing */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#7B3F3F]/80 uppercase tracking-widest mb-2">
                      Shift Timing
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#7B3F3F] transition-colors bg-transparent text-gray-800 font-medium appearance-none cursor-pointer"
                    >
                      <option>Morning</option>
                      <option>Evening</option>
                      <option>Full Day</option>
                    </select>
                  </div>

                  {/* Employment Status */}
                  <div className="flex items-center justify-between py-3 border-b border-transparent">
                    <label className="block text-[10px] font-bold text-[#7B3F3F]/80 uppercase tracking-widest pr-4">
                      Employment<br />Status
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsActiveToggle(!isActiveToggle)}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                          isActiveToggle ? 'bg-[#2E5C46]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${
                            isActiveToggle ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-bold ${isActiveToggle ? 'text-[#2E5C46]' : 'text-gray-400'}`}>
                        {isActiveToggle ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottons */}
              <div className="flex justify-end items-center gap-6 mt-8 pt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-[#7B3F3F] hover:bg-[#6A3535] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#7B3F3F]/30">
                  {editingId ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
