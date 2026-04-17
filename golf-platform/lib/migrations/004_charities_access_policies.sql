-- Public and admin access policies for charities table
-- This keeps signup dropdown readable before login while restricting management to admins.

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charities' AND policyname = 'Public can read active charities'
  ) THEN
    CREATE POLICY "Public can read active charities"
      ON charities FOR SELECT
      USING (is_active = true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charities' AND policyname = 'Admins can insert charities'
  ) THEN
    CREATE POLICY "Admins can insert charities"
      ON charities FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charities' AND policyname = 'Admins can update charities'
  ) THEN
    CREATE POLICY "Admins can update charities"
      ON charities FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charities' AND policyname = 'Admins can delete charities'
  ) THEN
    CREATE POLICY "Admins can delete charities"
      ON charities FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END$$;
