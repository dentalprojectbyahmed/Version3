import { useState, useEffect } from 'react';
import { Plus, Search, Download, Eye, DollarSign, Check, X, Share2 } from 'lucide-react';
import { db } from '../services/database';
import { currencyService } from '../services/currency';
import { pdfService } from '../services/pdf';
import { shareService } from '../utils/share';
import { format } from 'date-fns';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '', discount: 0, notes: '', paymentMethod: 'cash'
  });
  const [exchangeRate, setExchangeRate] = useState(278);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pts = await db.patients.toArray();
    const trts = await db.treatmentCatalog.toArray();
    const invs = await db.invoices.orderBy('invoiceDate').reverse().toArray();
    const rate = await currencyService.getRate();
    
    const withPatients = await Promise.all(invs.map(async inv => ({
      ...inv,
      patient: await db.patients.get(inv.patientId)
    })));
    
    setPatients(pts);
    setTreatments(trts);
    setInvoices(withPatients);
    setExchangeRate(rate);
  };

  const addItem = (treatment) => {
    setSelectedItems([...selectedItems, { 
      treatmentId: treatment.id, 
      name: treatment.name, 
      priceUSD: treatment.priceUSD,
      pricePKR: Math.round(treatment.priceUSD * exchangeRate),
      quantity: 1,
      toothNumber: ''
    }]);
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'priceUSD') {
      updated[index].pricePKR = Math.round(updated[index].priceUSD * updated[index].quantity * exchangeRate);
    }
    setSelectedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const total = subtotal - discountAmount;
    const totalPKR = Math.round(total * exchangeRate);
    
    const invoiceData = {
      patientId: formData.patientId,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      items: selectedItems,
      subtotal,
      discount: formData.discount,
      tax: 0,
      total,
      totalPKR,
      exchangeRate,
      paymentStatus: 'pending',
      paymentMethod: formData.paymentMethod,
      paidAmount: 0,
      dueAmount: totalPKR,
      notes: formData.notes
    };
    
    await db.invoices.add(invoiceData);
    await loadData();
    setShowModal(false);
    setSelectedItems([]);
    setFormData({ patientId: '', discount: 0, notes: '', paymentMethod: 'cash' });
  };

  const markAsPaid = async (id, amount) => {
    await db.invoices.update(id, { 
      paymentStatus: 'paid',
      paidAmount: amount,
      dueAmount: 0
    });
    await loadData();
  };

  const shareInvoice = async (invoice) => {
    const settings = await db.settings.toArray();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    
    const doc = pdfService.generateInvoice(invoice, invoice.patient, settingsObj);
    const pdfBlob = doc.output('blob');
    await shareService.shareInvoice(invoice, invoice.patient, pdfBlob);
  };

  const downloadInvoice = async (invoice) => {
    const settings = await db.settings.toArray();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    
    const doc = pdfService.generateInvoice(invoice, invoice.patient, settingsObj);
    pdfService.downloadPDF(doc, `Invoice-${invoice.invoiceNumber}.pdf`);
   };

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const total = subtotal - discountAmount;
  const totalPKR = Math.round(total * exchangeRate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">Generate and manage invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Invoices</div>
          <div className="text-2xl font-bold">{invoices.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-orange-600">
            {invoices.filter(i => i.paymentStatus === 'pending').length}
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.paymentStatus === 'paid').length}
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-bold">
            Rs. {invoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + i.totalPKR, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-background">
                <td className="px-6 py-4">
                  <div className="font-medium">{inv.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground">{inv.items?.length || 0} items</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{inv.patient?.name || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">{inv.patient?.mobileNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm">{format(new Date(inv.invoiceDate), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">Rs. {inv.totalPKR?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">${inv.total?.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {inv.paymentStatus === 'pending' && (
                    <button onClick={() => markAsPaid(inv.id, inv.totalPKR)} className="text-green-600 hover:text-green-900 mr-3">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => downloadInvoice(inv)} className="text-primary-600 hover:text-primary-900 mr-3" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => shareInvoice(inv)} className="text-green-600 hover:text-green-900" title="Share via WhatsApp">
                    <Share2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="text-center py-12 text-muted-foreground">No invoices yet</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Invoice</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient *</label>
                  <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Add Treatments</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {treatments.slice(0, 30).map(t => (
                    <button key={t.id} type="button" onClick={() => addItem(t)}
                      className="text-left px-2 py-1 text-sm border rounded hover:bg-primary-50">
                      {t.name} - ${t.priceUSD}
                    </button>
                  ))}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-2">Selected Items</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Treatment</th>
                        <th className="text-left py-1 w-20">Qty</th>
                        <th className="text-left py-1 w-24">Tooth</th>
                        <th className="text-right py-1 w-24">USD</th>
                        <th className="text-right py-1 w-24">PKR</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td><input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded" /></td>
                          <td><input type="text" value={item.toothNumber} onChange={(e) => updateItem(idx, 'toothNumber', e.target.value)}
                            className="w-20 px-2 py-1 border rounded" placeholder="11" /></td>
                          <td className="text-right">${(item.priceUSD * item.quantity).toFixed(2)}</td>
                          <td className="text-right">Rs. {(item.pricePKR * item.quantity).toLocaleString()}</td>
                          <td><button type="button" onClick={() => removeItem(idx)} className="text-red-600"><X className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount (%)</label>
                  <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Exchange Rate</label>
                  <input type="text" value={`$1 = Rs. ${exchangeRate}`} disabled className="w-full px-3 py-2 border rounded-lg bg-background" />
                </div>
              </div>

              <div className="bg-background rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)} / Rs. {Math.round(subtotal * exchangeRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Discount ({formData.discount}%):</span>
                  <span>-${discountAmount.toFixed(2)} / Rs. {Math.round(discountAmount * exchangeRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)} / Rs. {totalPKR.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={selectedItems.length === 0} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
