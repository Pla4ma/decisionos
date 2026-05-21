import { CreateOptionInput } from './decisionTypes';
import { DraftDecision } from '@/stores/decisionDraftStore';
import { DECISION_RULES } from './decisionRules';

export const MIN_CONTEXT_LENGTH = 50;

export type ValidationLevel = 'field' | 'summary';

export interface FieldError {
  field: string;
  message: string;
}

export function validateDecisionBasics(draft: Partial<DraftDecision> | null | undefined): string[] {
  const errors: string[] = [];
  if (!draft) return ['No draft data'];
  if (!draft.title?.trim()) errors.push('Title is required');
  else if (draft.title.trim().length < DECISION_RULES.MIN_TITLE_LENGTH) {
    errors.push(`Title must be at least ${DECISION_RULES.MIN_TITLE_LENGTH} characters`);
  }
  if (!draft.category) errors.push('Category is required');
  if (!draft.context?.trim()) errors.push('Context is required');
  return errors;
}

export function validateDecisionBasicsFields(draft: Pick<DraftDecision, 'title' | 'category' | 'context'> | null | undefined): FieldError[] {
  const errors: FieldError[] = [];
  if (!draft) return [{ field: 'title', message: 'No draft data' }];
  if (!draft.title?.trim()) errors.push({ field: 'title', message: 'Title is required' });
  else if (draft.title.trim().length < DECISION_RULES.MIN_TITLE_LENGTH) {
    errors.push({ field: 'title', message: `Title must be at least ${DECISION_RULES.MIN_TITLE_LENGTH} characters` });
  }
  if (!draft.category) errors.push({ field: 'category', message: 'Please select a category to continue' });
  if (!draft.context?.trim()) errors.push({ field: 'context', message: 'Context helps the AI give better analysis' });
  else if (draft.context.trim().length < MIN_CONTEXT_LENGTH) {
    errors.push({ field: 'context', message: `Context needs at least ${MIN_CONTEXT_LENGTH} characters for meaningful analysis` });
  }
  return errors;
}

export function validateDecisionOptions(options: CreateOptionInput[] | undefined | null): string[] {
  const errors: string[] = [];
  if (!options || options.length < DECISION_RULES.MIN_OPTIONS) {
    errors.push(`At least ${DECISION_RULES.MIN_OPTIONS} options required`);
  }
  (options || []).forEach((opt, i) => {
    if (!opt.title?.trim()) errors.push(`Option ${i + 1} needs a title`);
    else if (opt.title.trim().length < DECISION_RULES.MIN_OPTION_TITLE_LENGTH) {
      errors.push(`Option ${i + 1} title must be at least ${DECISION_RULES.MIN_OPTION_TITLE_LENGTH} characters`);
    }
  });
  return errors;
}

export function validateDecisionOptionsFields(options: CreateOptionInput[] | undefined | null): FieldError[] {
  const errors: FieldError[] = [];
  if (!options || options.length < DECISION_RULES.MIN_OPTIONS) {
    errors.push({ field: 'options_count', message: `Add at least ${DECISION_RULES.MIN_OPTIONS} options to compare` });
  }
  (options || []).forEach((opt, i) => {
    if (!opt.title?.trim()) errors.push({ field: `option_${i}_title`, message: `Option ${i + 1} title is required` });
    else if (opt.title.trim().length < DECISION_RULES.MIN_OPTION_TITLE_LENGTH) {
      errors.push({ field: `option_${i}_title`, message: `Option ${i + 1} title must be at least ${DECISION_RULES.MIN_OPTION_TITLE_LENGTH} characters` });
    }
  });
  return errors;
}

export function validateDecisionQuestions(
  answers: Record<string, string> | undefined | null,
  context?: string
): string[] {
  const errors: string[] = [];
  const answered = Object.values(answers || {}).filter(a => a?.trim().length > 0);
  const hasEnoughContext = (context?.trim().length ?? 0) >= MIN_CONTEXT_LENGTH;
  if (answered.length < 1 && !hasEnoughContext) {
    errors.push('Answer at least one reflection question or provide detailed context');
  }
  return errors;
}

export function validateDecisionQuestionsFields(
  answers: Record<string, string> | undefined | null,
  context?: string
): FieldError[] {
  const errors: FieldError[] = [];
  const answered = Object.values(answers || {}).filter(a => a?.trim().length > 0);
  const hasEnoughContext = (context?.trim().length ?? 0) >= MIN_CONTEXT_LENGTH;
  if (answered.length < 1 && !hasEnoughContext) {
    errors.push({ field: 'questions', message: 'Answer at least one guided question or provide detailed context in step 1' });
  }
  return errors;
}

export function validateDecisionReadyForAnalysis(draft: DraftDecision | null | undefined): string[] {
  if (!draft) return ['No draft data'];
  return [
    ...validateDecisionBasics(draft),
    ...validateDecisionOptions(draft.options),
    ...validateDecisionQuestions(draft.answers, draft.context),
  ];
}

export function canProceedFromBasics(draft: DraftDecision | null | undefined): boolean {
  return validateDecisionBasics(draft).length === 0;
}

export function canProceedFromOptions(options: CreateOptionInput[] | undefined | null): boolean {
  return validateDecisionOptions(options).length === 0;
}

export function canProceedFromQuestions(
  answers: Record<string, string> | undefined | null,
  context?: string
): boolean {
  return validateDecisionQuestions(answers, context).length === 0;
}
