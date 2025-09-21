-- 테스트 회사 및 직원 데이터 생성
-- Supabase SQL Editor에서 실행

-- 1. 테스트 회사 생성
INSERT INTO companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', '테스트 회사')
ON CONFLICT (id) DO NOTHING;

-- 2. 테스트 직원 생성
INSERT INTO employees (id, company_id, name, email, role, status) 
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '테스트 직원',
  'test@example.com',
  'admin',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- 3. 데이터 확인
SELECT * FROM companies;
SELECT * FROM employees;