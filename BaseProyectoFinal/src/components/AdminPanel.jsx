import { useEffect, useState } from 'react';
import {
  getUsers,
  toggleUserStatus,
  deleteUser,
} from '../services/userService';
import {
  getPosts,
  togglePostStatus,
  deletePost,
} from '../services/postService';

/**
 * Panel de administración con pestañas para gestionar usuarios y publicaciones.
 * Las operaciones son simuladas y los cambios se reflejan en el estado local.
 */
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setUsers(await getUsers());
      setPosts(await getPosts());
    };
    loadData();
  }, []);

  const handleUserToggle = async (id) => {
    const updated = await toggleUserStatus(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    alert(`Usuario ${updated.status === 'active' ? 'activado' : 'suspendido'}`);
    console.info(`Usuario ${id} actualizado a ${updated.status}`);
  };

  const handleUserDelete = async (id) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    alert('Usuario eliminado');
    console.info(`Usuario ${id} eliminado`);
  };

  const handlePostToggle = async (id) => {
    const updated = await togglePostStatus(id);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    alert(
      `Publicación ${updated.status === 'active' ? 'activada' : 'suspendida'}`
    );
    console.info(`Publicación ${id} actualizada a ${updated.status}`);
  };

  const handlePostDelete = async (id) => {
    await deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    alert('Publicación eliminada');
    console.info(`Publicación ${id} eliminada`);
  };

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('posts')}
          >
            Publicaciones
          </button>
        </li>
      </ul>
      <div className="tab-content mt-3">
        {activeTab === 'users' && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.status}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        {user.status === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUserDelete(user.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'posts' && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.status}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handlePostToggle(post.id)}
                      >
                        {post.status === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePostDelete(post.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
