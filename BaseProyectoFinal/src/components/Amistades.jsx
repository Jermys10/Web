import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export default function Amistades() {
  const currentUser = auth.currentUser;
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [amigos, setAmigos] = useState([]);

  // 1. Cargar usuarios (excluyendo el actual)
  useEffect(() => {
    if (!currentUser) return;

    const cargarUsuarios = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const otrosUsuarios = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.id !== currentUser.uid);
      setUsuarios(otrosUsuarios);
    };

    cargarUsuarios();
  }, [currentUser]);

  // 2. Escuchar solicitudes recibidas
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "friend_requests"),
      where("to", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const solicitudes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSolicitudesRecibidas(solicitudes);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Escuchar lista de amigos
  useEffect(() => {
    if (!currentUser) return;

    const friendsCol = collection(db, "friends", currentUser.uid, "list");

    const unsubscribe = onSnapshot(friendsCol, (snapshot) => {
      const amigosList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAmigos(amigosList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Enviar solicitud de amistad
  const enviarSolicitud = async (toUid) => {
    try {
      // Revisar si ya existe solicitud pendiente
      const q = query(
        collection(db, "friend_requests"),
        where("from", "==", currentUser.uid),
        where("to", "==", toUid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert("Ya enviaste solicitud a este usuario");
        return;
      }

      await addDoc(collection(db, "friend_requests"), {
        from: currentUser.uid,
        to: toUid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Solicitud enviada");
    } catch (error) {
      alert("Error al enviar solicitud: " + error.message);
    }
  };

  // Aceptar solicitud de amistad
  const aceptarSolicitud = async (solicitudId, fromUid) => {
    try {
      const solicitudRef = doc(db, "friend_requests", solicitudId);
      await updateDoc(solicitudRef, { status: "accepted" });

      // Agregar amigos bidireccionalmente
      await addDoc(collection(db, "friends", currentUser.uid, "list"), {
        friendId: fromUid,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "friends", fromUid, "list"), {
        friendId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      alert("Solicitud aceptada");
    } catch (error) {
      alert("Error al aceptar solicitud: " + error.message);
    }
  };

  // Rechazar solicitud de amistad
  const rechazarSolicitud = async (solicitudId) => {
    try {
      const solicitudRef = doc(db, "friend_requests", solicitudId);
      await updateDoc(solicitudRef, { status: "rejected" });
      alert("Solicitud rechazada");
    } catch (error) {
      alert("Error al rechazar solicitud: " + error.message);
    }
  };

  // Seguir usuario
  const seguirUsuario = async (toUid) => {
    try {
      const docRef = doc(db, "followers", toUid, currentUser.uid);
      await setDoc(docRef, {
        followedAt: serverTimestamp(),
      });
      alert("Siguiendo usuario");
    } catch (error) {
      alert("Error al seguir: " + error.message);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>
      <h2>Enviar Solicitud de Amistad</h2>
      {usuarios.length === 0 && <p>No hay usuarios disponibles</p>}
      <ul>
        {usuarios.map((user) => (
          <li key={user.id}>
            {user.nombre || user.email}{" "}
            <button
              className="btn btn-sm btn-primary"
              onClick={() => enviarSolicitud(user.id)}
            >
              Enviar Solicitud
            </button>{" "}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => seguirUsuario(user.id)}
            >
              Seguir
            </button>
          </li>
        ))}
      </ul>

      <hr />
      <h3>Solicitudes Recibidas</h3>
      {solicitudesRecibidas.length === 0 && <p>No tienes solicitudes pendientes</p>}
      <ul>
        {solicitudesRecibidas.map((sol) => (
          <li key={sol.id}>
            Usuario: {sol.from}{" "}
            <button
              className="btn btn-sm btn-success"
              onClick={() => aceptarSolicitud(sol.id, sol.from)}
            >
              Aceptar
            </button>{" "}
            <button
              className="btn btn-sm btn-danger"
              onClick={() => rechazarSolicitud(sol.id)}
            >
              Rechazar
            </button>
          </li>
        ))}
      </ul>

      <hr />
      <h3>Amigos</h3>
      {amigos.length === 0 && <p>No tienes amigos aún</p>}
      <ul>
        {amigos.map((amigo) => (
          <li key={amigo.id}>{amigo.friendId}</li>
        ))}
      </ul>
    </div>
  );
}
