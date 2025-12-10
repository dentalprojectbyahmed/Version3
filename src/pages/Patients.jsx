import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { db } from '../services/database';
import { format } from 'date-fns';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', mobileNumber: '', email: '', cnic: '', dateOfBirth: '',
    gender: 'male', address: '', behaviorTags: [],
    medicalAlerts: [], // allergies, diabetes, hypertension, heart disease, etc.
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const behaviorTagOptions = [
    { value: 'vip', label: '👑 VIP', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'miser', label: '💸 Miser', color: 'bg-red-100 text-red-800' },
    { value: 'con-artist', label: '🎭 Con Artist', color: 'bg-orange-100 text-orange-800' },
    { value: 'rich', label: '💰 Rich', color: 'bg-green-100 text-green-800' },
    { value: 'poor', label: '🤲 Poor', color: 'bg-muted text-foreground' },
    { value: 'cooperative', label: '😊 Cooperative', color: 'bg-blue-100 text-blue-800' },
    { value: 'difficult', label: '😤 Difficult', color: 'bg-purple-100 text-purple-800' },
    { value: 'phobia', label: '😱 Phobia', color: 'bg-pink-100 text-pink-800' },
    { value: 'children', label: '👶 Children', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'elderly', label: '👴 Elderly', color: 'bg-indigo-100 text-indigo-800' },
  ];

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    const allPatients = await db.patients.orderBy('registrationDate').reverse().toArray();
    setPatients(allPatients);
  };

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(p =>
      p.name.toLowerCase().includes(query) || p.mobileNumber.includes(query) || (p.cnic && p.cnic.includes(query))
    );
    setFilteredPatients(filtered);
  };

  const openModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({ ...patient });
    } else {
      setEditingPatient(null);
      setFormData({ name: '', mobileNumber: '', email: '', cnic: '', dateOfBirth: '', gender: 'male', address: '', behaviorTags: [] });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const patientData = {
      ...formData,
      registrationDate: editingPatient ? editingPatient.registrationDate : new Date().toISOString(),
      lastVisit: editingPatient ? editingPatient.lastVisit : null,
    };
    if (editingPatient) {
      await db.patients.update(editingPatient.id, patientData);
    } else {
      await db.patients.add(patientData);
    }
    await loadPatients();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this patient?')) {
      await db.patients.delete(id);
      await loadPatients();
    }
  };

  const toggleTag = (tag) => {
    const tags = formData.behaviorTags || [];
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    setFormData({ ...formData, behaviorTags: newTags });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage patient records</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />Add Patient
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input type="text" placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{patients.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-2xl font-bold">
            {patients.filter(p => {
              const d = new Date(p.registrationDate);
              const n = new Date();
              return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
            }).length}
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">VIP</div>
          <div className="text-2xl font-bold">{patients.filter(p => p.behaviorTags?.includes('vip')).length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Children</div>
          <div className="text-2xl font-bold">{patients.filter(p => p.behaviorTags?.includes('children')).length}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Registration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tags</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.map((p) => (
              <tr key={p.id} className="hover:bg-background">
                <td className="px-6 py-4">
                  <Link to={`/patients/${p.id}`} className="font-medium text-foreground hover:text-primary-600">{p.name}</Link>
                  <div className="text-sm text-muted-foreground">{p.gender}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm"><Phone className="w-4 h-4 mr-1" />{p.mobileNumber}</div>
                  {p.email && <div className="flex items-center text-sm text-muted-foreground"><Mail className="w-4 h-4 mr-1" />{p.email}</div>}
                </td>
                <td className="px-6 py-4 text-sm">{format(new Date(p.registrationDate), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.behaviorTags?.map(tag => {
                      const t = behaviorTagOptions.find(x => x.value === tag);
                      return t ? <span key={tag} className={`px-2 py-1 text-xs rounded ${t.color}`}>{t.label}</span> : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(p)} className="text-primary-600 hover:text-primary-900 mr-3">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPatients.length === 0 && <div className="text-center py-12 text-muted-foreground">No patients found</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingPatient ? 'Edit' : 'Add'} Patient</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-muted-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile *</label>
                  <input type="tel" required value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CNIC</label>
                  <input type="text" value={formData.cnic} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Birth Date</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Behavior Tags</label>
                <div className="flex flex-wrap gap-2">
                  {behaviorTagOptions.map(tag => (
                    <button key={tag.value} type="button" onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1 text-sm rounded border ${formData.behaviorTags?.includes(tag.value) ? tag.color : 'border-border bg-card'}`}>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-background">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingPatient ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
