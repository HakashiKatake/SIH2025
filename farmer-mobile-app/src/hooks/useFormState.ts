import { useState, useCallback } from 'react';
import { FormState } from '../types/ui';

export const useFormState = <T extends Record<string, any>>(initialValues: T) => {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: { ...prev.errors, [field]: '' }, // Clear error when value changes
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const validateField = useCallback((field: keyof T, validator: (value: any) => string | null) => {
    const error = validator(state.values[field]);
    if (error) {
      setError(field, error);
      return false;
    }
    return true;
  }, [state.values, setError]);

  const validateForm = useCallback((validators: Partial<Record<keyof T, (value: any) => string | null>>) => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.entries(validators).forEach(([field, validator]) => {
      if (validator) {
        const error = validator(state.values[field as keyof T]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setState(prev => ({ ...prev, errors: newErrors }));
    return isValid;
  }, [state.values]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  return {
    ...state,
    setValue,
    setError,
    setTouched,
    setSubmitting,
    validateField,
    validateForm,
    reset,
  };
};