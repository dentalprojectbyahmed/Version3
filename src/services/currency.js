// Currency Exchange Service (USD to PKR)
import { db } from './database';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export class CurrencyService {
  constructor() {
    this.currentRate = 278; // Default fallback
    this.lastUpdate = null;
  }

  // Fetch live exchange rate
  async fetchLiveRate() {
    try {
      const response = await fetch(EXCHANGE_API_URL);
      const data = await response.json();
      
      if (data && data.rates && data.rates.PKR) {
        this.currentRate = data.rates.PKR;
        this.lastUpdate = new Date().toISOString();
        
        // Save to settings
        await db.settings.put({ key: 'exchangeRate', value: this.currentRate.toString() });
        await db.settings.put({ key: 'exchangeRateUpdated', value: this.lastUpdate });
        
        console.log(`✅ Exchange rate updated: $1 = Rs. ${this.currentRate}`);
        return this.currentRate;
      }
    } catch (error) {
      console.error('❌ Failed to fetch exchange rate:', error);
      
      // Try to get cached rate from settings
      const cachedRate = await db.settings.get('exchangeRate');
      if (cachedRate) {
        this.currentRate = parseFloat(cachedRate.value);
      }
    }
    
    return this.currentRate;
  }

  // Get current rate (from cache or fetch)
  async getRate(forceRefresh = false) {
    if (forceRefresh || !this.lastUpdate) {
      return await this.fetchLiveRate();
    }
    
    // Check if rate is older than 1 hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const lastUpdateTime = this.lastUpdate ? new Date(this.lastUpdate).getTime() : 0;
    
    if (lastUpdateTime < oneHourAgo) {
      return await this.fetchLiveRate();
    }
    
    return this.currentRate;
  }

  // Convert USD to PKR
  async convertToPKR(usdAmount) {
    const rate = await this.getRate();
    return Math.round(usdAmount * rate);
  }

  // Convert PKR to USD
  async convertToUSD(pkrAmount) {
    const rate = await this.getRate();
    return parseFloat((pkrAmount / rate).toFixed(2));
  }

  // Manual override (for admin)
  async setManualRate(rate) {
    this.currentRate = rate;
    this.lastUpdate = new Date().toISOString();
    
    await db.settings.put({ key: 'exchangeRate', value: rate.toString() });
    await db.settings.put({ key: 'exchangeRateUpdated', value: this.lastUpdate });
    await db.settings.put({ key: 'exchangeRateManual', value: 'true' });
    
    console.log(`✅ Manual exchange rate set: $1 = Rs. ${rate}`);
    return rate;
  }

  // Reset to auto-fetch
  async resetToAuto() {
    await db.settings.put({ key: 'exchangeRateManual', value: 'false' });
    return await this.fetchLiveRate();
  }

  // Initialize from settings
  async initialize() {
    const settings = await db.settings.toArray();
    const rateSettings = settings.find(s => s.key === 'exchangeRate');
    const lastUpdateSettings = settings.find(s => s.key === 'exchangeRateUpdated');
    
    if (rateSettings) {
      this.currentRate = parseFloat(rateSettings.value);
    }
    
    if (lastUpdateSettings) {
      this.lastUpdate = lastUpdateSettings.value;
    }
    
    // Auto-refresh if needed
    await this.getRate();
  }
}

export const currencyService = new CurrencyService();
