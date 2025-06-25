"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './CrudMenu.module.css';

const SearchBar = ({ onSearch, onAdd }) => {

    const [searchTerm, setSearchTerm] = useState('');
    
    const debounceTimeoutRef = useRef(null);
    useEffect(() => {
        return () => {
            clearTimeout(debounceTimeoutRef.current);
        };
    }, []); 

    const handleInputChange = (e) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            onSearch(newTerm);
        }, 500); 
    };

    return (
        <section className={styles.topBar}>
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleInputChange}
            />
            <button onClick={onAdd}>Agregar</button>
        </section>
    );
};

export default SearchBar;