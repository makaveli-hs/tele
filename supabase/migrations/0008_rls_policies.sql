-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT e.company_id 
        FROM employees e
        JOIN profiles p ON p.employee_id = e.id
        WHERE p.id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM employees e
        JOIN profiles p ON p.employee_id = e.id
        WHERE p.id = user_id 
        AND e.role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Only admins can update company" ON companies
    FOR UPDATE USING (
        id = get_user_company_id(auth.uid()) AND
        is_admin_or_manager(auth.uid())
    );

-- Employees policies
CREATE POLICY "Users can view employees in their company" ON employees
    FOR SELECT USING (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Only admins can insert employees" ON employees
    FOR INSERT WITH CHECK (
        company_id = get_user_company_id(auth.uid()) AND
        is_admin_or_manager(auth.uid())
    );

CREATE POLICY "Only admins can update employees" ON employees
    FOR UPDATE USING (
        company_id = get_user_company_id(auth.uid()) AND
        is_admin_or_manager(auth.uid())
    );

-- Leads policies
CREATE POLICY "Users can view leads in their company" ON leads
    FOR SELECT USING (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Users can insert leads in their company" ON leads
    FOR INSERT WITH CHECK (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Users can update leads in their company" ON leads
    FOR UPDATE USING (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Users can delete leads in their company" ON leads
    FOR DELETE USING (
        company_id = get_user_company_id(auth.uid()) AND
        is_admin_or_manager(auth.uid())
    );

-- Scripts policies
CREATE POLICY "Users can view scripts in their company" ON scripts
    FOR SELECT USING (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Users can insert scripts in their company" ON scripts
    FOR INSERT WITH CHECK (
        company_id = get_user_company_id(auth.uid())
    );

CREATE POLICY "Users can update scripts they created or if admin" ON scripts
    FOR UPDATE USING (
        company_id = get_user_company_id(auth.uid()) AND
        (created_by = (SELECT employee_id FROM profiles WHERE id = auth.uid()) OR is_admin_or_manager(auth.uid()))
    );

-- Outcomes policies (public read for all authenticated users)
CREATE POLICY "All users can view outcomes" ON outcomes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Call logs policies
CREATE POLICY "Users can view call logs in their company" ON call_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id = call_logs.employee_id
            AND e.company_id = get_user_company_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own call logs" ON call_logs
    FOR INSERT WITH CHECK (
        employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own call logs" ON call_logs
    FOR UPDATE USING (
        employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid())
    );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());