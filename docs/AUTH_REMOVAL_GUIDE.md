# 인증 기능 제거 및 복원 가이드

## 📋 개요
이 문서는 텔레마케팅 플랫폼에서 인증 기능을 임시로 제거한 내용과 나중에 다시 복원하는 방법을 기록합니다.

---

## 🔴 제거된 인증 기능 목록

### 1. 제거된 페이지
- `/login` - 로그인 페이지 (파일은 유지됨)
- `/register` - 회원가입 페이지 (파일은 유지됨)
- `/dashboard/employees` - 직원 관리 페이지

### 2. 제거된 기능
- 로그아웃 버튼
- 세션 체크
- 사용자 인증 확인
- 직원별 데이터 필터링

---

## 📝 변경된 파일 및 수정 내용

### 1. `/src/app/page.tsx`
**변경 전:**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      router.push('/dashboard');
    }
  };
```

**변경 후:**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 바로 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);
```

---

### 2. `/src/app/(dashboard)/layout.tsx`
**변경 전:**
```typescript
import {
  Phone,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Home,
  UserCheck,
  PhoneCall,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '통화 관리', href: '/dashboard/calls', icon: PhoneCall },
  { name: '리드 관리', href: '/dashboard/leads', icon: Users },
  { name: '직원 관리', href: '/dashboard/employees', icon: UserCheck },
  { name: '스크립트', href: '/dashboard/scripts', icon: FileText },
  { name: '리포트', href: '/dashboard/reports', icon: BarChart3 },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ... 레이아웃 JSX에 로그아웃 버튼 포함
  <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800">
    <Button
      variant="ghost"
      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5 mr-3" />
      로그아웃
    </Button>
  </div>
```

**변경 후:**
```typescript
import {
  Phone,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  PhoneCall,
} from 'lucide-react'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '통화 관리', href: '/dashboard/calls', icon: PhoneCall },
  { name: '리드 관리', href: '/dashboard/leads', icon: Users },
  { name: '스크립트', href: '/dashboard/scripts', icon: FileText },
  { name: '리포트', href: '/dashboard/reports', icon: BarChart3 },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  
  // 로그아웃 버튼 섹션 완전 제거
```

---

### 3. 데이터 접근 패턴 변경

모든 컴포넌트에서 사용자 인증 기반 데이터 접근을 첫 번째 회사/직원 기반으로 변경

#### 3.1 `/src/app/(dashboard)/dashboard/page.tsx`
**변경 전:**
```typescript
const fetchDashboardStats = async () => {
  try {
    // Get user's company ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('employee_id')
      .eq('id', user.id)
      .single()

    if (!profile?.employee_id) return

    const { data: employee } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', profile.employee_id)
      .single()

    if (!employee?.company_id) return
    
    // 이후 employee.company_id와 profile.employee_id 사용
```

**변경 후:**
```typescript
const fetchDashboardStats = async () => {
  try {
    // 임시로 첫 번째 회사의 데이터를 사용 (나중에 인증 추가 시 수정)
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single()

    const companyId = companies?.id
    if (!companyId) {
      setLoading(false)
      return
    }

    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)
      .single()

    const employeeId = employees?.id
    
    // 이후 companyId와 employeeId 사용
```

#### 3.2 동일한 패턴 적용된 파일들:
- `/src/features/leads/components/lead-list.tsx`
- `/src/features/leads/components/lead-upload.tsx`
- `/src/features/calls/components/call-form.tsx`
- `/src/features/calls/components/call-history.tsx`

모든 파일에서:
```typescript
// 변경 전
const { data: { user } } = await supabase.auth.getUser()
// profile 조회 -> employee 조회 -> company_id 획득

// 변경 후
const { data: companies } = await supabase.from('companies').select('id').limit(1).single()
const companyId = companies?.id
const { data: employees } = await supabase.from('employees').select('id').eq('company_id', companyId).limit(1).single()
const employeeId = employees?.id
```

---

## 🔄 인증 기능 복원 방법

### Step 1: 메인 페이지 복원
`/src/app/page.tsx`에서:
1. `createClient` import 추가
2. `checkUser` 함수 복원
3. 자동 리다이렉트 대신 사용자 체크 로직 복원

### Step 2: 대시보드 레이아웃 복원
`/src/app/(dashboard)/layout.tsx`에서:
1. 필요한 import 추가 (`LogOut`, `UserCheck`, `Button`, `createClient`, `useRouter`)
2. 직원 관리 메뉴 항목 추가
3. `handleLogout` 함수 추가
4. 로그아웃 버튼 섹션 추가

### Step 3: 데이터 접근 패턴 복원
모든 데이터 조회 컴포넌트에서:
1. 사용자 인증 체크 복원
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return
```

2. Profile -> Employee -> Company 조회 체인 복원
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('employee_id')
  .eq('id', user.id)
  .single()

const { data: employee } = await supabase
  .from('employees')
  .select('company_id')
  .eq('id', profile.employee_id)
  .single()
```

3. 하드코딩된 첫 번째 회사/직원 대신 실제 사용자 데이터 사용

### Step 4: 보호된 라우트 설정
미들웨어 또는 레이아웃에서 인증 체크 추가:
```typescript
// middleware.ts 또는 layout.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect('/login')
}
```

---

## ⚠️ 주의사항

### 현재 상태 (인증 제거 후)
1. **보안 없음**: 누구나 모든 데이터에 접근 가능
2. **데이터 격리 없음**: 모든 사용자가 동일한 회사 데이터 보기
3. **테스트용으로만 사용**: 프로덕션 환경에서는 절대 사용 금지

### 필수 테스트 데이터
DB에 최소 1개씩 필요:
- companies 테이블에 회사 1개
- employees 테이블에 직원 1개

```sql
-- 테스트 데이터 생성 (필요시)
INSERT INTO companies (name) VALUES ('테스트 회사');

-- company_id는 위에서 생성된 ID 사용
INSERT INTO employees (company_id, name, email, role, status) 
VALUES ('[company_id]', '테스트 직원', 'test@example.com', 'admin', 'active');
```

---

## 🔐 Supabase RLS (Row Level Security) 설정

### RLS 비활성화 (개발/테스트용)

인증 없이 앱을 사용하려면 RLS를 비활성화해야 합니다.

```sql
-- RLS 완전 비활성화 (개발 환경용)
-- ⚠️ 경고: 프로덕션에서는 절대 사용하지 마세요!

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE scripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### RLS 활성화 + 익명 접근 허용

RLS를 유지하면서 익명 사용자 접근을 허용하려면:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can view employees in their company" ON employees;
DROP POLICY IF EXISTS "Users can view leads in their company" ON leads;

-- 익명 사용자 읽기/쓰기 허용
CREATE POLICY "Anyone can read companies" ON companies
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read employees" ON employees
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read and write leads" ON leads
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read outcomes" ON outcomes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage call logs" ON call_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage scripts" ON scripts
    FOR ALL USING (true) WITH CHECK (true);
```

### RLS 재활성화 (프로덕션용)

인증 기능 복원 후 RLS를 다시 활성화:

```sql
-- RLS 재활성화
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 원래 정책 복원 (0008_rls_policies.sql 참고)
```

### 406 에러 해결 방법

`GET .../companies?select=id&limit=1 406 (Not Acceptable)` 에러 발생 시:

1. **즉시 해결**: RLS 비활성화 (위 SQL 실행)

2. **Supabase 대시보드 설정**:
   - Table Editor → 각 테이블 → RLS disabled 확인
   - Authentication → Policies → 정책 확인

3. **환경 변수 확인** (.env.local):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Service Role Key 사용** (관리자 권한):
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   ⚠️ 주의: Service Role Key는 서버 사이드에서만 사용, 클라이언트에 노출 금지

---

## 📌 요약

### 인증 제거를 위한 핵심 변경:
1. 메인 페이지에서 바로 대시보드로 리다이렉트
2. 로그아웃 버튼 및 직원 관리 메뉴 제거
3. 모든 데이터 조회를 첫 번째 회사/직원 기준으로 변경

### 인증 복원을 위한 핵심 작업:
1. 사용자 체크 로직 복원
2. 인증 UI 요소 복원
3. 사용자별 데이터 필터링 복원
4. 보호된 라우트 설정

---

*작성일: 2024년 12월*
*마지막 업데이트: 인증 기능 제거 완료*