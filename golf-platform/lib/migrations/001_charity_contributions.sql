-- Create charity_contributions table if it doesn't exist
CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities (id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  subscription_amount DECIMAL(10, 2) NOT NULL,
  percentage INT NOT NULL DEFAULT 10,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_charity_contributions_charity_id ON charity_contributions (charity_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_user_id ON charity_contributions (user_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_period_start ON charity_contributions (period_start);

-- RPC function to enforce 5-score rolling limit
CREATE OR REPLACE FUNCTION enforce_score_limit(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_score_count INT;
BEGIN
  SELECT COUNT(*) INTO v_score_count FROM golf_scores WHERE user_id = p_user_id;
  
  IF v_score_count > 5 THEN
    DELETE FROM golf_scores
    WHERE user_id = p_user_id
    AND id IN (
      SELECT id FROM golf_scores
      WHERE user_id = p_user_id
      ORDER BY score_date ASC
      LIMIT (v_score_count - 5)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on charity_contributions
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own contributions
CREATE POLICY "Users can view own charity contributions"
  ON charity_contributions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS: Only service role can insert (from webhooks)
CREATE POLICY "Service role can insert charity contributions"
  ON charity_contributions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
