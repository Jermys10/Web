// src/components/Login.jsx
import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const navigate = useNavigate();

  const iniciarSesion = async () => {
    try {
      await signInWithEmailAndPassword(auth, correo, clave);
      navigate('/home');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const loginConGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home');
    } catch (error) {
      alert('Google Error: ' + error.message);
    }
  };

  const recuperarClave = async () => {
    if (!correo) return alert('Ingresa tu correo primero.');
    try {
      await sendPasswordResetEmail(auth, correo);
      alert('Correo de recuperación enviado');
    } catch (e) {
      alert('Error al enviar: ' + e.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Iniciar Sesión</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Contraseña"
          value={clave}
          onChange={e => setClave(e.target.value)}
        />
      </div>
      <button className="btn btn-primary w-100 mb-3" onClick={iniciarSesion}>
        Entrar
      </button>
      <button className="btn btn-danger w-100 mb-3" onClick={loginConGoogle}>
        Entrar con Google
      </button>
      <p className="text-center">
        ¿No tienes cuenta?{' '}
        <a href="/registro" className="text-decoration-none">
          Regístrate aquí
        </a>
      </p>
      <hr />
      <button className="btn btn-link d-block mx-auto" onClick={recuperarClave}>
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
}
