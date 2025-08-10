/**
 * Servicio de usuarios para operaciones administrativas.
 * Todas las operaciones son simuladas en memoria.
 */
const users = [
  { id: 1, name: 'Alice', status: 'active' },
  { id: 2, name: 'Bob', status: 'suspended' },
  { id: 3, name: 'Charlie', status: 'active' },
];

/**
 * Obtiene todos los usuarios registrados.
 * @returns {Promise<Array<{id:number,name:string,status:string}>>}
 */
export async function getUsers() {
  return Promise.resolve([...users]);
}

/**
 * Alterna el estado de un usuario entre activo y suspendido.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<{id:number,name:string,status:string}>}
 */
export async function toggleUserStatus(id) {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('Usuario no encontrado');
  user.status = user.status === 'active' ? 'suspended' : 'active';
  return Promise.resolve({ ...user });
}

/**
 * Elimina un usuario por su identificador.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users.splice(index, 1);
  }
  return Promise.resolve();
}
