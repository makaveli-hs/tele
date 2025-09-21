-- 익명 사용자도 데이터를 볼 수 있도록 정책 추가
-- 개발/테스트용

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can view employees in their company" ON employees;
DROP POLICY IF EXISTS "Users can view leads in their company" ON leads;

-- 새 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read companies" ON companies
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read employees" ON employees
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read and write leads" ON leads
    FOR ALL USING (true);

CREATE POLICY "Anyone can read outcomes" ON outcomes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert call logs" ON call_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read call logs" ON call_logs
    FOR SELECT USING (true);