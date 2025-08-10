import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import PostForm from './PostForm';
import PostList from './PostList';

export  function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Escucha el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login'); // Redirige a login si no hay usuario
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const cerrarSesion = async () => {
    await auth.signOut();
    navigate('/Login');
  };

  if (!currentUser) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Bienvenido, {currentUser.email}</h2>

      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-primary" onClick={() => navigate('/perfil')}>
          Ir a Perfil
        </button>

        <button className="btn btn-secondary" onClick={() => navigate('/ListaUsuarios')}>
          Lista de Usuarios
        </button>

        <button className="btn btn-info" onClick={() => navigate('/usuarios')}>
          Ver Usuarios
        </button>

        <button className="btn btn-warning" onClick={() => navigate('/solicitudes')}>
          Solicitudes de Amistad
        </button>


        <button className="btn btn-warning" onClick={() => navigate('/Amistades')}>
           Amistades
        </button>

        <button className="btn btn-warning" onClick={() => navigate('/Recomendaciones')}>
           Recomendaciones
        </button>

          <button className="btn btn-warning" onClick={() => navigate('/Buscar')}>
           Buscar
        </button>
        <button className="btn btn-warning" onClick={() => navigate('/EditarIntereses')}>
           Editar Intereses
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/ConfiguracionPrivacidad')}>
           Configuracion y privacidad
        </button>

        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </div>

      <hr />

      {/* Formulario para crear nuevas publicaciones */}
      <PostForm currentUser={currentUser} />

      <hr />

      {/* Lista de publicaciones */}
      <PostList currentUser={currentUser} />
    </div>
  );
}
