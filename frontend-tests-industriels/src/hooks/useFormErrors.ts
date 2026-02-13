import { useState, useCallback } from 'react';
import { parseLaravelErrors } from '@/utils/errorParser';
import toast from 'react-hot-toast';

export const useFormErrors = () => {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [mainError, setMainError] = useState<string | null>(null);

    const handleApiError = useCallback((error: any, customMessage?: string) => {
        const parsed = parseLaravelErrors(error);

        if (parsed.isValidationError) {
            setFieldErrors(parsed.fieldErrors);
            setMainError(parsed.message);
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
        } else {
            setFieldErrors({});
            setMainError(parsed.message);
            toast.error(customMessage || parsed.message);
        }

        return parsed;
    }, []);

    const clearErrors = useCallback(() => {
        setFieldErrors({});
        setMainError(null);
    }, []);

    const getError = useCallback((fieldName: string) => {
        return fieldErrors[fieldName] || null;
    }, [fieldErrors]);

    return {
        fieldErrors,
        mainError,
        handleApiError,
        clearErrors,
        getError,
        setFieldErrors
    };
};
