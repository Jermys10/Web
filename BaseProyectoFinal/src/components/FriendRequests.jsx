import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function FriendRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    async function loadRequests() {
      const q = query(
        collection(db, "friend_requests"),
        where("toUserId", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    loadRequests();
  }, [currentUser]);

  async function acceptRequest(request) {
    // Actualizar solicitud
    const requestRef = doc(db, "friend_requests", request.id);
    await updateDoc(requestRef, { status: "accepted" });

    // Agregar en amigos ambas direcciones
    await addDoc(collection(db, "friends"), {
      userId: request.fromUserId,
      friendId: request.toUserId,
      createdAt: new Date(),
    });
    await addDoc(collection(db, "friends"), {
      userId: request.toUserId,
      friendId: request.fromUserId,
      createdAt: new Date(),
    });

    setRequests(requests.filter(r => r.id !== request.id));
  }

  return (
    <div>
      <h3>Solicitudes de Amistad</h3>
      {requests.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} style={{ border: "1px solid #ccc", margin: 5, padding: 5 }}>
            <p>Usuario: {r.fromUserId}</p>
            <button onClick={() => acceptRequest(r)}>Aceptar</button>
          </div>
        ))
      )}
    </div>
  );
}
