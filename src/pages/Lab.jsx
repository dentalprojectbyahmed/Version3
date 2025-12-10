import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { db } from '../services/database';
import { format } from 'date-fns';

export default function Lab() {
  const [labWork, setLabWork] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', labName: '', workType: 'Crown', description: '',
    sentDate: format(new Date(), 'yyyy-MM-dd'), expectedDate: '', cost: 0, status: 'sent'
  });

  const workTypes = ['Crown', 'Bridge', 'Denture', 'Implant', 'Orthodontic Appliance', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pts = await db.patients.toArray();
    const work = await db.labWork.orderBy('sentDate').reverse().toArray();
    const withPatients = await Promise.all(work.map(async w => ({
      ...w,
      patient: await db.patients.get(w.patientId)
    })));
    setPatients(pts);
    setLabWork(withPatients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.labWork.add({ ...formData, cost: parseFloat(formData.cost), notes: '' });
    await loadData();
    setShowModal(false);
    setFormData({
      patientId: '', labName: '', workType: 'Crown', description: '',
      sentDate: format(new Date(), 'yyyy-MM-dd'), expectedDate: '', cost: 0, status: 'sent'
    });
  };

  const markAsReceived = async (id) => {
    await db.labWork.update(id, { status: 'received', receivedDate: new Date().toISOString() });
    await loadData();
  };

  const pending = labWork.filter(w => w.status === 'sent');
  const completed = labWork.filter(w => w.status === 'received');

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lab Work</h1>
          <p className="text-muted-foreground mt-1">Track lab work orders</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />New Order
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Orders</div>
          <div className="text-2xl font-bold">{labWork.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{pending.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completed.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="text-2xl font-bold">Rs. {labWork.reduce((sum, w) => sum + w.cost, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Work Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {labWork.map(work => (
              <tr key={work.id} className="hover:bg-background">
                <td className="px-6 py-4">
                  <div className="font-medium">{work.patient?.name}</div>
                  <div className="text-sm text-muted-foreground">{work.description}</div>
                </td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{work.workType}</span></td>
                <td className="px-6 py-4 text-sm">{work.labName}</td>
                <td className="px-6 py-4 text-sm">
                  <div>Sent: {format(new Date(work.sentDate), 'MMM d')}</div>
                  {work.expectedDate && <div className="text-muted-foreground">Due: {format(new Date(work.expectedDate), 'MMM d')}</div>}
                </td>
                <td className="px-6 py-4">
                  {work.status === 'sent' ? (
                    <button
                      onClick={() => markAsReceived(work.id)}
                      className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Mark Received
                    </button>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      Received
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-medium">Rs. {work.cost?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {labWork.length === 0 && <div className="text-center py-12 text-muted-foreground">No lab work orders</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">New Lab Order</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Work Type *</label>
                  <select required value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg">
                    {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lab Name *</label>
                  <input type="text" required value={formData.labName} onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sent Date *</label>
                  <input type="date" required value={formData.sentDate} onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Date</label>
                  <input type="date" value={formData.expectedDate} onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost (Rs.)</label>
                <input type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
