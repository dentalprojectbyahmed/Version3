import { useState, useEffect } from 'react';
import { Search, Edit2, DollarSign, RefreshCw } from 'lucide-react';
import { db } from '../services/database';
import { currencyService } from '../services/currency';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [exchangeRate, setExchangeRate] = useState(278);

  const categories = ['all', 'Preventive', 'Restorative', 'Endodontics', 'Prosthodontics', 'Surgery', 'Orthodontics', 'Periodontics', 'Pediatric', 'Cosmetic', 'Implants', 'Emergency'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTreatments();
  }, [searchQuery, selectedCategory, treatments]);

  const loadData = async () => {
    const trts = await db.treatmentCatalog.toArray();
    const rate = await currencyService.getRate();
    
    const withPKR = trts.map(t => ({
      ...t,
      pricePKR: Math.round(t.priceUSD * rate)
    }));
    
    setTreatments(withPKR);
    setExchangeRate(rate);
  };

  const filterTreatments = () => {
    let filtered = treatments;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTreatments(filtered);
  };

  const refreshRates = async () => {
    const rate = await currencyService.fetchLiveRate();
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Treatment Catalog</h1>
          <p className="text-muted-foreground mt-1">70 treatments with live USD → PKR conversion</p>
        </div>
        <button onClick={refreshRates} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <RefreshCw className="w-5 h-5 mr-2" />Refresh Rates
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input type="text" placeholder="Search treatments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">$1 = Rs. {exchangeRate}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-card text-foreground hover:bg-background'}`}>
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {categories.filter(c => c !== 'all').map(category => {
          const categoryTreatments = filteredTreatments.filter(t => t.category === category);
          if (categoryTreatments.length === 0 && selectedCategory !== 'all') return null;
          if (categoryTreatments.length === 0) return null;
          
          return (
            <div key={category} className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-background px-6 py-3 border-b">
                <h3 className="font-semibold text-foreground">{category} ({categoryTreatments.length})</h3>
              </div>
              <div className="divide-y">
                {categoryTreatments.map(t => (
                  <div key={t.id} className="px-6 py-4 hover:bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{t.code}</span>
                          <span className="font-medium text-foreground">{t.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{t.description}</div>
                        {t.fdiNotation && (
                          <div className="text-xs text-muted-foreground mt-1">FDI: {t.fdiNotation}</div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-foreground">Rs. {t.pricePKR?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">${t.priceUSD}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTreatments.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm p-12 text-center">
          <div className="text-muted-foreground text-lg">No treatments found</div>
        </div>
      )}
    </div>
  );
}
