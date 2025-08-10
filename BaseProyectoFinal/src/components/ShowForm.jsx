import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function PostList({ currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredPosts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post =>
          post.privacy === "public" || post.userId === currentUser.uid
        );
      setPosts(filteredPosts);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) return <p>Cargando usuario...</p>;

  return (
    <div>
      <h3>Publicaciones</h3>
      {posts.length === 0 && <p>No hay publicaciones para mostrar</p>}
      {posts.map(post => (
        <div key={post.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
          <p>{post.text}</p>
          {post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="Imagen publicación"
              style={{ maxWidth: "100%", marginTop: 8 }}
              onError={(e) => { e.target.style.display = 'none'; }} // oculta si URL inválido
            />
          )}
          <small>Privacidad: {post.privacy}</small>
        </div>
      ))}
    </div>
  );
}
