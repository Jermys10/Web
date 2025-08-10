import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(lista);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    cargarUsuarios();
  }, []);

  return (
    <div>
      <h2>Usuarios Registrados</h2>
      {usuarios.length === 0 && <p>No hay usuarios para mostrar.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {usuarios.map((user) => (
          <div
            key={user.id}
            style={{ border: "1px solid #ccc", padding: "10px", width: "250px" }}
          >
            {user.fotoURL ? (
              <img
                src={user.fotoURL}
                alt={user.nombre || "Usuario"}
                width="100%"
                style={{ objectFit: "cover", height: "150px" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                Sin Foto
              </div>
            )}
            <h3>{user.nombre || "Sin Nombre"}</h3>
            <p>
              <strong>Biografía:</strong> {user.biografia || "No especificada"}
            </p>
            <p>
              <strong>Ubicación:</strong> {user.ubicacion || "No especificada"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

