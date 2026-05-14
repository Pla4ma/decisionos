import { createDecisionSchema } from './decisionSchemas';

describe('createDecisionSchema', () => {
  it('should accept valid decision data', () => {
    const valid = {
      title: 'Valid Decision Title',
      category: 'career',
      importance: 5,
      urgency: 5,
      context: 'Some context',
    };
    expect(createDecisionSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject title too short', () => {
    const invalid = { title: '123', category: 'career', importance: 5, urgency: 5 };
    expect(createDecisionSchema.safeParse(invalid).success).toBe(false);
  });

  it('should reject invalid importance', () => {
    const invalid = { title: 'Valid Title', category: 'career', importance: 11, urgency: 5 };
    expect(createDecisionSchema.safeParse(invalid).success).toBe(false);
  });
});
