const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Simple in-memory job tracking (in production, use Redis or database)
const jobs = new Map();
let jobIdCounter = 1;

// Configuration - these should be environment variables in production
const MIA_PROJECT_PATH = process.env.MIA_PROJECT_PATH || 'C:\\Users\\N3BULA\\Desktop\\MIA';
const PYTHON_VENV_PATH = process.env.PYTHON_VENV_PATH || '.venv\\Scripts\\python';

/**
 * Helper function to execute Python scripts
 */
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd: MIA_PROJECT_PATH,
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Run MIA pipeline for specific companies (background job)
 */
async function runPipelineBackground(companies, options = {}) {
  const jobId = `job_${jobIdCounter++}`;
  const job = {
    id: jobId,
    status: 'running',
    companies,
    startTime: new Date(),
    endTime: null,
    result: null,
    error: null,
    ...options
  };

  jobs.set(jobId, job);

  // Run the pipeline asynchronously
  (async () => {
    try {
      console.log(`[MIA Pipeline] Starting job ${jobId} for companies:`, companies);

      const companyList = companies.map(c => `"${c}"`).join(',');
      const args = [
        'etl/by_company_ingest.py',
        '--companies', companyList,
        '--per-company', options.perCompany || '5',
        '--batch-dir', options.batchDir || '/tmp/mia_by_company'
      ];

      if (options.skipETL) {
        args.push('--skip-etl');
      }

      const result = await executeCommand(PYTHON_VENV_PATH, args);

      job.status = 'completed';
      job.endTime = new Date();
      job.result = {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code
      };

      console.log(`[MIA Pipeline] Job ${jobId} completed successfully`);
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.error = error.message;

      console.error(`[MIA Pipeline] Job ${jobId} failed:`, error.message);
    }
  })();

  return jobId;
}

// GET /api/mia-pipeline/status/:jobId - Check job status
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    status: job.status,
    companies: job.companies,
    startTime: job.startTime,
    endTime: job.endTime,
    duration: job.endTime ? job.endTime - job.startTime : Date.now() - job.startTime,
    error: job.error,
    result: job.status === 'completed' ? job.result : null
  });
});

// GET /api/mia-pipeline/jobs - List all jobs
router.get('/jobs', (req, res) => {
  const { status, limit = 50 } = req.query;

  let jobList = Array.from(jobs.values());

  if (status) {
    jobList = jobList.filter(job => job.status === status);
  }

  // Sort by start time (newest first)
  jobList.sort((a, b) => b.startTime - a.startTime);

  // Limit results
  jobList = jobList.slice(0, parseInt(limit));

  res.json({
    jobs: jobList.map(job => ({
      id: job.id,
      status: job.status,
      companies: job.companies,
      startTime: job.startTime,
      endTime: job.endTime,
      duration: job.endTime ? job.endTime - job.startTime : Date.now() - job.startTime,
      error: job.error
    })),
    total: jobs.size
  });
});

// POST /api/mia-pipeline/trigger - Manually trigger pipeline for companies
router.post('/trigger', async (req, res) => {
  try {
    const { companies, perCompany = 5, skipETL = false } = req.body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({
        error: 'Invalid companies list. Provide an array of company names.'
      });
    }

    console.log('[MIA Pipeline] Manual trigger requested for companies:', companies);

    const jobId = await runPipelineBackground(companies, {
      perCompany,
      skipETL,
      trigger: 'manual'
    });

    res.json({
      message: 'Pipeline triggered successfully',
      jobId,
      companies,
      status: 'running'
    });
  } catch (error) {
    console.error('Error triggering MIA pipeline:', error);
    res.status(500).json({
      error: 'Failed to trigger pipeline',
      message: error.message
    });
  }
});

// POST /api/mia-pipeline/auto-refresh - Auto-refresh for new companies (internal endpoint)
router.post('/auto-refresh', async (req, res) => {
  try {
    const { companies, source = 'auto' } = req.body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({
        error: 'Invalid companies list. Provide an array of company names.'
      });
    }

    console.log('[MIA Pipeline] Auto-refresh triggered for companies:', companies);

    const jobId = await runPipelineBackground(companies, {
      perCompany: 3, // Lower count for auto-refresh
      skipETL: false,
      trigger: 'auto-refresh',
      source
    });

    res.json({
      message: 'Auto-refresh triggered successfully',
      jobId,
      companies,
      status: 'running'
    });
  } catch (error) {
    console.error('Error triggering auto-refresh:', error);
    res.status(500).json({
      error: 'Failed to trigger auto-refresh',
      message: error.message
    });
  }
});

// POST /api/mia-pipeline/test - Test pipeline connectivity
router.post('/test', async (req, res) => {
  try {
    console.log('[MIA Pipeline] Testing pipeline connectivity...');

    // Test with a simple help command
    const result = await executeCommand(PYTHON_VENV_PATH, [
      'etl/by_company_ingest.py',
      '--help'
    ]);

    res.json({
      message: 'Pipeline test successful',
      result: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code
      },
      miaPath: MIA_PROJECT_PATH,
      pythonPath: PYTHON_VENV_PATH
    });
  } catch (error) {
    console.error('Error testing MIA pipeline:', error);
    res.status(500).json({
      error: 'Pipeline test failed',
      message: error.message,
      miaPath: MIA_PROJECT_PATH,
      pythonPath: PYTHON_VENV_PATH
    });
  }
});

// DELETE /api/mia-pipeline/jobs/:jobId - Cancel or delete job
router.delete('/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (jobs.has(jobId)) {
    jobs.delete(jobId);
    res.json({ message: 'Job deleted successfully' });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

module.exports = router;