import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Tu configuración Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditarIntereses() {
  const [intereses, setIntereses] = useState([]);
  const [nuevoInteres, setNuevoInteres] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usuario) => {
      setUser(usuario);
      setLoading(false);
      if (usuario) {
        cargarIntereses(usuario.uid);
      } else {
        setIntereses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const cargarIntereses = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIntereses(data.intereses || []);
      } else {
        setIntereses([]);
      }
    } catch (error) {
      console.error("Error al cargar intereses:", error.message);
    }
  };

  const agregarInteres = () => {
    const interesTrim = nuevoInteres.trim();
    if (interesTrim && !intereses.includes(interesTrim)) {
      setIntereses([...intereses, interesTrim]);
      setNuevoInteres("");
    }
  };

  const eliminarInteres = (interes) => {
    setIntereses(intereses.filter((i) => i !== interes));
  };

  const guardarIntereses = async () => {
    if (!user) {
      alert("No hay usuario autenticado.");
      return;
    }
    setGuardando(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { intereses }, { merge: true });
      alert("Intereses guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar intereses:", error.message);
      alert("Error al guardar intereses. Revisa la consola.");
    }
    setGuardando(false);
  };

  if (loading) return <p>Cargando usuario...</p>;

  if (!user) return <p>Por favor, inicia sesión para editar tus intereses.</p>;

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h3>Editar intereses</h3>

      {intereses.length === 0 && <p>No tienes intereses agregados.</p>}

      <ul className="list-group mb-3">
        {intereses.map((interes, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {interes}
            <button
              className="btn btn-sm btn-danger"
              onClick={() => eliminarInteres(interes)}
            >
              X
            </button>
          </li>
        ))}
      </ul>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Agregar interés"
          value={nuevoInteres}
          onChange={(e) => setNuevoInteres(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") agregarInteres();
          }}
        />
        <button
          className="btn btn-primary"
          onClick={agregarInteres}
          disabled={!nuevoInteres.trim() || intereses.includes(nuevoInteres.trim())}
        >
          Agregar
        </button>
      </div>

      <button
        className="btn btn-success w-100"
        onClick={guardarIntereses}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar intereses"}
      </button>
    </div>
  );
}
