import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PostForm({ currentUser }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim() && !imageUrl.trim()) {
      alert("Agrega texto o URL de imagen para publicar");
      return;
    }
    if (!currentUser || !currentUser.uid) {
      alert("Usuario no autenticado");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        text: text.trim(),
        mediaUrl: imageUrl.trim(),
        privacy,
        createdAt: serverTimestamp(),
      });

      alert("Publicado con éxito");
      setText("");
      setImageUrl("");
      setPrivacy("public");
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Error al publicar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Crear publicación</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="¿Qué estás pensando?"
        rows={4}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Pega el link de la imagen aquí"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
        <option value="public">Público</option>
        <option value="private">Privado</option>
      </select>
      <br />
      <button
        onClick={handlePost}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </div>
  );
}

