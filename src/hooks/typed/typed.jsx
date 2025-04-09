import { useEffect } from 'react';
import Typed from 'typed.js';

const useTypedEffect = (elementId, options) => {
    useEffect(() => {
        const targetElement = document.getElementById(elementId);

        if (targetElement) {
            const typed = new Typed(targetElement, options);

            return () => {
                if (typed) {
                    typed.destroy();
                }
            };
        }
    }, [elementId, options]);
};

export default useTypedEffect;