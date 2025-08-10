import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function PerfilGoogleUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);

    // Opcional: puedes subscribirte a cambios de usuario
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return <div>No hay usuario autenticado.</div>;

  return (
    <div className="container my-4" style={{ maxWidth: 650, textAlign: "center" }}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="rounded-circle"
          style={{ width: 150, height: 150, objectFit: "cover", marginBottom: 16 }}
        />
      ) : (
        <div
          className="bg-secondary rounded-circle mx-auto"
          style={{ width: 150, height: 150, marginBottom: 16 }}
          title="Sin foto de perfil"
        />
      )}
      <h2>{user.displayName || "Nombre no disponible"}</h2>
      <p>
        <strong>Email:</strong> {user.email || "Email no disponible"}
      </p>
      <p>
        <strong>UID:</strong> {user.uid}
      </p>
    </div>
  );
}
