// src/components/Usuarios.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [siguiendo, setSiguiendo] = useState([]);
  const [loading, setLoading] = useState(true);
  const uidActual = auth.currentUser?.uid;

  useEffect(() => {
    if (!uidActual) return;

    const cargarUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const lista = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.id !== uidActual);
        setUsuarios(lista);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    const cargarSiguiendo = async () => {
      try {
        const docRef = doc(db, "seguidores", uidActual);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const datos = docSnap.data();
          setSiguiendo(datos.sigueA || []);
        } else {
          setSiguiendo([]);
        }
      } catch (error) {
        console.error("Error al cargar siguiendo:", error);
      }
    };

    cargarUsuarios();
    cargarSiguiendo();
    setLoading(false);
  }, [uidActual]);

  const enviarSolicitudAmistad = async (uidReceptor) => {
    try {
      const idSolicitud = `${uidActual}_${uidReceptor}`;
      await setDoc(doc(db, "solicitudes_amistad", idSolicitud), {
        de: uidActual,
        para: uidReceptor,
        estado: "pendiente",
        fecha: new Date(),
      });
      alert("Solicitud enviada");
    } catch (error) {
      alert("Error al enviar solicitud: " + error.message);
    }
  };

  const seguirUsuario = async (uidSeguido) => {
    const docRef = doc(db, "seguidores", uidActual);
    try {
      await updateDoc(docRef, {
        sigueA: arrayUnion(uidSeguido),
      });
    } catch {
      await setDoc(docRef, {
        sigueA: [uidSeguido],
      });
    }
    setSiguiendo((prev) => [...prev, uidSeguido]);
    alert("Ahora sigues a este usuario");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-hidden="true"
        ></div>
        <span className="ms-2">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">Usuarios Disponibles</h2>
      {usuarios.length === 0 ? (
        <p className="text-muted fst-italic">No hay usuarios disponibles.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {usuarios.map((user) => (
            <div key={user.id} className="col">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title">{user.nombre || "Usuario sin nombre"}</h5>
                    {user.biografia && (
                      <p className="card-text text-truncate">{user.biografia}</p>
                    )}
                  </div>

                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => enviarSolicitudAmistad(user.id)}
                    >
                      Enviar solicitud
                    </button>

                    {!siguiendo.includes(user.id) ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => seguirUsuario(user.id)}
                      >
                        Seguir
                      </button>
                    ) : (
                      <span className="badge bg-success align-self-center">
                        ✓ Siguiendo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
