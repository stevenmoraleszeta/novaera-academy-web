import React from 'react';
import styles from './CrudMenu.module.css';

const SearchBar = ({ onSearch, onAdd }) => {
    const handleSearchChange = (e) => {
        onSearch(e.target.value);
    };

    return (
        <section className={styles.topBar}>
            <input
                type="text"
                placeholder="Buscar..."
                onChange={handleSearchChange}
            />
            <button onClick={onAdd}>Agregar</button>
        </section>
    );
};

export default SearchBar;