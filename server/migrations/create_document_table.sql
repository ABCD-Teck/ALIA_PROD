-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS document CASCADE;

-- Create document table for storing customer documents
CREATE TABLE document (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    uploaded_by UUID REFERENCES "user"(user_id),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT document_file_size_check CHECK (file_size > 0),
    CONSTRAINT document_file_name_check CHECK (LENGTH(file_name) > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_document_customer_id ON document(customer_id);
CREATE INDEX idx_document_category ON document(category);
CREATE INDEX idx_document_uploaded_at ON document(uploaded_at DESC);
CREATE INDEX idx_document_is_active ON document(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE document IS 'Stores documents uploaded for customers';
COMMENT ON COLUMN document.document_id IS 'Unique identifier for the document';
COMMENT ON COLUMN document.customer_id IS 'Reference to the customer this document belongs to';
COMMENT ON COLUMN document.file_name IS 'Original filename of the uploaded document';
COMMENT ON COLUMN document.file_path IS 'Server file path where the document is stored';
COMMENT ON COLUMN document.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN document.file_type IS 'MIME type of the file';
COMMENT ON COLUMN document.category IS 'Category of the document (e.g., customerInfo, financialOperations, legal, contracts)';
COMMENT ON COLUMN document.description IS 'Optional description or notes about the document';
COMMENT ON COLUMN document.uploaded_by IS 'User who uploaded the document';
COMMENT ON COLUMN document.is_active IS 'Soft delete flag - false means deleted';
