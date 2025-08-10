import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PostForm({ currentUser }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim() && !file) {
      alert("Agrega texto o imagen para publicar");
      return;
    }
    if (!currentUser || !currentUser.uid) {
      alert("Usuario no autenticado");
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = "";

      if (file) {
        const storageRef = ref(storage, `posts/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        text: text.trim(),
        mediaUrl,
        privacy,
        createdAt: serverTimestamp(),
      });

      alert("Publicado con éxito");
      setText("");
      setFile(null);
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
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: 10 }}
      />
      <br />
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
