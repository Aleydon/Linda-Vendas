-- Add approved column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Update existing profiles: admins are always approved
UPDATE profiles SET approved = true WHERE role = 'admin';

-- ============================================
-- RLS: profiles
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler perfis
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT
  USING (true);

-- Usuário pode atualizar o próprio perfil (qualquer campo)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin pode atualizar qualquer perfil
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS: só vendedores aprovados podem criar vendas
-- ============================================
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler vendas
DROP POLICY IF EXISTS "sales_select_all" ON sales;
CREATE POLICY "sales_select_all" ON sales
  FOR SELECT
  USING (true);

-- Só aprovados/admins podem inserir vendas
DROP POLICY IF EXISTS "sales_insert_approved_only" ON sales;
CREATE POLICY "sales_insert_approved_only" ON sales
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (approved = true OR role = 'admin')
    )
  );

-- Admin pode atualizar vendas (confirmar pagamento)
DROP POLICY IF EXISTS "sales_update_admin" ON sales;
CREATE POLICY "sales_update_admin" ON sales
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS: sale_items segue a mesma regra
-- ============================================
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sale_items_select_all" ON sale_items;
CREATE POLICY "sale_items_select_all" ON sale_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "sale_items_insert_approved_only" ON sale_items;
CREATE POLICY "sale_items_insert_approved_only" ON sale_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (approved = true OR role = 'admin')
    )
  );
