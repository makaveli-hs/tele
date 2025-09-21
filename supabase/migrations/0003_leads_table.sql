-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    company_name VARCHAR(255),
    priority_level INTEGER NOT NULL DEFAULT 0 CHECK (priority_level >= 0 AND priority_level <= 10),
    status lead_status NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    last_contact_date TIMESTAMPTZ,
    next_contact_date TIMESTAMPTZ,
    score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for leads
CREATE INDEX idx_lead_company_id ON leads(company_id);
CREATE INDEX idx_lead_assigned_to ON leads(assigned_to);
CREATE INDEX idx_lead_phone ON leads(phone);
CREATE INDEX idx_lead_status ON leads(status);
CREATE INDEX idx_lead_priority ON leads(priority_level DESC);
CREATE INDEX idx_lead_next_contact ON leads(next_contact_date);

-- Apply trigger to leads
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();