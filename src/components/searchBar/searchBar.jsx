import React, { useState } from 'react';

export default SearchBar = ({ placeholder = 'Search...', onSearchChange }) => {
    const [searchValue, setSearchValue] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        onSearchChange(value); // Llamar al callback con el valor actualizado
    };

    return (
        <div className="searchBar">
            <input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleChange}
                className="searchInput"
            />
        </div>
    );
};

/* Debounce y agregar accion on enter para hacer busqueda */