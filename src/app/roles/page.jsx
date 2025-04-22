"use client";
import { useX } from '@/hooks/useX/useX';
import { useState } from 'react';

export default function RolesView() {
  const {
    data: roles,
    loading,
    error,
    createData,
    updateData,
    deleteData
  } = useX('api/roles');

  const [newRole, setNewRole] = useState('');

  const handleCreate = async () => {
    if (!newRole) return;
    await createData({ name: newRole });
    setNewRole('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gestión de Roles</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Nuevo rol"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button onClick={handleCreate}>Agregar</button>
      </div>

      {loading && <p>Cargando roles...</p>}
      {error && <p>Error: {error}</p>}

      <ul>
        {roles.map((role, index) => (
          <li key={index}>
            {role.nameRole}
            <button onClick={() => deleteData(role.roleId)} style={{ marginLeft: 10 }}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}
