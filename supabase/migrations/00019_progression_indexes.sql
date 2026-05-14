-- Indexes for new engagement and progression systems
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_reviews_decision ON micro_reviews(decision_id);
CREATE INDEX IF NOT EXISTS idx_micro_reviews_user ON micro_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_reviews_decision ON quick_reviews(decision_id);
CREATE INDEX IF NOT EXISTS idx_quick_reviews_user ON quick_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_life_chapters_user ON life_chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_life_chapters_active ON life_chapters(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_decision_graveyard_user ON decision_graveyard(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_graveyard_abandoned ON decision_graveyard(abandoned_at DESC);
CREATE INDEX IF NOT EXISTS idx_accountability_pacts_owner ON accountability_pacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_accountability_pacts_partner ON accountability_pacts(partner_id);
CREATE INDEX IF NOT EXISTS idx_pact_invites_token ON pact_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_pact_invites_status ON pact_invites(status);

-- RPC to update chapter stats when a decision is reviewed
CREATE OR REPLACE FUNCTION update_chapter_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'reviewed' OR NEW.status = 'quick_reviewed' THEN
    UPDATE life_chapters
    SET reviewed_count = (
      SELECT COUNT(*) FROM decisions
      WHERE chapter_id = life_chapters.id AND status IN ('reviewed', 'quick_reviewed')
    ),
    decision_count = (
      SELECT COUNT(*) FROM decisions
      WHERE chapter_id = life_chapters.id
    ),
    average_satisfaction = (
      SELECT AVG(dr.satisfaction_score) FROM decision_reviews dr
      JOIN decisions d ON d.id = dr.decision_id
      WHERE d.chapter_id = life_chapters.id
    ),
    updated_at = now()
    WHERE id = NEW.chapter_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_chapter_stats_trigger
  AFTER UPDATE OF status ON decisions
  FOR EACH ROW
  WHEN (NEW.chapter_id IS NOT NULL)
  EXECUTE FUNCTION update_chapter_stats();

-- Add last_active_at to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_quick_reviews INTEGER NOT NULL DEFAULT 0;
