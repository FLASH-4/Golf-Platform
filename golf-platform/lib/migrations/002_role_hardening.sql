-- Role and access hardening for PRD compliance

-- Ensure profiles.role uses only supported values
ALTER TABLE profiles
  ALTER COLUMN role SET DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END$$;

-- Audit table for role changes by admins
CREATE TABLE IF NOT EXISTS role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('promote_admin', 'demote_admin')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_audit_log_actor ON role_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_target ON role_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_created_at ON role_audit_log(created_at DESC);

ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'role_audit_log' AND policyname = 'Admins can view role audit log'
  ) THEN
    CREATE POLICY "Admins can view role audit log"
      ON role_audit_log FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'role_audit_log' AND policyname = 'Admins can insert role audit log'
  ) THEN
    CREATE POLICY "Admins can insert role audit log"
      ON role_audit_log FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END$$;

-- Optional helper function to guard last-admin demotion in SQL workflows
CREATE OR REPLACE FUNCTION prevent_last_admin_demotion()
RETURNS trigger AS $$
DECLARE
  admin_count INT;
BEGIN
  IF OLD.role = 'admin' AND NEW.role = 'user' THEN
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last admin user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_demotion ON profiles;
CREATE TRIGGER trg_prevent_last_admin_demotion
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_last_admin_demotion();
