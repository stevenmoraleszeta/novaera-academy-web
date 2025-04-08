import React, { useState } from 'react';

export default Filter = ({ filterOptions = [], onFilterChange }) => {
    const [selectedFilters, setSelectedFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilterChange = (filterKey, value) => {
        const updatedFilters = { ...selectedFilters, [filterKey]: value };
        setSelectedFilters(updatedFilters);
        onFilterChange({ ...updatedFilters, searchTerm });
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        onFilterChange({ ...selectedFilters, searchTerm: value });
    };

    return (
        <div className="filterContainer">
            {/* Searchbar if needed*/}
            <div className="searchBar">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="searchInput"
                />
            </div>

            {/* Filters options*/}
            <div className="filterOptions">
                {filterOptions.map((filter) => (
                    <div key={filter.key} className="filterGroup">
                        <label>{filter.label}</label>
                        <select
                            value={selectedFilters[filter.key] || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            className="filterSelect"
                        >
                            <option value="">Todos</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};