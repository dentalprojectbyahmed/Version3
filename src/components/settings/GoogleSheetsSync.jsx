import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { googleSheets } from '../../services/googleSheets';
import { db } from '../../services/database';

export default function GoogleSheetsSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [syncStatus, setSyncStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const settings = await db.settings.toArray();
    const sheetsId = settings.find(s => s.key === 'googleSheetsId')?.value;
    const lastSyncTime = settings.find(s => s.key === 'lastSync')?.value;
    
    if (sheetsId) {
      setSpreadsheetId(sheetsId);
      setIsConnected(true);
    }
    
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
  };

  const handleConnect = async () => {
    try {
      setSyncStatus({ type: 'info', message: 'Requesting Google access...' });
      await googleSheets.requestAccess();
      
      setSyncStatus({ type: 'info', message: 'Creating spreadsheet...' });
      const sheetId = await googleSheets.createSpreadsheet();
      
      setSpreadsheetId(sheetId);
      setIsConnected(true);
      setSyncStatus({ 
        type: 'success', 
        message: `Connected! Spreadsheet created: ${sheetId}` 
      });
    } catch (error) {
      setSyncStatus({ 
        type: 'error', 
        message: `Connection failed: ${error.message}` 
      });
    }
  };

  const handleSyncToCloud = async () => {
    if (!isConnected) {
      setSyncStatus({ type: 'error', message: 'Not connected to Google Sheets' });
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus({ type: 'info', message: 'Syncing to Google Sheets...' });
      
      await googleSheets.syncToCloud();
      
      const now = new Date();
      setLastSync(now);
      setSyncStatus({ 
        type: 'success', 
        message: 'Successfully synced to Google Sheets!' 
      });
    } catch (error) {
      setSyncStatus({ 
        type: 'error', 
        message: `Sync failed: ${error.message}` 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromCloud = async () => {
    if (!isConnected) {
      setSyncStatus({ type: 'error', message: 'Not connected to Google Sheets' });
      return;
    }

    if (!confirm('This will overwrite local data with Google Sheets data. Continue?')) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus({ type: 'info', message: 'Syncing from Google Sheets...' });
      
      await googleSheets.syncFromCloud();
      
      const now = new Date();
      setLastSync(now);
      setSyncStatus({ 
        type: 'success', 
        message: 'Successfully synced from Google Sheets!' 
      });
    } catch (error) {
      setSyncStatus({ 
        type: 'error', 
        message: `Sync failed: ${error.message}` 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const openSpreadsheet = () => {
    if (spreadsheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {isConnected ? (
              <Cloud className="w-5 h-5 text-green-600" />
            ) : (
              <CloudOff className="w-5 h-5 text-muted-foreground" />
            )}
            Google Sheets Sync
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isConnected 
              ? 'Connected - Your data is backed up to Google Sheets' 
              : 'Connect to backup your data to Google Sheets'}
          </p>
        </div>
        {isConnected && (
          <div className={`px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </div>
        )}
      </div>

      {syncStatus.message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          syncStatus.type === 'success' ? 'bg-green-50 text-green-800' :
          syncStatus.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {syncStatus.type === 'success' && <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {syncStatus.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {syncStatus.type === 'info' && <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />}
          <div className="flex-1 text-sm">{syncStatus.message}</div>
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Why Connect?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic cloud backup of all patient data</li>
              <li>• Access data from multiple devices</li>
              <li>• Export to Excel/CSV anytime</li>
              <li>• 100% FREE (uses your Google account)</li>
            </ul>
          </div>
          
          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
          >
            <Cloud className="w-5 h-5" />
            Connect Google Sheets
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lastSync && (
            <div className="text-sm text-muted-foreground">
              Last synced: {lastSync.toLocaleString()}
            </div>
          )}

          {spreadsheetId && (
            <div className="bg-background rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Spreadsheet ID:</div>
              <div className="text-sm font-mono text-foreground break-all">{spreadsheetId}</div>
              <button
                onClick={openSpreadsheet}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Open in Google Sheets →
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Cloud className="w-5 h-5" />
              )}
              Upload to Cloud
            </button>

            <button
              onClick={handleSyncFromCloud}
              disabled={isSyncing}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Download from Cloud
            </button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Upload to Cloud:</strong> Save current data to Google Sheets</p>
            <p>• <strong>Download from Cloud:</strong> Replace local data with Google Sheets data</p>
          </div>
        </div>
      )}
    </div>
  );
}
