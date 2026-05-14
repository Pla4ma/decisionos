/**
 * Goal Creation Form Component
 * 
 * Comprehensive form for creating SMART goals with validation and state management.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { GoalValidators } from '../../validation/ProductivityValidators';
import { getGoalTrackingService } from '../../goals/GoalTrackingService';
import type { RealGoal } from '../../core/ProductivityEngine';

interface GoalCreationFormProps {
  onSuccess?: (goal: RealGoal) => void;
  onCancel?: () => void;
  initialData?: Partial<RealGoal>;
  mode?: 'create' | 'edit';
  goalId?: string;
}

interface FormData {
  title: string;
  description: string;
  category: RealGoal['category'];
  priority: RealGoal['priority'];
  targetOutcome: string;
  successMetrics: string[];
  estimatedImpact: RealGoal['estimatedImpact'];
  targetDate: string;
  targetTime: string;
}

interface FormState {
  data: FormData;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
  saving: boolean;
  saved: boolean;
}

export const GoalCreationForm: React.FC<GoalCreationFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  mode = 'create',
  goalId,
}) => {
  const goalService = getGoalTrackingService();
  
  const [formState, setFormState] = useState<FormState>({
    data: {
      title: '',
      description: '',
      category: 'CAREER',
      priority: 'MEDIUM',
      targetOutcome: '',
      successMetrics: [''],
      estimatedImpact: 'MODERATE',
      targetDate: '',
      targetTime: '12:00',
      ...initialData,
    },
    errors: {},
    warnings: {},
    touched: {},
    loading: false,
    saving: false,
    saved: false,
  });

  const [showMetricInput, setShowMetricInput] = useState(false);
  const [newMetric, setNewMetric] = useState('');

  // Categories and options
  const categories: RealGoal['category'][] = [
    'CAREER', 'HEALTH', 'RELATIONSHIPS', 'LEARNING', 'FINANCIAL', 'CREATIVE'
  ];

  const priorities: RealGoal['priority'][] = [
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  ];

  const impacts: RealGoal['estimatedImpact'][] = [
    'MINOR', 'MODERATE', 'MAJOR', 'TRANSFORMATIVE'
  ];

  // Load existing goal data if editing
  useEffect(() => {
    if (mode === 'edit' && goalId) {
      loadGoalData();
    }
  }, [mode, goalId]);

  const loadGoalData = async () => {
    if (!goalId) return;

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const goal = goalService.getGoalById(goalId);
      if (goal) {
        setFormState(prev => ({
          ...prev,
          data: {
            title: goal.title,
            description: goal.description,
            category: goal.category,
            priority: goal.priority,
            targetOutcome: goal.targetOutcome,
            successMetrics: goal.successMetrics.length > 0 ? goal.successMetrics : [''],
            estimatedImpact: goal.estimatedImpact,
            targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
            targetTime: goal.targetDate ? new Date(goal.targetDate).toTimeString().slice(0, 5) : '12:00',
          },
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to load goal:', error);
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const validateField = (field: keyof FormData, value: any): void => {
    const validation = GoalValidators.validateGoal({
      ...formState.data,
      [field]: value,
    });

    const fieldErrors = validation.errors.filter(e => e.field === field);
    const fieldWarnings = validation.warnings.filter(w => w.field === field);

    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: fieldErrors.length > 0 ? fieldErrors[0].message : '',
      },
      warnings: {
        ...prev.warnings,
        [field]: fieldWarnings.length > 0 ? fieldWarnings[0].message : '',
      },
    }));
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }));

    if (formState.touched[field]) {
      validateField(field, value);
    }
  };

  const handleMetricChange = (index: number, value: string) => {
    const newMetrics = [...formState.data.successMetrics];
    newMetrics[index] = value;
    handleFieldChange('successMetrics', newMetrics);
  };

  const addMetric = () => {
    if (newMetric.trim()) {
      const newMetrics = [...formState.data.successMetrics, newMetric.trim()];
      handleFieldChange('successMetrics', newMetrics);
      setNewMetric('');
      setShowMetricInput(false);
    }
  };

  const removeMetric = (index: number) => {
    const newMetrics = formState.data.successMetrics.filter((_, i) => i !== index);
    handleFieldChange('successMetrics', newMetrics.length > 0 ? newMetrics : ['']);
  };

  const validateForm = (): boolean => {
    const goalData: Partial<RealGoal> = {
      title: formState.data.title,
      description: formState.data.description,
      category: formState.data.category,
      priority: formState.data.priority,
      targetOutcome: formState.data.targetOutcome,
      successMetrics: formState.data.successMetrics.filter(m => m.trim()),
      estimatedImpact: formState.data.estimatedImpact,
      targetDate: formState.data.targetDate && formState.data.targetTime 
        ? new Date(`${formState.data.targetDate}T${formState.data.targetTime}:00`).getTime()
        : undefined,
    };

    const validation = GoalValidators.validateGoal(goalData);

    const errors: Record<string, string> = {};
    validation.errors.forEach(error => {
      errors[error.field] = error.message;
    });

    setFormState(prev => ({
      ...prev,
      errors,
      touched: Object.keys(prev.data).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    }));

    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    setFormState(prev => ({ ...prev, saving: true }));

    try {
      const goalData: Partial<RealGoal> = {
        title: formState.data.title,
        description: formState.data.description,
        category: formState.data.category,
        priority: formState.data.priority,
        targetOutcome: formState.data.targetOutcome,
        successMetrics: formState.data.successMetrics.filter(m => m.trim()),
        estimatedImpact: formState.data.estimatedImpact,
        targetDate: formState.data.targetDate && formState.data.targetTime 
          ? new Date(`${formState.data.targetDate}T${formState.data.targetTime}:00`).getTime()
          : undefined,
      };

      let savedGoal: RealGoal;

      if (mode === 'edit' && goalId) {
        savedGoal = await goalService.updateGoal(goalId, goalData);
      } else {
        savedGoal = await goalService.createSMARTGoal(goalData);
      }

      setFormState(prev => ({ ...prev, saving: false, saved: true }));
      onSuccess?.(savedGoal);

    } catch (error) {
      console.error('Failed to save goal:', error);
      setFormState(prev => ({ ...prev, saving: false }));
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const renderField = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    multiline: boolean = false,
    keyboardType?: any
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          formState.errors[field] && styles.inputError,
          formState.warnings[field] && styles.inputWarning,
        ]}
        placeholder={placeholder}
        value={formState.data[field] as string}
        onChangeText={(value) => handleFieldChange(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
      {formState.errors[field] && (
        <Text style={styles.errorText}>{formState.errors[field]}</Text>
      )}
      {formState.warnings[field] && (
        <Text style={styles.warningText}>{formState.warnings[field]}</Text>
      )}
    </View>
  );

  const renderPicker = (
    field: keyof FormData,
    label: string,
    options: string[]
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pickerContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                formState.data[field] === option && styles.pickerOptionSelected,
              ]}
              onPress={() => handleFieldChange(field, option)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  formState.data[field] === option && styles.pickerOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSuccessMetrics = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Success Metrics</Text>
      {formState.data.successMetrics.map((metric, index) => (
        <View key={index} style={styles.metricContainer}>
          <TextInput
            style={[
              styles.input,
              styles.metricInput,
              formState.errors.successMetrics && styles.inputError,
            ]}
            placeholder="How will you know this goal is achieved?"
            value={metric}
            onChangeText={(value) => handleMetricChange(index, value)}
          />
          {formState.data.successMetrics.length > 1 && (
            <TouchableOpacity
              style={styles.removeMetricButton}
              onPress={() => removeMetric(index)}
            >
              <Text style={styles.removeMetricText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      {showMetricInput ? (
        <View style={styles.addMetricContainer}>
          <TextInput
            style={[styles.input, styles.newMetricInput]}
            placeholder="Add new success metric"
            value={newMetric}
            onChangeText={setNewMetric}
            onSubmitEditing={addMetric}
            autoFocus
          />
          <TouchableOpacity style={styles.addMetricButton} onPress={addMetric}>
            <Text style={styles.addMetricText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addMetricButton, styles.cancelMetricButton]}
            onPress={() => {
              setShowMetricInput(false);
              setNewMetric('');
            }}
          >
            <Text style={styles.cancelMetricText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addMetricTrigger}
          onPress={() => setShowMetricInput(true)}
        >
          <Text style={styles.addMetricTriggerText}>+ Add Success Metric</Text>
        </TouchableOpacity>
      )}
      
      {formState.errors.successMetrics && (
        <Text style={styles.errorText}>{formState.errors.successMetrics}</Text>
      )}
    </View>
  );

  if (formState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading goal data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
        </Text>

        {renderField('title', 'Goal Title', 'What do you want to achieve?')}
        {renderField('description', 'Description', 'Describe your goal in detail...', true)}
        
        {renderPicker('category', 'Category', categories)}
        {renderPicker('priority', 'Priority', priorities)}
        {renderPicker('estimatedImpact', 'Estimated Impact', impacts)}

        {renderField('targetOutcome', 'Target Outcome', 'What does success look like?')}
        {renderSuccessMetrics()}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Target Date</Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="YYYY-MM-DD"
              value={formState.data.targetDate}
              onChangeText={(value) => handleFieldChange('targetDate', value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.timeInput]}
              placeholder="HH:MM"
              value={formState.data.targetTime}
              onChangeText={(value) => handleFieldChange('targetTime', value)}
              keyboardType="numeric"
            />
          </View>
          {formState.errors.targetDate && (
            <Text style={styles.errorText}>{formState.errors.targetDate}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={formState.saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              formState.saving && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={formState.saving}
          >
            <Text style={styles.saveButtonText}>
              {formState.saving ? 'Saving...' : mode === 'create' ? 'Create Goal' : 'Update Goal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputWarning: {
    borderColor: '#f39c12',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  warningText: {
    color: '#f39c12',
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  pickerOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricInput: {
    flex: 1,
    marginRight: 8,
  },
  removeMetricButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMetricText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addMetricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  newMetricInput: {
    flex: 1,
    marginRight: 8,
  },
  addMetricButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#27ae60',
    marginLeft: 8,
  },
  addMetricText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelMetricButton: {
    backgroundColor: '#95a5a6',
  },
  cancelMetricText: {
    color: '#fff',
  },
  addMetricTrigger: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addMetricTriggerText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    flex: 1,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3498db',
    flex: 2,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};
