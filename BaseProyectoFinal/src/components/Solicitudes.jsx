import { useEffect, useState, useCallback } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export function Solicitudes() {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const uidActual = auth.currentUser?.uid;

  useEffect(() => {
    if (!uidActual) return;

    // Cargar todos los usuarios excepto el actual
    const obtenerUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "usuarios"));
        const lista = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.id !== uidActual);
        setUsuarios(lista);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    // Cargar solicitudes recibidas pendientes
    const obtenerSolicitudesRecibidas = async () => {
      try {
        const q = query(
          collection(db, "solicitudes_amistad"),
          where("para", "==", uidActual),
          where("estado", "==", "pendiente")
        );
        const snapshot = await getDocs(q);
        setSolicitudesRecibidas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      }
    };

    obtenerUsuarios();
    obtenerSolicitudesRecibidas();
  }, [uidActual]);

  // Función para cargar amigos, extraída para poder reutilizar
  const obtenerAmigos = useCallback(async () => {
    if (!uidActual) return;
    try {
      const q1 = query(
        collection(db, "solicitudes_amistad"),
        where("estado", "==", "aceptada"),
        where("para", "==", uidActual)
      );
      const q2 = query(
        collection(db, "solicitudes_amistad"),
        where("estado", "==", "aceptada"),
        where("de", "==", uidActual)
      );

      const [res1, res2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const amigosIds = [
        ...res1.docs.map((doc) => doc.data().de),
        ...res2.docs.map((doc) => doc.data().para),
      ];

      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      const listaAmigos = usuariosSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => amigosIds.includes(u.id));
      setAmigos(listaAmigos);
    } catch (error) {
      console.error("Error cargando amigos:", error);
    }
  }, [uidActual]);

  // Cargar amigos la primera vez y cuando uidActual cambie
  useEffect(() => {
    obtenerAmigos();
  }, [uidActual, obtenerAmigos]);

  const enviarSolicitud = async (uidReceptor) => {
    try {
      await addDoc(collection(db, "solicitudes_amistad"), {
        de: uidActual,
        para: uidReceptor,
        estado: "pendiente",
        fecha: new Date(),
      });
      alert("Solicitud enviada");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("No se pudo enviar la solicitud");
    }
  };

  const aceptarSolicitud = async (idSolicitud) => {
    try {
      await updateDoc(doc(db, "solicitudes_amistad", idSolicitud), {
        estado: "aceptada",
      });
      alert("Solicitud aceptada");
      setSolicitudesRecibidas((prev) =>
        prev.filter((sol) => sol.id !== idSolicitud)
      );
      obtenerAmigos(); // Actualizar lista de amigos al aceptar solicitud
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      alert("No se pudo aceptar la solicitud");
    }
  };

  const rechazarSolicitud = async (idSolicitud) => {
    try {
      await updateDoc(doc(db, "solicitudes_amistad", idSolicitud), {
        estado: "rechazada",
      });
      alert("Solicitud rechazada");
      setSolicitudesRecibidas((prev) =>
        prev.filter((sol) => sol.id !== idSolicitud)
      );
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      alert("No se pudo rechazar la solicitud");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Enviar Solicitud de Amistad</h2>
      <ul>
        {usuarios.length === 0 && <p>No hay usuarios para enviar solicitudes.</p>}
        {usuarios.map((user) => (
          <li key={user.id}>
            {user.nombre || "Usuario sin nombre"}{" "}
            <button onClick={() => enviarSolicitud(user.id)}>
              Enviar solicitud
            </button>
          </li>
        ))}
      </ul>

      <h2>Solicitudes Recibidas</h2>
      <ul>
        {solicitudesRecibidas.length === 0 && <p>No hay solicitudes pendientes.</p>}
        {solicitudesRecibidas.map((sol) => {
          const usuarioEmisor = usuarios.find((u) => u.id === sol.de);
          return (
            <li key={sol.id}>
              Solicitud de: {usuarioEmisor ? usuarioEmisor.nombre : sol.de}{" "}
              <button onClick={() => aceptarSolicitud(sol.id)}>Aceptar</button>{" "}
              <button onClick={() => rechazarSolicitud(sol.id)}>Rechazar</button>
            </li>
          );
        })}
      </ul>

      <h2>Amigos</h2>
      <ul>
        {amigos.length === 0 && <p>Aún no tienes amigos.</p>}
        {amigos.map((amigo) => (
          <li key={amigo.id}>{amigo.nombre || amigo.id}</li>
        ))}
      </ul>
    </div>
  );
}
