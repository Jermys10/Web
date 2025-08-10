import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function CrearPublicacion({ usuario }) {
  const [texto, setTexto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [link, setLink] = useState("");
  const [privacidad, setPrivacidad] = useState("publica");

  const handleCrear = async () => {
    let mediaURL = null;
    let mediaTipo = null;

    if (archivo) {
      const ruta = `publicaciones/${usuario.uid}/${archivo.name}`;
      const storageRef = ref(storage, ruta);
      await uploadBytes(storageRef, archivo);
      mediaURL = await getDownloadURL(storageRef);
      mediaTipo = archivo.type.startsWith("video") ? "video" : "imagen";
    }

    await addDoc(collection(db, "publicaciones"), {
      autorId: usuario.uid,
      texto,
      mediaURL,
      mediaTipo,
      link: link || null,
      privacidad,
      fecha: Timestamp.now()
    });

    setTexto("");
    setArchivo(null);
    setLink("");
  };

  return (
    <div>
      <textarea
        placeholder="¿Qué quieres compartir?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
      <input
        type="text"
        placeholder="Enlace opcional"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <select value={privacidad} onChange={(e) => setPrivacidad(e.target.value)}>
        <option value="publica">Pública</option>
        <option value="privada">Solo amigos</option>
      </select>
      <button onClick={handleCrear}>Publicar</button>
    </div>
  );
}

