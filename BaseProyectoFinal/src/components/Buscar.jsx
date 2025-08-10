import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Buscar() {
  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;

    const usersQuery = query(
      collection(db, "users"),
      where("nombre", ">=", busqueda),
    );

    const emailQuery = query(
      collection(db, "users"),
      where("email", "==", busqueda)
    );

    const postsQuery = query(
      collection(db, "posts"),
      where("text", ">=", busqueda)
    );

    try {
      const [usuariosSnap, correoSnap, publicacionesSnap] = await Promise.all([
        getDocs(usersQuery),
        getDocs(emailQuery),
        getDocs(postsQuery),
      ]);

      const usuariosList = [
        ...usuariosSnap.docs,
        ...correoSnap.docs
      ].map((doc) => ({ id: doc.id, ...doc.data() }));

      const publicacionesList = publicacionesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsuarios(usuariosList);
      setPublicaciones(publicacionesList);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Búsqueda</h3>
      <input
        className="form-control mb-2"
        placeholder="Buscar por nombre, correo o palabra clave..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button className="btn btn-primary mb-3" onClick={handleBuscar}>
        Buscar
      </button>

      <h5>Usuarios encontrados:</h5>
      {usuarios.length === 0 ? <p>No hay usuarios.</p> :
        usuarios.map((u) => (
          <div key={u.id} className="border p-2 mb-2">
            <p><strong>{u.nombre}</strong></p>
            <p>{u.email}</p>
          </div>
        ))
      }

      <h5>Publicaciones encontradas:</h5>
      {publicaciones.length === 0 ? <p>No hay publicaciones.</p> :
        publicaciones.map((p) => (
          <div key={p.id} className="border p-2 mb-2">
            <p>{p.text}</p>
            {p.mediaUrl && <img src={p.mediaUrl} alt="img" style={{ width: "100%" }} />}
          </div>
        ))
      }
    </div>
  );
}
