// Google Sheets API Integration for Real-time Sync
import { db } from './database';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'];

// Google Sheets API Configuration
export class GoogleSheetsService {
  constructor() {
    this.accessToken = null;
    this.spreadsheetId = null;
    this.isInitialized = false;
  }

  // Initialize Google OAuth
  async initialize() {
    const settings = await db.settings.toArray();
    const sheetsId = settings.find(s => s.key === 'googleSheetsId')?.value;
    
    if (sheetsId) {
      this.spreadsheetId = sheetsId;
      this.isInitialized = true;
    }
    
    return this.isInitialized;
  }

  // OAuth Flow - Request Access
  async requestAccess() {
    try {
      // Use Google Identity Services
      const client = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: (response) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            localStorage.setItem('googleAccessToken', response.access_token);
          }
        },
      });
      
      client.requestAccessToken();
    } catch (error) {
      console.error('❌ OAuth Error:', error);
      throw error;
    }
  }

  // Create Spreadsheet
  async createSpreadsheet() {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: 'Abdullah Dental Care - Database',
          },
          sheets: [
            { properties: { title: 'Patients' } },
            { properties: { title: 'Appointments' } },
            { properties: { title: 'Treatments' } },
            { properties: { title: 'Prescriptions' } },
            { properties: { title: 'Invoices' } },
            { properties: { title: 'LabWork' } },
            { properties: { title: 'Inventory' } },
            { properties: { title: 'Expenses' } },
          ],
        }),
      });

      const data = await response.json();
      this.spreadsheetId = data.spreadsheetId;
      
      // Save to settings
      await db.settings.put({ key: 'googleSheetsId', value: data.spreadsheetId });
      
      return data.spreadsheetId;
    } catch (error) {
      console.error('❌ Create Spreadsheet Error:', error);
      throw error;
    }
  }

  // Write data to sheet
  async writeToSheet(sheetName, data) {
    if (!this.accessToken || !this.spreadsheetId) {
      throw new Error('Not initialized');
    }

    try {
      const range = `${sheetName}!A:Z`;
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range,
            values: data,
          }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error(`❌ Write to ${sheetName} Error:`, error);
      throw error;
    }
  }

  // Read data from sheet
  async readFromSheet(sheetName) {
    if (!this.accessToken || !this.spreadsheetId) {
      throw new Error('Not initialized');
    }

    try {
      const range = `${sheetName}!A:Z`;
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error(`❌ Read from ${sheetName} Error:`, error);
      throw error;
    }
  }

  // Sync local database to Google Sheets
  async syncToCloud() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Sync each table
      const tables = ['patients', 'appointments', 'treatmentRecords', 'prescriptions', 'invoices', 'labWork', 'inventory', 'expenses'];
      
      for (const table of tables) {
        const records = await db[table].toArray();
        
        if (records.length > 0) {
          // Convert to 2D array for Sheets
          const headers = Object.keys(records[0]);
          const values = [headers, ...records.map(r => headers.map(h => r[h] ?? ''))];
          
          await this.writeToSheet(
            table.charAt(0).toUpperCase() + table.slice(1),
            values
          );
        }
      }

      await db.settings.put({ key: 'lastSync', value: new Date().toISOString() });
      console.log('✅ Sync completed');
      return true;
    } catch (error) {
      console.error('❌ Sync Error:', error);
      throw error;
    }
  }

  // Sync from Google Sheets to local database
  async syncFromCloud() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const tables = ['patients', 'appointments', 'treatmentRecords', 'prescriptions', 'invoices', 'labWork', 'inventory', 'expenses'];
      
      for (const table of tables) {
        const sheetName = table.charAt(0).toUpperCase() + table.slice(1);
        const values = await this.readFromSheet(sheetName);
        
        if (values.length > 1) {
          const headers = values[0];
          const records = values.slice(1).map(row => {
            const record = {};
            headers.forEach((header, index) => {
              record[header] = row[index];
            });
            return record;
          });
          
          // Clear and repopulate
          await db[table].clear();
          await db[table].bulkAdd(records);
        }
      }

      await db.settings.put({ key: 'lastSync', value: new Date().toISOString() });
      console.log('✅ Sync from cloud completed');
      return true;
    } catch (error) {
      console.error('❌ Sync from cloud Error:', error);
      throw error;
    }
  }
}

export const googleSheets = new GoogleSheetsService();
