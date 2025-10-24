-- Create annotation table for customer notes and annotations
CREATE TABLE IF NOT EXISTS annotation (
    annotation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(100) DEFAULT 'active',
    content TEXT,
    created_by UUID REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT annotation_title_check CHECK (LENGTH(title) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_annotation_customer_id ON annotation(customer_id);
CREATE INDEX IF NOT EXISTS idx_annotation_created_at ON annotation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_annotation_is_active ON annotation(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE annotation IS 'Stores annotations and notes for customers';
COMMENT ON COLUMN annotation.annotation_id IS 'Unique identifier for the annotation';
COMMENT ON COLUMN annotation.customer_id IS 'Reference to the customer this annotation belongs to';
COMMENT ON COLUMN annotation.title IS 'Title of the annotation';
COMMENT ON COLUMN annotation.status IS 'Status description (e.g., active, resolved, follow-up needed)';
COMMENT ON COLUMN annotation.content IS 'Detailed content of the annotation';
COMMENT ON COLUMN annotation.created_by IS 'User who created the annotation';
COMMENT ON COLUMN annotation.is_active IS 'Soft delete flag - false means deleted';
