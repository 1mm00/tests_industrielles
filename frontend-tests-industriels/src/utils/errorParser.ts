/**
 * Utility to parse Laravel validation errors (422)
 */

export interface LaravelValidationError {
    message: string;
    errors: Record<string, string[]>;
}

/**
 * Extracts and formats errors from an Axios error response
 * @param error Any error object from axios
 * @returns An object containing the main message and a structured map of field errors
 */
export const parseLaravelErrors = (error: any) => {
    const response = error?.response?.data;

    // Default fallback values
    const result = {
        message: response?.message || "Une erreur inattendue est survenue.",
        fieldErrors: {} as Record<string, string>,
        isValidationError: error?.response?.status === 422
    };

    // If it's a 422 validation error, extract individual field errors
    if (result.isValidationError && response?.errors) {
        Object.keys(response.errors).forEach(field => {
            // Take the first error message for each field
            if (Array.isArray(response.errors[field]) && response.errors[field].length > 0) {
                result.fieldErrors[field] = response.errors[field][0];
            } else if (typeof response.errors[field] === 'string') {
                result.fieldErrors[field] = response.errors[field];
            }
        });
    }

    return result;
};

/**
 * Helper to display a single error message for a field
 */
export const getFieldError = (fieldErrors: Record<string, string>, fieldName: string): string | null => {
    return fieldErrors[fieldName] || null;
};
