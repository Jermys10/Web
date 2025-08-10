import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function PerfilUsuario() {
  const [nombre, setNombre] = useState("");
  const [fotoURL, setFotoURL] = useState("");
  const [biografia, setBiografia] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const cargarPerfil = async () => {
      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre || "");
        setFotoURL(data.fotoURL || "");
        setBiografia(data.biografia || "");
        setUbicacion(data.ubicacion || "");
      }
    };

    cargarPerfil();
  }, [uid]);

  const guardarPerfil = async () => {
    if (!uid) return alert("Usuario no autenticado");

    const docRef = doc(db, "usuarios", uid);

    await setDoc(docRef, {
      nombre,
      fotoURL,
      biografia,
      ubicacion,
      email: auth.currentUser.email
    }, { merge: true });

    alert("Perfil guardado correctamente");
  };

  return (
    <div>
      <h2>Editar Perfil</h2>

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <input
        placeholder="URL Foto de Perfil"
        value={fotoURL}
        onChange={e => setFotoURL(e.target.value)}
      />

      <textarea
        placeholder="Biografía"
        value={biografia}
        onChange={e => setBiografia(e.target.value)}
      />

      <input
        placeholder="Ubicación"
        value={ubicacion}
        onChange={e => setUbicacion(e.target.value)}
      />

      <button onClick={guardarPerfil}>Guardar Perfil</button>
    </div>
  );
}
