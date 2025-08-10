import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    };
    cargarUsuarios();
  }, []);

  return (
    <div>
      <h2>Usuarios</h2>
      {usuarios.map(user => (
        <div key={user.id}>
          <img src={user.fotoURL} alt={user.nombre} width="50" />
          <h3>{user.nombre}</h3>
          <p>{user.biografia}</p>
          <p>{user.ubicacion}</p>
        </div>
      ))}
    </div>
  );
}
