-- Outcomes table
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_success BOOLEAN DEFAULT false,
    requires_followup BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default outcomes
INSERT INTO outcomes (name, description, is_success, requires_followup) VALUES
    ('success', '통화 성공 - 목표 달성', true, false),
    ('no_answer', '부재중', false, true),
    ('busy', '통화중', false, true),
    ('rejected', '거절', false, false),
    ('callback_scheduled', '재통화 예정', false, true),
    ('wrong_number', '잘못된 번호', false, false),
    ('disconnected', '연결 끊김', false, true),
    ('interested', '관심 표현', true, true),
    ('not_interested', '관심 없음', false, false),
    ('voicemail', '음성 메시지 남김', false, true);