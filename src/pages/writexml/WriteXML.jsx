import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle, FileJson, FileCode } from 'lucide-react';
import { readPhonebook, writePhonebook } from '../../api/phonebook';
import './WriteXML.css';

function WriteXML() {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState('');
  const [xmlData, setXmlData] = useState('');
  const [activeTab, setActiveTab] = useState('json');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadXMLData();
  }, []);

  const loadXMLData = async () => {
    setLoading(true);
    try {
      const data = await readPhonebook();
      const formattedJson = JSON.stringify(data, null, 2);
      setJsonData(formattedJson);
      const entries = response.data.entries || [];
      const xmlString = generateXMLString(entries);
      setXmlData(xmlString);
      
      showMessage('Data loaded successfully!', 'success');
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Failed to load data. Starting with empty editor.', 'error');
      setJsonData(JSON.stringify({ entries: [] }, null, 2));
      setXmlData('<?xml version="1.0" encoding="UTF-8"?>\n<YealinkIPPhoneDirectory>\n</YealinkIPPhoneDirectory>');
    } finally {
      setLoading(false);
    }
  };
  const generateXMLString = (entries) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<YealinkIPPhoneDirectory>';
    entries.forEach(entry => {
      xml += '\n  <DirectoryEntry>';
      xml += `\n    <Name>${entry.name || ''}</Name>`;
      xml += `\n    <Telephone>${entry.telephone || ''}</Telephone>`;
      xml += '\n  </DirectoryEntry>';
    });
    xml += '\n</YealinkIPPhoneDirectory>';
    return xml;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedData;
      
      if (activeTab === 'json') {
        parsedData = JSON.parse(jsonData);
      } else {
        parsedData = parseXMLToJSON(xmlData);
      }
      
      await writePhonebook(parsedData);
      const xmlString = generateXMLString(parsedData.entries || []);
      setXmlData(xmlString);
      setJsonData(JSON.stringify(parsedData, null, 2));
      
      showMessage('Data saved successfully!', 'success');
    } catch (error) {
      if (error instanceof SyntaxError) {
        showMessage(`Invalid ${activeTab.toUpperCase()} format! Please check your syntax.`, 'error');
      } else {
        showMessage('Failed to save data. Please try again.', 'error');
      }
      console.error('Error saving data:', error);
    } finally {
      setSaving(false);
    }
  };

  const parseXMLToJSON = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }
      
      const entries = [];
      const directoryEntries = xmlDoc.getElementsByTagName('DirectoryEntry');
      
      for (let i = 0; i < directoryEntries.length; i++) {
        const entry = directoryEntries[i];
        const nameElement = entry.getElementsByTagName('Name')[0];
        const telephoneElement = entry.getElementsByTagName('Telephone')[0];
        
        entries.push({
          name: nameElement ? nameElement.textContent : '',
          telephone: telephoneElement ? telephoneElement.textContent : ''
        });
      }
      
      return { entries };
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw new SyntaxError('Invalid XML format');
    }
  };

  const handleEditorChange = (value) => {
    if (activeTab === 'json') {
      setJsonData(value || '');
      try {
        const parsed = JSON.parse(value || '{}');
        const xmlString = generateXMLString(parsed.entries || []);
        setXmlData(xmlString);
      } catch (e) {
      }
    } else {
      setXmlData(value || '');
      try {
        const parsed = parseXMLToJSON(value || '');
        setJsonData(JSON.stringify(parsed, null, 2));
      } catch (e) {
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType('');
    }, 4000);
  };

  return (
    <div className="write-xml-container">
      <div className="navbar">
        <button className="nav-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h1 className="page-title">Write XML - Editor</h1>
        <div className="nav-actions">
          <button 
            className="action-button refresh-button" 
            onClick={loadXMLData}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            className="action-button save-button" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`message-banner ${messageType}`}>
          {messageType === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="editor-section">
        <div className="editor-header">
          <div className="editor-tabs">
            <div 
              className={`editor-tab ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <FileJson size={16} className="tab-icon" />
              <span>phonebook.json</span>
            </div>
            <div 
              className={`editor-tab ${activeTab === 'xml' ? 'active' : ''}`}
              onClick={() => setActiveTab('xml')}
            >
              <FileCode size={16} className="tab-icon" />
              <span>phonebook.xml</span>
            </div>
          </div>
          <div className="editor-info">
            <span className="info-badge">{activeTab === 'json' ? 'JSON Format' : 'XML Format'}</span>
            <span className="info-badge">Editable</span>
          </div>
        </div>
        
        <div className="editor-wrapper">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={40} className="spinning" />
              <p>Loading data...</p>
            </div>
          ) : (
            <Editor
              height="calc(100vh - 200px)"
              defaultLanguage={activeTab === 'json' ? 'json' : 'xml'}
              language={activeTab === 'json' ? 'json' : 'xml'}
              theme="vs-light"
              value={activeTab === 'json' ? jsonData : xmlData}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                readOnly: false,
              }}
            />
          )}
        </div>
      </div>

      <div className="instructions-panel">
        <h3>📋 Instructions</h3>
        <ul>
          <li>Switch between <strong>JSON</strong> and <strong>XML</strong> tabs to edit in different formats</li>
          <li><strong>JSON Tab</strong>: Edit data in JSON format - XML updates automatically</li>
          <li><strong>XML Tab</strong>: Edit data in XML format - JSON updates automatically</li>
          <li>JSON format: <code>{`{"entries": [{"name": "...", "telephone": "..."}]}`}</code></li>
          <li>XML format: <code>{`<DirectoryEntry><Name>...</Name><Telephone>...</Telephone></DirectoryEntry>`}</code></li>
          <li>Click <strong>Save</strong> to write data to the XML file (works from either tab)</li>
          <li>Use <strong>Refresh</strong> to reload the latest data</li>
        </ul>
      </div>
    </div>
  );
}

export default WriteXML;
