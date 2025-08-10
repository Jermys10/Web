// Notificaciones.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const notificacionesRef = collection(db, "notificaciones", user.uid, "userNotifications");
    const q = query(notificacionesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotificaciones(lista);
    });

    return () => unsubscribe();
  }, [user]);

  const eliminarNotificacion = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "notificaciones", user.uid, "userNotifications", id));
  };

  return (
    <div>
      <h4>Notificaciones</h4>
      {notificaciones.length === 0 && <p>No hay notificaciones.</p>}
      <ul>
        {notificaciones.map((notif) => (
          <li key={notif.id} style={{ marginBottom: 10, borderBottom: "1px solid #ccc" }}>
            <p>{notif.text}</p>
            <small>{notif.createdAt?.toDate().toLocaleString()}</small>
            <br />
            <button onClick={() => eliminarNotificacion(notif.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
