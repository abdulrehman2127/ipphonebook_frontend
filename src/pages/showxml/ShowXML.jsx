import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Phone, User, Plus, X, Check, Search, Upload, Building2, Download } from 'lucide-react';
import { isAdmin } from '../../auth/authService';
import { readPhonebook, addPhonebookEntry, importCSVToPhonebook } from '../../api/phonebook';
import './ShowXML.css';

function ShowXML() {
  const navigate = useNavigate();
  const [phoneEntries, setPhoneEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    telephone: '',
    department: ''
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadXMLData();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const admin = await isAdmin();
    setUserIsAdmin(admin);
  };

  const loadXMLData = async () => {
    setLoading(true);
    try {
      const data = await readPhonebook();
      setPhoneEntries(data.entries || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
      setPhoneEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleAddEntry = async () => {
    if (!newEntry.name || !newEntry.telephone) {
      // Add visual feedback for empty fields
      const inputs = document.querySelectorAll('.form-card input');
      inputs.forEach(input => {
        if (!input.value) {
          input.style.borderColor = '#e53e3e';
          input.style.animation = 'shake 0.3s';
          setTimeout(() => {
            input.style.borderColor = '';
            input.style.animation = '';
          }, 300);
        }
      });
      return;
    }

    setSaving(true);
    try {
      const response = await addPhonebookEntry(newEntry);
      
      if (response.message) {
        // Success feedback
        setNewEntry({ 
          name: '', 
          telephone: '', 
          department: ''
        });
        setShowAddForm(false);
        await loadXMLData(); // Reload entries
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = '✓ Entry added successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = '✗ Failed to add entry';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setNewEntry({ 
      name: '', 
      telephone: '', 
      department: ''
    });
    setShowAddForm(false);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = '✗ Please upload a CSV file';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    setUploading(true);

    try {
      const response = await importCSVToPhonebook(file);

      if (response.message) {
        // Success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = `✓ ${response.entries_imported} entries imported successfully!`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

        // Reload data
        await loadXMLData();
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = `✗ ${error.response?.data?.error || 'Failed to import CSV'}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Telephone', 'Department'];
      const csvRows = [headers.join(',')];
      
      // Add data rows
      phoneEntries.forEach(entry => {
        const row = [
          entry.name || '',
          entry.telephone || '',
          entry.department || ''
        ];
        // Escape commas and quotes in data
        const escapedRow = row.map(field => {
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });
        csvRows.push(escapedRow.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `phonebook_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = '✓ CSV exported successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = '✗ Failed to export CSV';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  // Filter entries based on search query
  const filteredEntries = phoneEntries.filter(entry => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return true;
    
    const nameMatch = entry.name?.toLowerCase().includes(searchLower);
    const phoneMatch = entry.telephone?.toLowerCase().includes(searchLower);
    const deptMatch = entry.department?.toLowerCase().includes(searchLower);
    
    return nameMatch || phoneMatch || deptMatch;
  });

  return (
    <div className="show-xml-container">
      <div className="navbar">
        <button className="nav-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h1 className="page-title">Show XML - Phonebook Directory</h1>
        <div className="navbar-actions">
          {userIsAdmin && (
            <>
              <button 
                className="action-button import-button" 
                onClick={triggerFileUpload}
                disabled={uploading}
                title="Import CSV file"
              >
                <Upload size={18} className={uploading ? 'spinning' : ''} />
                <span>{uploading ? 'Importing...' : 'Import CSV'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
              <button 
                className="action-button export-button" 
                onClick={handleExportCSV}
                disabled={phoneEntries.length === 0}
                title="Export to CSV file"
              >
                <Download size={18} />
                <span>Export CSV</span>
              </button>
            </>
          )}
          <button 
            className="action-button refresh-button" 
            onClick={loadXMLData}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or telephone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results-info">
              Found {filteredEntries.length} of {phoneEntries.length} entries
            </div>
          )}
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <Phone size={20} />
            <div className="stat-info">
              <span className="stat-value">{searchQuery ? filteredEntries.length : phoneEntries.length}</span>
              <span className="stat-label">{searchQuery ? 'Filtered Entries' : 'Total Entries'}</span>
            </div>
          </div>
          <div className="stat-item">
            <User size={20} />
            <div className="stat-info">
              <span className="stat-value">Active</span>
              <span className="stat-label">Status</span>
            </div>
          </div>
          {lastUpdated && (
            <div className="stat-item">
              <RefreshCw size={20} />
              <div className="stat-info">
                <span className="stat-value">{formatTime(lastUpdated)}</span>
                <span className="stat-label">Last Updated</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={50} className="spinning" />
            <p>Loading phonebook entries...</p>
          </div>
        ) : phoneEntries.length === 0 ? (
          <div className="empty-state">
            <Phone size={60} />
            <h2>No Entries Found</h2>
            <p>The phonebook is empty. Add entries using the Write XML page.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <Search size={60} />
            <h2>No Results Found</h2>
            <p>No entries match "{searchQuery}". Try a different search term.</p>
            <button className="primary-button" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="entries-grid">
            {/* Add New Entry Card */}
            {userIsAdmin && !showAddForm && (
              <div className="entry-card add-card" onClick={() => setShowAddForm(true)}>
                <div className="add-card-content">
                  <Plus size={50} className="add-icon" />
                  <h3>Add New Entry</h3>
                  <p>Click to add a new contact</p>
                </div>
              </div>
            )}

            {/* Add Entry Form Card */}
            {userIsAdmin && showAddForm && (
              <div className="entry-card form-card">
                <div className="card-header">
                  <div className="entry-badge" style={{ background: '#2d3748', color: '#ffffff' }}>New Entry</div>
                  <div className="header-actions">
                    <button 
                      className="save-btn" 
                      onClick={handleAddEntry}
                      disabled={saving}
                      title="Save Entry"
                    >
                      <Check />
                    </button>
                    <button className="close-btn" onClick={handleCancelAdd} title="Cancel">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>
                      <User size={14} />
                      Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={newEntry.name}
                      onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={14} />
                      Telephone *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter telephone"
                      value={newEntry.telephone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numeric values
                        if (/^\d*$/.test(value)) {
                          setNewEntry({ ...newEntry, telephone: value });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Building2 size={14} />
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="Enter department"
                      value={newEntry.department}
                      onChange={(e) => setNewEntry({ ...newEntry, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {filteredEntries.map((entry, index) => (
              <div key={index} className="entry-card">
                <div className="card-header">
                  <div className="entry-number">#{index + 1}</div>
                  <div className="entry-badge">Active</div>
                </div>
                <div className="card-body">
                  <div className="entry-field">
                    <User size={18} className="field-icon" />
                    <div className="field-content">
                      <span className="field-label">Name</span>
                      <span className="field-value">{entry.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="entry-field">
                    <Phone size={18} className="field-icon" />
                    <div className="field-content">
                      <span className="field-label">Telephone</span>
                      <span className="field-value">{entry.telephone || 'N/A'}</span>
                    </div>
                  </div>
                  {entry.department && (
                    <div className="entry-field">
                      <Building2 size={18} className="field-icon" />
                      <div className="field-content">
                        <span className="field-label">Department</span>
                        <span className="field-value">{entry.department}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowXML;
