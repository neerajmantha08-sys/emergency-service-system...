import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, PhoneCall, PlusCircle, Search, FileText, CheckCircle2, Clock, Trash2, Printer, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api'; // Update when deploying to Render

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [queueData, setQueueData] = useState({ priorityQueue: [], standardQueue: [], nextInLine: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [notification, setNotification] = useState(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    requester: '',
    contact: '',
    type: 'Medical',
    urgency: 'High',
    location: '',
    description: ''
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchQueueData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/queues`);
      const data = await res.json();
      setQueueData(data);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/all`);
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    fetchQueueData();
    fetchAllRequests();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || 'Failed to submit request', 'error');
        return;
      }

      showNotification(`Request Registered! ID: ${data.data.id}`);
      setFormData({ requester: '', contact: '', type: 'Medical', urgency: 'High', location: '', description: '' });
      fetchQueueData();
      fetchAllRequests();
      setActiveTab('dashboard');
    } catch (err) {
      showNotification('Network error occurred', 'error');
    }
  };

  const handleProcessNext = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/process-next`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || 'Failed to dispatch request', 'error');
        return;
      }

      showNotification(`Dispatched Emergency Unit for ${data.data.id} (${data.data.type})`);
      fetchQueueData();
      fetchAllRequests();
    } catch (err) {
      showNotification('Error processing request', 'error');
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      if (res.ok) {
        showNotification(`Request ${id} has been cancelled.`);
        fetchQueueData();
        fetchAllRequests();
      }
    } catch (err) {
      showNotification('Error cancelling request', 'error');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F8F8F3] text-gray-800 font-sans" style={{ backgroundImage: 'radial-gradient(#E8ECE6 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      
      {/* Browser Bar Simulation */}
      <div className="bg-[#F1F3F4] border-b border-gray-300 px-4 py-2 flex items-center justify-between text-xs text-gray-600 no-print">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
          <span className="ml-4 font-mono font-semibold">https://emergency-dispatch.group10.internal</span>
        </div>
        <div className="font-bold text-red-600">GROUP 10 - EMERGENCY MANAGEMENT SYSTEM</div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2.5 rounded-lg shadow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Emergency Dispatch & Service Management</h1>
            <p className="text-xs text-gray-500">Data Structures & Algorithms Laboratory Project</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'dashboard' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Dashboard & Visualizer
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'register' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Register Call
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'reports' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Search & PDF Reports
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'
        }`}>
          <AlertTriangle className="w-4 h-4" />
          {notification.msg}
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">

        {/* PAGE 1: DASHBOARD & QUEUE VISUALIZER */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
                  <span>PENDING REQUESTS</span>
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{queueData.totalPending || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
                  <span>HIGH PRIORITY HEAP</span>
                  <Activity className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">{queueData.priorityQueue?.length || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
                  <span>STANDARD FIFO QUEUE</span>
                  <PhoneCall className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">{queueData.standardQueue?.length || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
                  <span>TOTAL DISPATCHED</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">{queueData.totalProcessed || 0}</div>
              </div>
            </div>

            {/* Next Dispatch Highlight Box */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="bg-red-800 text-red-100 text-xs font-bold px-2.5 py-1 rounded">HEAD OF PRIORITY QUEUE</span>
                <h2 className="text-xl font-bold mt-2">
                  {queueData.nextInLine ? `${queueData.nextInLine.id} - ${queueData.nextInLine.type} Emergency (${queueData.nextInLine.urgency})` : 'No Pending Emergencies'}
                </h2>
                <p className="text-xs text-red-100 mt-1">
                  {queueData.nextInLine ? `Requester: ${queueData.nextInLine.requester} | Location: ${queueData.nextInLine.location}` : 'System ready for new incoming emergency calls.'}
                </p>
              </div>
              <button
                onClick={handleProcessNext}
                className="bg-white text-red-700 hover:bg-red-50 font-bold px-6 py-3 rounded-lg shadow transition flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" /> Dispatch Next Responder
              </button>
            </div>

            {/* Dual Queue Visualizer Containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Max-Heap Priority Queue */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
                  <span>Priority Queue (Binary Max-Heap)</span>
                  <span className="text-xs font-normal text-gray-500">Urgency: Critical / High</span>
                </h3>
                <div className="space-y-3">
                  {queueData.priorityQueue?.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6">Priority Queue is empty.</p>
                  ) : (
                    queueData.priorityQueue?.map((req, idx) => (
                      <div key={req.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-red-900">{idx === 0 ? '👑 [HEAD] ' : ''}{req.id} - {req.requester}</div>
                          <div className="text-gray-600">{req.type} | {req.location}</div>
                        </div>
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-mono font-bold">
                          Score: {req.priorityScore || 'Max'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* FIFO Standard Queue */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
                  <span>Standard Queue (FIFO Array)</span>
                  <span className="text-xs font-normal text-gray-500">Urgency: Medium / Low</span>
                </h3>
                <div className="space-y-3">
                  {queueData.standardQueue?.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6">Standard Queue is empty.</p>
                  ) : (
                    queueData.standardQueue?.map((req, idx) => (
                      <div key={req.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-blue-900">{idx === 0 ? '👉 [NEXT] ' : ''}{req.id} - {req.requester}</div>
                          <div className="text-gray-600">{req.type} | {req.location}</div>
                        </div>
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded font-semibold">
                          {req.urgency}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PAGE 2: REGISTRATION FORM */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600" /> New Emergency Call Intake
            </h2>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Requester Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.requester}
                  onChange={e => setFormData({ ...formData, requester: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Emergency Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Fire">Fire</option>
                    <option value="Police">Police</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Urgency Level</label>
                  <select
                    value={formData.urgency}
                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white font-bold text-red-600"
                  >
                    <option value="Critical">Critical (Immediate Hazard)</option>
                    <option value="High">High (Severe Incident)</option>
                    <option value="Medium">Medium (Moderate Hazard)</option>
                    <option value="Low">Low (Minor Non-Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Location / Zone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 4, Hyderabad"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Incident Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide essential details for responders..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow transition text-sm"
              >
                Enqueue Emergency Request
              </button>
            </form>
          </div>
        )}

        {/* PAGE 3: REPORTS & EXPORT */}
        {activeTab === 'reports' && (
          <div className="space-y-6" id="printable-area">
            
            {/* Header controls for printing */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ID, name, location..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-white outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="Medical">Medical</option>
                  <option value="Fire">Fire</option>
                  <option value="Police">Police</option>
                </select>
              </div>

              <button
                onClick={handlePrintPDF}
                className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Export Report (Print PDF)
              </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Master Emergency Logs & Status Reports</h3>
                <span className="text-xs text-gray-500">Group 10 Laboratory Record</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Requester</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Urgency</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-gray-400 italic">No emergency records found matching search filters.</td>
                      </tr>
                    ) : (
                      filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-gray-900">{req.id}</td>
                          <td className="p-3 font-semibold">{req.requester}<br/><span className="text-[10px] text-gray-400">{req.contact}</span></td>
                          <td className="p-3">{req.type}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                              req.urgency === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {req.urgency}
                            </span>
                          </td>
                          <td className="p-3">{req.location}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'Dispatched' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 no-print">
                            {req.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelRequest(req.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Cancel Request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
