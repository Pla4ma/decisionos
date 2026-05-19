import { CreateOptionInput } from './decisionTypes';
import { DraftDecision } from '@/stores/decisionDraftStore';

export function validateDecisionBasics(draft: Partial<DraftDecision> | null | undefined): string[] {
  const errors: string[] = [];
  if (!draft) return ['No draft data'];
  if (!draft.title?.trim()) errors.push('Title is required');
  if (!draft.category) errors.push('Category is required');
  if (!draft.context?.trim()) errors.push('Context is required');
  return errors;
}

export function validateDecisionOptions(options: CreateOptionInput[] | undefined | null): string[] {
  const errors: string[] = [];
  if (!options || options.length < 2) errors.push('At least 2 options required');
  (options || []).forEach((opt, i) => {
    if (!opt.title?.trim()) errors.push(`Option ${i + 1} needs a title`);
  });
  return errors;
}

export function validateDecisionQuestions(answers: Record<string, string> | undefined | null): string[] {
  const errors: string[] = [];
  const answered = Object.values(answers || {}).filter(a => a?.trim().length > 0);
  if (answered.length < 1) errors.push('Answer at least one reflection question');
  return errors;
}

export function validateDecisionReadyForAnalysis(draft: DraftDecision | null | undefined): string[] {
  if (!draft) return ['No draft data'];
  return [
    ...validateDecisionBasics(draft),
    ...validateDecisionOptions(draft.options),
    ...validateDecisionQuestions(draft.answers),
  ];
}

export function canProceedFromBasics(draft: DraftDecision | null | undefined): boolean {
  return validateDecisionBasics(draft).length === 0;
}

export function canProceedFromOptions(options: CreateOptionInput[] | undefined | null): boolean {
  return validateDecisionOptions(options).length === 0;
}

export function canProceedFromQuestions(answers: Record<string, string> | undefined | null): boolean {
  return validateDecisionQuestions(answers).length === 0;
}
