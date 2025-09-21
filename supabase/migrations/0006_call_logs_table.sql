-- Call logs table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
    outcome_id UUID NOT NULL REFERENCES outcomes(id),
    call_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER, -- in seconds
    recording_url TEXT,
    notes TEXT,
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for call_logs
CREATE INDEX idx_calllog_employee_id ON call_logs(employee_id);
CREATE INDEX idx_calllog_lead_id ON call_logs(lead_id);
CREATE INDEX idx_calllog_script_id ON call_logs(script_id);
CREATE INDEX idx_calllog_outcome_id ON call_logs(outcome_id);
CREATE INDEX idx_calllog_call_time ON call_logs(call_time DESC);
CREATE INDEX idx_calllog_composite ON call_logs(employee_id, call_time DESC);

-- Add constraint to ensure duration is positive
ALTER TABLE call_logs ADD CONSTRAINT chk_duration_positive CHECK (duration >= 0);