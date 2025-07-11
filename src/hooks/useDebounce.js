import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para debounce optimizado
 * @param {any} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos
 * @returns {any} Valor con debounce aplicado
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Hook para debounce de callbacks
 * @param {Function} callback - Función a debounce
 * @param {number} delay - Retraso en milisegundos
 * @param {Array} deps - Dependencias del callback
 * @returns {Function} Función con debounce aplicado
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
    const [debounceTimer, setDebounceTimer] = useState(null);

    const debouncedCallback = useCallback((...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);

        setDebounceTimer(newTimer);
    }, [callback, delay, debounceTimer, ...deps]);

    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
};
