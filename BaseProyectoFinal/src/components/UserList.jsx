import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export default function AmigosList({ currentUser }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Función para cargar amigos
    const loadFriends = async () => {
      try {
        // Consulta la colección 'friends' donde 'userId' es el uid actual
        const q = query(
          collection(db, "friends"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        const friendsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriends(friendsData);
      } catch (error) {
        console.error("Error cargando amigos:", error);
      }
    };

    loadFriends();
  }, [currentUser]);

  // Función para agregar un amigo (ejemplo)
  const addFriend = async () => {
    try {
      await addDoc(collection(db, "friends"), {
        userId: currentUser.uid,
        friendId: "uid_del_amigo",
        createdAt: new Date(),
      });
      alert("Amigo agregado");
    } catch (error) {
      console.error("Error agregando amigo:", error);
    }
  };

  return (
    <div>
      <h3>Lista de amigos</h3>
      <button onClick={addFriend}>Agregar amigo</button>
      {friends.length === 0 && <p>No tienes amigos agregados.</p>}
      <ul>
        {friends.map((f) => (
          <li key={f.id}>Amigo ID: {f.friendId}</li>
        ))}
      </ul>
    </div>
  );
}
