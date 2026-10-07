import express from 'express';
import cors from 'cors';
import { PriorityQueue } from './dsa/PriorityQueue.js';
import { StandardQueue } from './dsa/StandardQueue.js';
import { RequestMap } from './dsa/RequestMap.js';

const app = express();
app.use(cors());
app.use(express.json());

// DSA Storage Initialization
const priorityQueue = new PriorityQueue();
const standardQueue = new StandardQueue();
const requestLookup = new RequestMap();
const processedHistory = [];

let idCounter = 1001;

// --- API ENDPOINTS ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Emergency System Server Running' });
});

// 2. Register New Emergency Request
app.post('/api/requests', (req, res) => {
  const { requester, contact, type, urgency, location, description } = req.body;

  if (!requester || !contact || !type || !urgency || !location) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  // Duplicate Check
  const existing = requestLookup.values().find(
    r => r.contact === contact && r.status === 'Pending'
  );
  if (existing) {
    return res.status(409).json({ error: `An active request already exists for contact ${contact} (ID: ${existing.id})` });
  }

  const id = `EMG-${idCounter++}`;
  const timestamp = new Date().toISOString();

  const newRequest = {
    id,
    requester,
    contact,
    type,
    urgency,
    location,
    description: description || 'No details provided',
    status: 'Pending',
    timestamp
  };

  // Enqueue in Hash Map Index
  requestLookup.set(id, newRequest);

  // Enqueue to Queue DSA
  if (urgency === 'Critical' || urgency === 'High') {
    priorityQueue.enqueue(newRequest);
  } else {
    standardQueue.enqueue(newRequest);
  }

  res.status(201).json({
    message: 'Emergency request registered successfully',
    data: newRequest
  });
});

// 3. Process/Dispatch Next Highest Priority Request
app.post('/api/requests/process-next', (req, res) => {
  let nextRequest = null;
  let sourceQueue = '';

  if (!priorityQueue.isEmpty()) {
    nextRequest = priorityQueue.dequeue();
    sourceQueue = 'Priority Queue (Max-Heap)';
  } else if (!standardQueue.isEmpty()) {
    nextRequest = standardQueue.dequeue();
    sourceQueue = 'Standard Queue (FIFO)';
  } else {
    return res.status(404).json({ error: 'Queue Empty: No pending emergency requests to process.' });
  }

  // Update Status in Hash Map
  nextRequest.status = 'Dispatched';
  nextRequest.dispatchedAt = new Date().toISOString();
  requestLookup.set(nextRequest.id, nextRequest);
  processedHistory.push(nextRequest);

  res.json({
    message: `Dispatched request ${nextRequest.id} from ${sourceQueue}`,
    data: nextRequest
  });
});

// 4. Get Current Queues & Stats
app.get('/api/requests/queues', (req, res) => {
  res.json({
    priorityQueue: priorityQueue.toArray(),
    standardQueue: standardQueue.toArray(),
    nextInLine: priorityQueue.peek() || standardQueue.peek() || null,
    totalPending: priorityQueue.heap.length + standardQueue.items.length,
    totalProcessed: processedHistory.length
  });
});

// 5. Search Request by ID or Requester Details
app.get('/api/requests/search', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query parameter required' });

  const q = query.toLowerCase();
  const results = requestLookup.values().filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.requester.toLowerCase().includes(q) ||
    r.location.toLowerCase().includes(q) ||
    r.contact.includes(q)
  );

  res.json({ count: results.length, data: results });
});

// 6. Update Request Status or Cancel
app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status, urgency } = req.body;

  if (!requestLookup.has(id)) {
    return res.status(404).json({ error: `Request with ID ${id} not found.` });
  }

  const request = requestLookup.get(id);

  if (status === 'Cancelled') {
    request.status = 'Cancelled';
    priorityQueue.removeById(id);
    standardQueue.removeById(id);
    processedHistory.push(request);
  } else if (status) {
    request.status = status;
  }

  requestLookup.set(id, request);
  res.json({ message: 'Request updated successfully', data: request });
});

// 7. Get All Reports / Logs
app.get('/api/requests/all', (req, res) => {
  res.json({ data: requestLookup.values() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Emergency System Backend running on port ${PORT}`);
});
