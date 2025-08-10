// src/components/Register.jsx
import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const navigate = useNavigate();

  const registrar = async () => {
    try {
      await createUserWithEmailAndPassword(auth, correo, clave);
      navigate('/home');
    } catch (error) {
      alert('Error al registrar: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <input placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} />
      <input placeholder="Contraseña" type="password" value={clave} onChange={e => setClave(e.target.value)} />
      <button onClick={registrar}>Registrarse</button>
    </div>
  );
}
