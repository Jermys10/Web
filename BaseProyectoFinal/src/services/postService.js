/**
 * Servicio de publicaciones para operaciones administrativas.
 * Todas las operaciones son simuladas en memoria.
 */
const posts = [
  { id: 1, title: 'Primer post', status: 'active' },
  { id: 2, title: 'Segundo post', status: 'suspended' },
  { id: 3, title: 'Tercer post', status: 'active' },
];

/**
 * Obtiene todas las publicaciones disponibles.
 * @returns {Promise<Array<{id:number,title:string,status:string}>>}
 */
export async function getPosts() {
  return Promise.resolve([...posts]);
}

/**
 * Alterna el estado de una publicación entre activo y suspendido.
 * @param {number} id - Identificador de la publicación.
 * @returns {Promise<{id:number,title:string,status:string}>}
 */
export async function togglePostStatus(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error('Publicación no encontrada');
  post.status = post.status === 'active' ? 'suspended' : 'active';
  return Promise.resolve({ ...post });
}

/**
 * Elimina una publicación por su identificador.
 * @param {number} id - Identificador de la publicación.
 * @returns {Promise<void>}
 */
export async function deletePost(id) {
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts.splice(index, 1);
  }
  return Promise.resolve();
}
