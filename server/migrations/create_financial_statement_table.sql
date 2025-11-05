-- Create financial_statement table for customer financial data
CREATE TABLE IF NOT EXISTS financial_statement (
    financial_statement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    fiscal_year VARCHAR(10) NOT NULL,
    revenue DECIMAL(20, 2),
    net_profit DECIMAL(20, 2),
    roe DECIMAL(5, 2),
    debt_ratio DECIMAL(5, 2),
    currency_id UUID REFERENCES currency(currency_id),
    notes TEXT,
    created_by UUID REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT financial_statement_fiscal_year_check CHECK (LENGTH(fiscal_year) > 0),
    CONSTRAINT financial_statement_unique_customer_year UNIQUE (customer_id, fiscal_year, is_active)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_statement_customer_id ON financial_statement(customer_id);
CREATE INDEX IF NOT EXISTS idx_financial_statement_fiscal_year ON financial_statement(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_financial_statement_is_active ON financial_statement(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE financial_statement IS 'Stores financial statements and metrics for customers';
COMMENT ON COLUMN financial_statement.financial_statement_id IS 'Unique identifier for the financial statement';
COMMENT ON COLUMN financial_statement.customer_id IS 'Reference to the customer this financial statement belongs to';
COMMENT ON COLUMN financial_statement.fiscal_year IS 'Fiscal year for this financial statement (e.g., 2024, 2023-2024)';
COMMENT ON COLUMN financial_statement.revenue IS 'Total revenue for the fiscal year';
COMMENT ON COLUMN financial_statement.net_profit IS 'Net profit for the fiscal year';
COMMENT ON COLUMN financial_statement.roe IS 'Return on Equity percentage';
COMMENT ON COLUMN financial_statement.debt_ratio IS 'Debt ratio percentage';
COMMENT ON COLUMN financial_statement.currency_id IS 'Currency for the financial figures';
COMMENT ON COLUMN financial_statement.notes IS 'Additional notes about the financial statement';
COMMENT ON COLUMN financial_statement.created_by IS 'User who created the financial statement';
COMMENT ON COLUMN financial_statement.is_active IS 'Soft delete flag - false means deleted';
