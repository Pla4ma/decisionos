-- Migration: Update ai_usage_events event_type constraint
-- Purpose: Support separate event types for different AI features
-- Previously only 'analysis' and 'follow_up' were allowed
-- Now supports: deep_analysis, bias_detection, hindsight_comparison

ALTER TABLE ai_usage_events
DROP CONSTRAINT IF EXISTS ai_usage_events_event_type_check;

ALTER TABLE ai_usage_events
ADD CONSTRAINT ai_usage_events_event_type_check
CHECK (event_type IN ('deep_analysis', 'bias_detection', 'hindsight_comparison', 'follow_up'));

-- Backfill: convert old 'analysis' events to 'deep_analysis'
UPDATE ai_usage_events
SET event_type = 'deep_analysis'
WHERE event_type = 'analysis';
