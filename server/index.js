const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase payload size limits to support file uploads and large data transfers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import routes
const authRouter = require('./routes/auth');
const contactsRouter = require('./routes/contacts');
const customersRouter = require('./routes/customers');
const opportunitiesRouter = require('./routes/opportunities');
const interactionsRouter = require('./routes/interactions');
const tasksRouter = require('./routes/tasks');
const financialStatementsRouter = require('./routes/financialStatements');
const documentsRouter = require('./routes/documents');
const annotationsRouter = require('./routes/annotations');

const marketInsightsRouter = require('./routes/marketInsights');
const translateRouter = require('./routes/translate');
const miaPipelineRouter = require('./routes/miaPipeline');
const calendarRouter = require('./routes/calendar');

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/financial-statements', financialStatementsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/market-insights', marketInsightsRouter);
app.use('/api/translate', translateRouter);
app.use('/api/mia-pipeline', miaPipelineRouter);
app.use('/api/calendar', calendarRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
