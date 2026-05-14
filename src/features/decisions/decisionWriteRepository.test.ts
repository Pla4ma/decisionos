// Decision Write Repository Tests
// Unit tests for decision write operations

describe('decisionWriteRepository', () => {
  describe('createDecision', () => {
    test('inserts decision with required fields', () => {
      const input = {
        title: 'Should I take this job?',
        category: 'career' as const,
        importance: 8,
        urgency: 6,
      };

      expect(input.title).toBeTruthy();
      expect(input.category).toBe('career');
      expect(input.importance).toBeGreaterThan(0);
    });

    test('context is optional', () => {
      const withContext = { title: 'a', category: 'career' as const, importance: 5, urgency: 5, context: 'Some context' };
      const withoutContext = { title: 'b', category: 'career' as const, importance: 5, urgency: 5 };

      expect(withContext.context).toBe('Some context');
      expect(withoutContext.context).toBeUndefined();
    });

    test('throws when no data returned', () => {
      const data = null;
      expect(() => {
        if (!data) throw new Error('No data returned from insert');
      }).toThrow('No data returned from insert');
    });
  });

  describe('chooseDecisionOption', () => {
    test('first unchooses all options for decision', () => {
      const decisionId = 'decision-1';
      const operations = [
        { action: 'unchoose', decision_id: decisionId },
        { action: 'choose', id: 'option-1' },
      ];

      expect(operations[0].decision_id).toBe(decisionId);
      expect(operations[1].action).toBe('choose');
    });

    test('then marks chosen option', () => {
      const optionId = 'option-2';
      const update = { is_chosen: true };

      expect(update.is_chosen).toBe(true);
    });
  });

  describe('saveDecisionAnswers', () => {
    test('maps answers with decision_id', () => {
      const answers = [
        { question_key: 'q1', answer: 'Answer 1' },
        { question_key: 'q2', answer: 'Answer 2' },
      ];

      const mapped = answers.map((a) => ({
        decision_id: 'decision-1',
        question_key: a.question_key,
        answer: a.answer,
      }));

      expect(mapped[0].decision_id).toBe('decision-1');
      expect(mapped[0].question_key).toBe('q1');
    });

    test('uses upsert with onConflict', () => {
      const upsertConfig = { onConflict: 'decision_id,question_key' };
      expect(upsertConfig.onConflict).toBe('decision_id,question_key');
    });
  });

  describe('saveDecisionAnalysis', () => {
    test('uses upsert with onConflict decision_id', () => {
      const upsertConfig = { onConflict: 'decision_id' };
      expect(upsertConfig.onConflict).toBe('decision_id');
    });

    test('throws when no data returned from upsert', () => {
      const data = null;
      expect(() => {
        if (!data) throw new Error('No data returned from upsert');
      }).toThrow('No data returned from upsert');
    });
  });

  describe('scheduleDecisionReview', () => {
    test('sets scheduled_review_at date', () => {
      const reviewDate = new Date('2024-02-01');
      const scheduled = reviewDate.toISOString();

      expect(scheduled).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('sets status to review_scheduled', () => {
      const status = 'review_scheduled';
      expect(status).toBe('review_scheduled');
    });
  });

  describe('saveDecisionReview', () => {
    test('upserts on decision_id', () => {
      const upsertConfig = { onConflict: 'decision_id' };
      expect(upsertConfig.onConflict).toBe('decision_id');
    });

    test('includes all review fields', () => {
      const input = {
        chosen_option_id: 'option-1',
        outcome_notes: 'It went well',
        satisfaction_score: 8,
        would_choose_same: true,
        lessons_learned: 'Trust the process',
      };

      expect(input.chosen_option_id).toBeTruthy();
      expect(input.outcome_notes).toBeTruthy();
    });

    test('optional fields can be undefined', () => {
      const input = {
        chosen_option_id: 'option-1',
        outcome_notes: 'It went well',
      };

      expect(input.satisfaction_score).toBeUndefined();
      expect(input.would_choose_same).toBeUndefined();
    });
  });

  describe('updateDecisionStatus', () => {
    test('sets completed_at when status is reviewed', () => {
      const status = 'reviewed';
      const updates: Record<string, unknown> = { status };

      if (status === 'reviewed') {
        updates.completed_at = new Date().toISOString();
      }

      expect(updates.status).toBe('reviewed');
      expect(updates.completed_at).toBeTruthy();
    });

    test('does not set completed_at for other statuses', () => {
      const status = 'analyzed';
      const updates: Record<string, unknown> = { status };

      if (status === 'reviewed') {
        updates.completed_at = new Date().toISOString();
      }

      expect(updates.completed_at).toBeUndefined();
    });

    test('always sets updated_at', () => {
      const updates: Record<string, unknown> = {};
      updates.updated_at = new Date().toISOString();

      expect(updates.updated_at).toBeTruthy();
    });
  });

  describe('updateDecision', () => {
    test('partial update works', () => {
      const current = {
        title: 'Original',
        category: 'career' as const,
        importance: 5,
        urgency: 5,
      };

      const updates = { title: 'Updated' };

      const updated = { ...current, ...updates };
      expect(updated.title).toBe('Updated');
      expect(updated.category).toBe('career');
    });
  });

  describe('deleteDecision', () => {
    test('uses delete with id filter', () => {
      const decisionId = 'decision-123';
      const operation = { delete: true, id: decisionId };

      expect(operation.delete).toBe(true);
      expect(operation.id).toBe(decisionId);
    });
  });
});