import { useState, useMemo } from 'react';

export const useSearch = (data, searchConfig) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            return data; 
        }

        return data.filter(item =>
            searchConfig.some(({ field, render }) => {
                let valueToSearch = '';
                if (field && item[field] != null) {
                    valueToSearch = String(item[field]).toLowerCase();
                } else if (render) {
                    const renderedOutput = render(item);
                    if (typeof renderedOutput === 'string') {
                        valueToSearch = renderedOutput.toLowerCase();
                    }
                }
                return valueToSearch.includes(term);
            })
        );
    }, [data, searchTerm, searchConfig]); 
    
    return { filteredData, setSearchTerm };
};