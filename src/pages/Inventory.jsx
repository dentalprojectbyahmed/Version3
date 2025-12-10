import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import { db } from '../services/database';
import { format } from 'date-fns';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '', category: 'Medical Supplies', quantity: 0, unit: 'pcs',
    reorderLevel: 10, supplier: '', costPerUnit: 0, expiryDate: ''
  });

  const categories = ['Medical Supplies', 'Dental Materials', 'Instruments', 'Medications', 'Office Supplies', 'Equipment'];
  const units = ['pcs', 'box', 'pack', 'bottle', 'roll', 'kg', 'liter'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allItems = await db.inventory.orderBy('itemName').toArray();
    setItems(allItems);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ itemName: '', category: 'Medical Supplies', quantity: 0, unit: 'pcs', reorderLevel: 10, supplier: '', costPerUnit: 0, expiryDate: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { ...formData, lastRestocked: new Date().toISOString() };
    if (editingItem) {
      await db.inventory.update(editingItem.id, itemData);
    } else {
      await db.inventory.add(itemData);
    }
    await loadData();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await db.inventory.delete(id);
      await loadData();
    }
  };

  const lowStockItems = items.filter(i => i.quantity <= i.reorderLevel);
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track clinic supplies and materials</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />Add Item
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Items</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Low Stock</div>
          <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Categories</div>
          <div className="text-2xl font-bold">{new Set(items.map(i => i.category)).size}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Value</div>
          <div className="text-2xl font-bold">Rs. {totalValue.toLocaleString()}</div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
            <div className="font-medium text-orange-800">{lowStockItems.length} items need reordering</div>
          </div>
        </div>
      )}

      {categories.map(category => {
        const categoryItems = items.filter(i => i.category === category);
        if (categoryItems.length === 0) return null;
        
        return (
          <div key={category} className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-background px-6 py-3 border-b">
              <h3 className="font-semibold">{category} ({categoryItems.length})</h3>
            </div>
            <table className="w-full">
              <thead className="bg-background border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categoryItems.map(item => (
                  <tr key={item.id} className="hover:bg-background">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.itemName}</div>
                      {item.expiryDate && (
                        <div className="text-xs text-muted-foreground">Exp: {format(new Date(item.expiryDate), 'MMM yyyy')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${item.quantity <= item.reorderLevel ? 'text-orange-600' : 'text-foreground'}`}>
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">Min: {item.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.supplier || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">Rs. {item.costPerUnit?.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total: Rs. {(item.quantity * item.costPerUnit).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(item)} className="text-primary-600 hover:text-primary-900 mr-3">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="text-muted-foreground text-lg">No inventory items</div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingItem ? 'Edit' : 'Add'} Item</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input type="text" required value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit *</label>
                  <select required value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level *</label>
                  <input type="number" required value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost per Unit</label>
                  <input type="number" value={formData.costPerUnit} onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
