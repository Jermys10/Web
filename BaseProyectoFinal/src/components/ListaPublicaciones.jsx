import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export function ListaPublicaciones({ usuario }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let q;
    if (usuario) {
      // Mostrar públicas + privadas del usuario
      q = query(
        collection(db, "publicaciones"),
        where("privacidad", "in", ["publica", "privada"]),
        orderBy("fecha", "desc")
      );
    } else {
      // Solo públicas si no está logueado
      q = query(
        collection(db, "publicaciones"),
        where("privacidad", "==", "publica"),
        orderBy("fecha", "desc")
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (post) =>
            post.privacidad === "publica" ||
            (post.privacidad === "privada" && post.autorId === usuario?.uid)
        );
      setPosts(docs);
    });
    return () => unsub();
  }, [usuario]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "5px" }}>
          <p>{post.texto}</p>
          {post.mediaURL && post.mediaTipo === "imagen" && (
            <img src={post.mediaURL} alt="media" width={200} />
          )}
          {post.mediaURL && post.mediaTipo === "video" && (
            <video src={post.mediaURL} controls width={300} />
          )}
          {post.link && (
            <a href={post.link} target="_blank" rel="noreferrer">
              {post.link}
            </a>
          )}
          <small>
            {post.privacidad === "publica" ? "🌍 Público" : "🔒 Solo amigos"}
          </small>
        </div>
      ))}
    </div>
  );
}

