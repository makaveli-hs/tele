# Technical Requirements Document (TRD)
## 텔레마케팅 데이터 관리 플랫폼

### 1. 기술 스택

#### 1.1 프론트엔드
- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: @tanstack/react-query
- **Utilities**: es-toolkit
- **Date Handling**: date-fns

#### 1.2 백엔드
- **BaaS**: Supabase
  - Authentication
  - Realtime subscriptions
  - Row Level Security (RLS)
  - Edge Functions
- **Database**: PostgreSQL
- **File Storage**: Supabase Storage

#### 1.3 AI/ML
- **Sentiment Analysis**: AI/ML sentiment analysis
- **통화 분석**: OpenAI API / Claude API
- **예측 모델**: TensorFlow.js (선택사항)

#### 1.4 외부 통합
- **ChannelTalk**: 통화 시스템 통합
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry

### 2. 디렉토리 구조

```
/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/             # 인증 관련 라우트
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # 대시보드 라우트 (인증 필요)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── analytics/
│   │   │   ├── calls/
│   │   │   ├── employees/
│   │   │   ├── leads/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/                # API 라우트
│   │   │   └── [...]
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/             # 공통 컴포넌트
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── chart.tsx
│   │       └── loading.tsx
│   │
│   ├── features/               # 기능별 모듈
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── user-menu.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   └── use-session.ts
│   │   │   ├── lib/
│   │   │   │   └── auth-client.ts
│   │   │   ├── pages/
│   │   │   ├── api.ts
│   │   │   ├── schema.ts
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── metrics-card.tsx
│   │   │   │   ├── activity-chart.tsx
│   │   │   │   └── summary-widget.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-dashboard-data.ts
│   │   │   └── ...
│   │   │
│   │   ├── calls/
│   │   │   ├── components/
│   │   │   │   ├── call-list.tsx
│   │   │   │   ├── call-form.tsx
│   │   │   │   ├── call-timer.tsx
│   │   │   │   └── channel-talk-widget.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-calls.ts
│   │   │   │   ├── use-call-recording.ts
│   │   │   │   └── use-channel-talk.ts
│   │   │   └── ...
│   │   │
│   │   ├── employees/
│   │   │   ├── components/
│   │   │   │   ├── employee-table.tsx
│   │   │   │   ├── performance-chart.tsx
│   │   │   │   └── leaderboard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-employees.ts
│   │   │   └── ...
│   │   │
│   │   ├── leads/
│   │   │   ├── components/
│   │   │   │   ├── lead-import.tsx
│   │   │   │   ├── lead-table.tsx
│   │   │   │   └── priority-badge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-leads.ts
│   │   │   │   └── use-lead-scoring.ts
│   │   │   └── ...
│   │   │
│   │   ├── scripts/
│   │   │   ├── components/
│   │   │   │   ├── script-editor.tsx
│   │   │   │   ├── script-selector.tsx
│   │   │   │   └── ab-test-results.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-scripts.ts
│   │   │   └── ...
│   │   │
│   │   └── reports/
│   │       ├── components/
│   │       │   ├── report-builder.tsx
│   │       │   └── export-dialog.tsx
│   │       ├── hooks/
│   │       │   └── use-reports.ts
│   │       └── ...
│   │
│   ├── hooks/                  # 공통 훅
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── utils.ts            # shadcn cn utility
│   │   ├── constants.ts
│   │   └── types.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── images/
│   └── fonts/
│
├── supabase/
│   ├── migrations/             # DB 마이그레이션
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_auth_setup.sql
│   │   ├── 0003_calls_table.sql
│   │   ├── 0004_employees_table.sql
│   │   ├── 0005_leads_table.sql
│   │   ├── 0006_scripts_table.sql
│   │   └── 0007_rls_policies.sql
│   └── functions/              # Edge Functions
│       ├── sentiment-analysis/
│       └── lead-scoring/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── config files...
```

### 3. 데이터베이스 스키마

#### 3.1 핵심 테이블

```sql
-- Users (Supabase Auth 확장)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'manager', 'employee')),
    department TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id),
    employee_code TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')),
    hire_date DATE,
    performance_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    company TEXT,
    priority INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    assigned_to UUID REFERENCES employees(id),
    last_contact_date TIMESTAMPTZ,
    next_contact_date TIMESTAMPTZ,
    score INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    lead_id UUID REFERENCES leads(id) NOT NULL,
    script_id UUID REFERENCES scripts(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER,
    outcome TEXT CHECK (outcome IN ('success', 'no_answer', 'busy', 'rejected', 'callback')),
    notes TEXT,
    recording_url TEXT,
    sentiment_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    success_rate DECIMAL(3,2),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    variables JSONB,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
    filters JSONB,
    data JSONB,
    generated_by UUID REFERENCES profiles(id),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. API 설계

#### 4.1 RESTful Endpoints

```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/session

// Dashboard
GET    /api/dashboard/summary
GET    /api/dashboard/metrics
GET    /api/dashboard/activities

// Calls
GET    /api/calls
POST   /api/calls
PUT    /api/calls/:id
DELETE /api/calls/:id
POST   /api/calls/:id/recording
GET    /api/calls/analytics

// Employees
GET    /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
GET    /api/employees/:id/performance
GET    /api/employees/leaderboard

// Leads
GET    /api/leads
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/import
GET    /api/leads/export
POST   /api/leads/:id/score

// Scripts
GET    /api/scripts
POST   /api/scripts
PUT    /api/scripts/:id
DELETE /api/scripts/:id
GET    /api/scripts/:id/analytics

// Reports
GET    /api/reports
POST   /api/reports/generate
GET    /api/reports/:id
DELETE /api/reports/:id
GET    /api/reports/:id/export
```

#### 4.2 실시간 구독

```typescript
// Supabase Realtime 구독
const callsChannel = supabase
  .channel('calls')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'calls' },
    handleCallUpdate
  )
  .subscribe();

const dashboardChannel = supabase
  .channel('dashboard')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'calls' },
    updateMetrics
  )
  .subscribe();
```

### 5. 보안 요구사항

#### 5.1 인증 및 권한
- Supabase Auth 기반 인증
- JWT 토큰 관리
- Role-based Access Control (RBAC)
- Row Level Security (RLS) 정책

#### 5.2 데이터 보호
- HTTPS 전용
- 민감 데이터 암호화
- SQL Injection 방지
- XSS/CSRF 방지
- Rate Limiting

### 6. 성능 요구사항

#### 6.1 목표 지표
- 페이지 로드: < 2초
- API 응답: < 500ms
- 실시간 업데이트: < 1초
- 동시 접속: 500+ users

#### 6.2 최적화 전략
- Next.js SSR/ISR
- React Query 캐싱
- 이미지 최적화
- Code Splitting
- Lazy Loading
- Database Indexing

### 7. 개발 환경 설정

#### 7.1 필수 도구
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

#### 7.2 환경 변수
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CHANNEL_TALK_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

### 8. 배포 아키텍처

#### 8.1 인프라
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Storage**: Supabase Storage
- **Monitoring**: Vercel Analytics + Sentry

#### 8.2 CI/CD 파이프라인
```yaml
# GitHub Actions
- Lint & Type Check
- Unit Tests
- Build
- Deploy to Vercel (Preview)
- E2E Tests
- Deploy to Vercel (Production)
```

### 9. 테스팅 전략

#### 9.1 테스트 범위
- Unit Tests: 80% coverage
- Integration Tests: API endpoints
- E2E Tests: Critical user flows
- Performance Tests: Load testing

#### 9.2 테스트 도구
- Jest + React Testing Library
- Playwright (E2E)
- MSW (API Mocking)
- Lighthouse (Performance)

### 10. 모니터링 및 로깅

#### 10.1 모니터링
- Vercel Analytics: 페이지 성능
- Sentry: 에러 트래킹
- Supabase Dashboard: DB 성능
- Custom Metrics: 비즈니스 KPI

#### 10.2 로깅
- Server Logs: Vercel Functions
- Client Logs: Sentry
- Audit Logs: Supabase
- Activity Logs: Custom implementation