import { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign } from 'lucide-react';
import { db } from '../services/database';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Supplies', description: '', amount: 0, date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash', vendor: '', notes: ''
  });

  const categories = ['Supplies', 'Equipment', 'Rent', 'Utilities', 'Salaries', 'Maintenance', 'Marketing', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const exp = await db.expenses.orderBy('date').reverse().toArray();
    setExpenses(exp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.expenses.add({ ...formData, amount: parseFloat(formData.amount) });
    await loadData();
    setShowModal(false);
    setFormData({ category: 'Supplies', description: '', amount: 0, date: format(new Date(), 'yyyy-MM-dd'), paymentMethod: 'cash', vendor: '', notes: '' });
  };

  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track clinic expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />Add Expense
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-2xl font-bold">Rs. {monthTotal.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Expenses</div>
          <div className="text-2xl font-bold">{expenses.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Categories</div>
          <div className="text-2xl font-bold">{new Set(expenses.map(e => e.category)).size}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Avg Expense</div>
          <div className="text-2xl font-bold">Rs. {expenses.length > 0 ? Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toLocaleString() : 0}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Vendor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-background">
                <td className="px-6 py-4 text-sm">{format(new Date(exp.date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{exp.category}</span></td>
                <td className="px-6 py-4 text-sm">{exp.description}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{exp.vendor || '-'}</td>
                <td className="px-6 py-4 text-right font-medium">Rs. {exp.amount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div className="text-center py-12 text-muted-foreground">No expenses recorded</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <input type="text" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (Rs.) *</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <input type="text" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
