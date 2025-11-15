const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|zip)$/i;
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream' // Generic binary file type - allow for Office docs
    ];

    const hasValidExtension = allowedExtensions.test(file.originalname.toLowerCase());
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

    // Primary validation: extension must match
    // Secondary validation: if MIME type is available, it should be in allowed list
    // This allows Office documents that might be detected as application/octet-stream
    if (hasValidExtension) {
      if (hasValidMimeType || file.mimetype === 'application/octet-stream') {
        console.log(`File accepted: ${file.originalname} (${file.mimetype})`);
        return cb(null, true);
      } else {
        console.warn(`File rejected due to MIME type: ${file.originalname} (${file.mimetype})`);
        cb(new Error(`Invalid file MIME type: ${file.mimetype}. File: ${file.originalname}`));
        return;
      }
    } else {
      console.warn(`File rejected due to extension: ${file.originalname}`);
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, ZIP'));
    }
  }
});

// GET all documents for a customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { category } = req.query;

    let query = `
      SELECT
        d.*,
        u.first_name || ' ' || u.last_name as uploader_name
      FROM document d
      LEFT JOIN "user" u ON d.uploaded_by = u.user_id
      WHERE d.customer_id = $1 AND d.is_active = true
    `;

    const queryParams = [customerId];

    if (category) {
      query += ` AND d.category = $2`;
      queryParams.push(category);
    }

    query += ` ORDER BY d.uploaded_at DESC`;

    const result = await pool.query(query, queryParams);

    res.json({
      documents: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents', message: error.message });
  }
});

// GET single document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        d.*,
        u.first_name || ' ' || u.last_name as uploader_name
      FROM document d
      LEFT JOIN "user" u ON d.uploaded_by = u.user_id
      WHERE d.document_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document', message: error.message });
  }
});

// POST upload new document
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      customer_id,
      category,
      description
    } = req.body;

    if (!customer_id) {
      // Delete uploaded file if customer_id is missing
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const query = `
      INSERT INTO document (
        customer_id,
        file_name,
        file_path,
        file_size,
        file_type,
        category,
        description,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      customer_id,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      category || 'general',
      description || null,
      req.user.user_id // From auth middleware
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);

    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err =>
        console.error('Error deleting file after failed upload:', err)
      );
    }

    res.status(500).json({ error: 'Failed to upload document', message: error.message });
  }
});

// GET download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM document
      WHERE document_id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];

    // Check if file exists
    try {
      await fs.access(document.file_path);
    } catch {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Send file
    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document', message: error.message });
  }
});

// DELETE document (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE document
      SET is_active = false, updated_at = NOW()
      WHERE document_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully', document: result.rows[0] });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document', message: error.message });
  }
});

// PUT update document metadata
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const query = `
      UPDATE document SET
        category = COALESCE($1, category),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE document_id = $3
      RETURNING *
    `;

    const values = [category, description, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document', message: error.message });
  }
});

module.exports = router;
