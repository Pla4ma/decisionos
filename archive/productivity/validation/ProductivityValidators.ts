/**
 * Productivity Validators
 * 
 * Comprehensive validation for all productivity data structures.
 * Ensures data integrity and provides helpful error messages.
 */

import { createDebugger } from '../../utils/debug';
import type { RealGoal, MicroCommitment, FocusSession, HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:validators');

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'ERROR';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'WARNING';
}

export type ValidationRule<T> = (value: T, context?: any) => ValidationError | null;

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================

export class CommonValidators {
  static required(field: string, value: any): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return {
        field,
        message: `${field} is required`,
        code: 'REQUIRED',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static minLength(field: string, value: string, min: number): ValidationError | null {
    if (value && value.length < min) {
      return {
        field,
        message: `${field} must be at least ${min} characters long`,
        code: 'MIN_LENGTH',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static maxLength(field: string, value: string, max: number): ValidationError | null {
    if (value && value.length > max) {
      return {
        field,
        message: `${field} must be no more than ${max} characters long`,
        code: 'MAX_LENGTH',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static range(field: string, value: number, min: number, max: number): ValidationError | null {
    if (value !== null && value !== undefined && (value < min || value > max)) {
      return {
        field,
        message: `${field} must be between ${min} and ${max}`,
        code: 'OUT_OF_RANGE',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static positiveNumber(field: string, value: number): ValidationError | null {
    if (value !== null && value !== undefined && value < 0) {
      return {
        field,
        message: `${field} must be a positive number`,
        code: 'INVALID_NUMBER',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static futureDate(field: string, value: number): ValidationError | null {
    if (value && value < Date.now()) {
      return {
        field,
        message: `${field} must be in the future`,
        code: 'PAST_DATE',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static email(field: string, value: string): ValidationError | null {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return {
        field,
        message: `${field} must be a valid email address`,
        code: 'INVALID_EMAIL',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static url(field: string, value: string): ValidationError | null {
    if (value && !/^https?:\/\/.+\..+/.test(value)) {
      return {
        field,
        message: `${field} must be a valid URL`,
        code: 'INVALID_URL',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static arrayMinLength(field: string, value: any[], min: number): ValidationError | null {
    if (value && value.length < min) {
      return {
        field,
        message: `${field} must contain at least ${min} items`,
        code: 'ARRAY_MIN_LENGTH',
        severity: 'ERROR',
      };
    }
    return null;
  }

  static arrayMaxLength(field: string, value: any[], max: number): ValidationError | null {
    if (value && value.length > max) {
      return {
        field,
        message: `${field} must contain no more than ${max} items`,
        code: 'ARRAY_MAX_LENGTH',
        severity: 'ERROR',
      };
    }
    return null;
  }
}

// ============================================================================
// GOAL VALIDATORS
// ============================================================================

export class GoalValidators {
  static validateGoal(goal: Partial<RealGoal>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    const titleError = CommonValidators.required('title', goal.title);
    if (titleError) errors.push(titleError);

    const descriptionError = CommonValidators.required('description', goal.description);
    if (descriptionError) errors.push(descriptionError);

    const categoryError = CommonValidators.required('category', goal.category);
    if (categoryError) errors.push(categoryError);

    const targetOutcomeError = CommonValidators.required('targetOutcome', goal.targetOutcome);
    if (targetOutcomeError) errors.push(targetOutcomeError);

    // Length validations
    if (goal.title) {
      const titleMinError = CommonValidators.minLength('title', goal.title, 3);
      if (titleMinError) errors.push(titleMinError);

      const titleMaxError = CommonValidators.maxLength('title', goal.title, 100);
      if (titleMaxError) errors.push(titleMaxError);
    }

    if (goal.description) {
      const descMinError = CommonValidators.minLength('description', goal.description, 10);
      if (descMinError) errors.push(descMinError);

      const descMaxError = CommonValidators.maxLength('description', goal.description, 500);
      if (descMaxError) errors.push(descMaxError);
    }

    // Progress validation
    if (goal.progress !== undefined) {
      const progressError = CommonValidators.range('progress', goal.progress, 0, 100);
      if (progressError) errors.push(progressError);
    }

    // Target date validation
    if (goal.targetDate) {
      const targetDateError = CommonValidators.futureDate('targetDate', goal.targetDate);
      if (targetDateError) errors.push(targetDateError);
    }

    // Success metrics validation
    if (goal.successMetrics) {
      const metricsMinError = CommonValidators.arrayMinLength('successMetrics', goal.successMetrics, 1);
      if (metricsMinError) errors.push(metricsMinError);

      const metricsMaxError = CommonValidators.arrayMaxLength('successMetrics', goal.successMetrics, 10);
      if (metricsMaxError) errors.push(metricsMaxError);

      // Validate each metric
      goal.successMetrics.forEach((metric, index) => {
        if (metric && metric.length < 5) {
          errors.push({
            field: `successMetrics[${index}]`,
            message: 'Each success metric must be at least 5 characters long',
            code: 'METRIC_TOO_SHORT',
            severity: 'ERROR',
          });
        }
      });
    }

    // Investment minutes validation
    if (goal.totalInvestmentMinutes !== undefined) {
      const investmentError = CommonValidators.positiveNumber('totalInvestmentMinutes', goal.totalInvestmentMinutes);
      if (investmentError) errors.push(investmentError);
    }

    // Warnings
    if (goal.targetDate && goal.targetDate < Date.now() + (7 * 24 * 60 * 60 * 1000)) {
      warnings.push({
        field: 'targetDate',
        message: 'Target date is less than one week away - consider extending timeline',
        code: 'TIGHT_DEADLINE',
        severity: 'WARNING',
      });
    }

    if (goal.successMetrics && goal.successMetrics.length > 5) {
      warnings.push({
        field: 'successMetrics',
        message: 'Many success metrics may make the goal harder to track',
        code: 'TOO_MANY_METRICS',
        severity: 'WARNING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateGoalUpdate(goal: Partial<RealGoal>, existingGoal: RealGoal): ValidationResult {
    const baseValidation = this.validateGoal(goal);
    
    // Additional validations for updates
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Status transition validation
    if (goal.status && goal.status !== existingGoal.status) {
      if (existingGoal.status === 'COMPLETED' && goal.status !== 'COMPLETED') {
        errors.push({
          field: 'status',
          message: 'Cannot change status from COMPLETED to another status',
          code: 'INVALID_STATUS_TRANSITION',
          severity: 'ERROR',
        });
      }

      if (goal.status === 'COMPLETED' && existingGoal.progress < 100) {
        errors.push({
          field: 'status',
          message: 'Cannot mark goal as COMPLETED with less than 100% progress',
          code: 'INCOMPLETE_COMPLETION',
          severity: 'ERROR',
        });
      }
    }

    // Progress validation for updates
    if (goal.progress !== undefined && goal.progress < existingGoal.progress) {
      warnings.push({
        field: 'progress',
        message: 'Progress is decreasing - this may indicate an error',
        code: 'DECREASING_PROGRESS',
        severity: 'WARNING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// HABIT VALIDATORS
// ============================================================================

export class HabitValidators {
  static validateHabit(habit: Partial<HabitPattern>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    const nameError = CommonValidators.required('name', habit.name);
    if (nameError) errors.push(nameError);

    const cueError = CommonValidators.required('cue', habit.cue);
    if (cueError) errors.push(cueError);

    const routineError = CommonValidators.required('routine', habit.routine);
    if (routineError) errors.push(routineError);

    const rewardError = CommonValidators.required('reward', habit.reward);
    if (rewardError) errors.push(rewardError);

    // Length validations
    if (habit.name) {
      const nameMinError = CommonValidators.minLength('name', habit.name, 2);
      if (nameMinError) errors.push(nameMinError);

      const nameMaxError = CommonValidators.maxLength('name', habit.name, 50);
      if (nameMaxError) errors.push(nameMaxError);
    }

    if (habit.cue) {
      const cueMinError = CommonValidators.minLength('cue', habit.cue, 5);
      if (cueMinError) errors.push(cueMinError);

      const cueMaxError = CommonValidators.maxLength('cue', habit.cue, 100);
      if (cueMaxError) errors.push(cueMaxError);
    }

    if (habit.routine) {
      const routineMinError = CommonValidators.minLength('routine', habit.routine, 5);
      if (routineMinError) errors.push(routineMinError);

      const routineMaxError = CommonValidators.maxLength('routine', habit.routine, 200);
      if (routineMaxError) errors.push(routineMaxError);
    }

    if (habit.reward) {
      const rewardMinError = CommonValidators.minLength('reward', habit.reward, 3);
      if (rewardMinError) errors.push(rewardMinError);

      const rewardMaxError = CommonValidators.maxLength('reward', habit.reward, 100);
      if (rewardMaxError) errors.push(rewardMaxError);
    }

    // Strength validation
    if (habit.strength !== undefined) {
      const strengthError = CommonValidators.range('strength', habit.strength, 0, 100);
      if (strengthError) errors.push(strengthError);
    }

    // Streak validation
    if (habit.streak !== undefined) {
      const streakError = CommonValidators.positiveNumber('streak', habit.streak);
      if (streakError) errors.push(streakError);
    }

    // Context validation
    if (habit.context) {
      const contextMaxError = CommonValidators.maxLength('context', habit.context, 100);
      if (contextMaxError) errors.push(contextMaxError);
    }

    // Warnings
    if (habit.strength && habit.strength > 90) {
      warnings.push({
        field: 'strength',
        message: 'Habit strength is very high - consider maintaining current routine',
        code: 'MAX_STRENGTH',
        severity: 'WARNING',
      });
    }

    if (habit.cue && habit.cue.toLowerCase().includes('every day')) {
      warnings.push({
        field: 'cue',
        message: 'Consider making the cue more specific than "every day"',
        code: 'VAGUE_CUE',
        severity: 'WARNING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateHabitCompletion(habit: HabitPattern, completionTime: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if completion is too close to previous completion
    if (habit.lastCompleted) {
      const timeSinceLastCompletion = completionTime - habit.lastCompleted;
      const minInterval = 12 * 60 * 60 * 1000; // 12 hours

      if (timeSinceLastCompletion < minInterval) {
        warnings.push({
          field: 'completionTime',
          message: 'Habit completion is very close to previous completion',
          code: 'FREQUENT_COMPLETION',
          severity: 'WARNING',
        });
      }
    }

    // Check if completion is at reasonable time
    const hour = new Date(completionTime).getHours();
    if (hour < 5 || hour > 23) {
      warnings.push({
        field: 'completionTime',
        message: 'Habit completed at unusual hour',
        code: 'UNUSUAL_TIME',
        severity: 'WARNING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// FOCUS SESSION VALIDATORS
// ============================================================================

export class FocusSessionValidators {
  static validateFocusSession(session: Partial<FocusSession>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Planned minutes validation
    if (session.plannedMinutes !== undefined) {
      const plannedError = CommonValidators.range('plannedMinutes', session.plannedMinutes, 5, 480);
      if (plannedError) errors.push(plannedError);
    }

    // Actual minutes validation
    if (session.actualMinutes !== undefined) {
      const actualError = CommonValidators.positiveNumber('actualMinutes', session.actualMinutes);
      if (actualError) errors.push(actualError);

      // Check if actual exceeds planned by too much
      if (session.plannedMinutes && session.actualMinutes > session.plannedMinutes * 2) {
        warnings.push({
          field: 'actualMinutes',
          message: 'Actual time significantly exceeds planned time',
          code: 'TIME_OVERRUN',
          severity: 'WARNING',
        });
      }
    }

    // Quality validation
    if (session.quality !== undefined) {
      const validQualities = ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'];
      if (!validQualities.includes(session.quality)) {
        errors.push({
          field: 'quality',
          message: 'Quality must be one of: POOR, FAIR, GOOD, EXCELLENT',
          code: 'INVALID_QUALITY',
          severity: 'ERROR',
        });
      }
    }

    // Distractions validation
    if (session.distractions !== undefined) {
      const distractionsError = CommonValidators.positiveNumber('distractions', session.distractions);
      if (distractionsError) errors.push(distractionsError);

      if (session.distractions > 10) {
        warnings.push({
          field: 'distractions',
          message: 'High number of distractions - consider improving environment',
          code: 'MANY_DISTRACTIONS',
          severity: 'WARNING',
        });
      }
    }

    // Interruptions validation
    if (session.interruptions !== undefined) {
      const interruptionsError = CommonValidators.positiveNumber('interruptions', session.interruptions);
      if (interruptionsError) errors.push(interruptionsError);
    }

    // Notes validation
    if (session.notes) {
      const notesMaxError = CommonValidators.maxLength('notes', session.notes, 1000);
      if (notesMaxError) errors.push(notesMaxError);
    }

    // Time consistency validation
    if (session.startTime && session.endTime) {
      if (session.endTime <= session.startTime) {
        errors.push({
          field: 'endTime',
          message: 'End time must be after start time',
          code: 'INVALID_TIME_RANGE',
          severity: 'ERROR',
        });
      }

      const duration = session.endTime - session.startTime;
      const actualMinutes = Math.round(duration / (60 * 1000));
      
      if (session.actualMinutes && Math.abs(session.actualMinutes - actualMinutes) > 5) {
        warnings.push({
          field: 'actualMinutes',
          message: 'Actual minutes may not match the time range',
          code: 'TIME_MISMATCH',
          severity: 'WARNING',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateSessionStart(session: Partial<FocusSession>): ValidationResult {
    const baseValidation = this.validateFocusSession(session);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Additional validations for session start
    if (session.startTime) {
      // Check if start time is in the future
      if (session.startTime > Date.now() + (5 * 60 * 1000)) {
        errors.push({
          field: 'startTime',
          message: 'Start time cannot be more than 5 minutes in the future',
          code: 'FUTURE_START',
          severity: 'ERROR',
        });
      }

      // Check if start time is too far in the past
      if (session.startTime < Date.now() - (24 * 60 * 60 * 1000)) {
        errors.push({
          field: 'startTime',
          message: 'Start time cannot be more than 24 hours in the past',
          code: 'PAST_START',
          severity: 'ERROR',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// MICRO COMMITMENT VALIDATORS
// ============================================================================

export class MicroCommitmentValidators {
  static validateMicroCommitment(commitment: Partial<MicroCommitment>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    const titleError = CommonValidators.required('title', commitment.title);
    if (titleError) errors.push(titleError);

    const goalIdError = CommonValidators.required('goalId', commitment.goalId);
    if (goalIdError) errors.push(goalIdError);

    // Length validations
    if (commitment.title) {
      const titleMinError = CommonValidators.minLength('title', commitment.title, 3);
      if (titleMinError) errors.push(titleMinError);

      const titleMaxError = CommonValidators.maxLength('title', commitment.title, 100);
      if (titleMaxError) errors.push(titleMaxError);
    }

    // Time validations
    if (commitment.estimatedMinutes !== undefined) {
      const estimatedError = CommonValidators.range('estimatedMinutes', commitment.estimatedMinutes, 1, 240);
      if (estimatedError) errors.push(estimatedError);
    }

    if (commitment.actualMinutes !== undefined) {
      const actualError = CommonValidators.positiveNumber('actualMinutes', commitment.actualMinutes);
      if (actualError) errors.push(actualError);

      // Check if actual significantly exceeds estimated
      if (commitment.estimatedMinutes && commitment.actualMinutes > commitment.estimatedMinutes * 2) {
        warnings.push({
          field: 'actualMinutes',
          message: 'Actual time significantly exceeds estimated time',
          code: 'TIME_ESTIMATE_OFF',
          severity: 'WARNING',
        });
      }
    }

    // Completion criteria validation
    if (commitment.completionCriteria) {
      const criteriaMinError = CommonValidators.minLength('completionCriteria', commitment.completionCriteria, 5);
      if (criteriaMinError) errors.push(criteriaMinError);

      const criteriaMaxError = CommonValidators.maxLength('completionCriteria', commitment.completionCriteria, 200);
      if (criteriaMaxError) errors.push(criteriaMaxError);
    }

    // Context validation
    if (commitment.context) {
      const contextMaxError = CommonValidators.maxLength('context', commitment.context, 100);
      if (contextMaxError) errors.push(contextMaxError);
    }

    // Real outcome validation
    if (commitment.realOutcome) {
      const outcomeMaxError = CommonValidators.maxLength('realOutcome', commitment.realOutcome, 200);
      if (outcomeMaxError) errors.push(outcomeMaxError);
    }

    // Warnings
    if (commitment.estimatedMinutes && commitment.estimatedMinutes > 120) {
      warnings.push({
        field: 'estimatedMinutes',
        message: 'Long commitment - consider breaking into smaller pieces',
        code: 'LONG_COMMITMENT',
        severity: 'WARNING',
      });
    }

    if (commitment.title && commitment.title.toLowerCase().includes('and')) {
      warnings.push({
        field: 'title',
        message: 'Commitment contains "and" - consider splitting into separate commitments',
        code: 'MULTIPLE_TASKS',
        severity: 'WARNING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationUtils {
  static combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    results.forEach(result => {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  static formatValidationMessage(result: ValidationResult): string {
    if (result.isValid && result.warnings.length === 0) {
      return 'Validation passed successfully';
    }

    const messages: string[] = [];

    if (result.errors.length > 0) {
      messages.push(`Errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    if (result.warnings.length > 0) {
      messages.push(`Warnings: ${result.warnings.map(w => w.message).join(', ')}`);
    }

    return messages.join(' | ');
  }

  static getErrorSummary(result: ValidationResult): {
    totalErrors: number;
    totalWarnings: number;
    errorFields: string[];
    warningFields: string[];
  } {
    return {
      totalErrors: result.errors.length,
      totalWarnings: result.warnings.length,
      errorFields: [...new Set(result.errors.map(e => e.field))],
      warningFields: [...new Set(result.warnings.map(w => w.field))],
    };
  }
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

export class BatchValidators {
  static validateGoals(goals: Partial<RealGoal>[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    goals.forEach((goal, index) => {
      const result = GoalValidators.validateGoal(goal);
      
      // Add index to field names for clarity
      result.errors.forEach(error => {
        allErrors.push({
          ...error,
          field: `goals[${index}].${error.field}`,
        });
      });

      result.warnings.forEach(warning => {
        allWarnings.push({
          ...warning,
          field: `goals[${index}].${warning.field}`,
        });
      });
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  static validateHabits(habits: Partial<HabitPattern>[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    habits.forEach((habit, index) => {
      const result = HabitValidators.validateHabit(habit);
      
      result.errors.forEach(error => {
        allErrors.push({
          ...error,
          field: `habits[${index}].${error.field}`,
        });
      });

      result.warnings.forEach(warning => {
        allWarnings.push({
          ...warning,
          field: `habits[${index}].${warning.field}`,
        });
      });
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
}
