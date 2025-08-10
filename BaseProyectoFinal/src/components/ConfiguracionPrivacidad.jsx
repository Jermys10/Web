import React, { useState, useEffect } from "react";
import {
  getAuth,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta a tu configuración

export default function ConfiguracionPrivacidad() {
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  // Estados de configuración y formularios
  const [configPrivacidad, setConfigPrivacidad] = useState({
    visibilidadPerfil: "publico",
    visibilidadPublicaciones: "publico",
    visibilidadListaAmigos: "publico",
    usuariosBloqueados: [],
  });

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [uidBloquear, setUidBloquear] = useState("");
  const [uidReportar, setUidReportar] = useState("");
  const [motivoReporte, setMotivoReporte] = useState("");

  // Cargar configuración al montar
  useEffect(() => {
    if (!usuarioActual) return;

    const cargarConfig = async () => {
      const userRef = doc(db, "users", usuarioActual.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.privacySettings) {
          setConfigPrivacidad(data.privacySettings);
        }
      }
    };

    cargarConfig();
  }, [usuarioActual]);

  // Cambiar contraseña con reautenticación
  async function cambiarContrasena() {
    if (!usuarioActual) return alert("No autenticado");
    if (!contrasenaActual || !nuevaContrasena)
      return alert("Completa ambas contraseñas");

    try {
      const cred = EmailAuthProvider.credential(
        usuarioActual.email,
        contrasenaActual
      );
      await reauthenticateWithCredential(usuarioActual, cred);
      await updatePassword(usuarioActual, nuevaContrasena);
      alert("Contraseña actualizada");
      setContrasenaActual("");
      setNuevaContrasena("");
    } catch (error) {
      alert("Error al cambiar contraseña: " + error.message);
    }
  }

  // Actualizar configuración privacidad en Firestore
  const actualizarPrivacidad = async (campo, valor) => {
    if (!usuarioActual) return;
    const nuevaConfig = { ...configPrivacidad, [campo]: valor };
    setConfigPrivacidad(nuevaConfig);
    const userRef = doc(db, "users", usuarioActual.uid);
    try {
      await updateDoc(userRef, { privacySettings: nuevaConfig });
    } catch (error) {
      alert("Error al actualizar privacidad: " + error.message);
    }
  };

  // Bloquear usuario
  const bloquearUsuario = async () => {
    if (!usuarioActual) return;
    if (!uidBloquear) return alert("Ingresa UID a bloquear");

    try {
      const userRef = doc(db, "users", usuarioActual.uid);
      await updateDoc(userRef, {
        "privacySettings.usuariosBloqueados": arrayUnion(uidBloquear),
      });
      setConfigPrivacidad((prev) => ({
        ...prev,
        usuariosBloqueados: [...prev.usuariosBloqueados, uidBloquear],
      }));
      alert(`Usuario ${uidBloquear} bloqueado`);
      setUidBloquear("");
    } catch (error) {
      alert("Error al bloquear usuario: " + error.message);
    }
  };

  // Reportar usuario
  const reportarUsuario = async () => {
    if (!usuarioActual) return;
    if (!uidReportar || !motivoReporte)
      return alert("Completa UID y motivo");

    try {
      await addDoc(collection(db, "reports"), {
        reportedBy: usuarioActual.uid,
        reportedUser: uidReportar,
        reason: motivoReporte,
        createdAt: new Date(),
        status: "pendiente",
      });
      alert("Reporte enviado");
      setUidReportar("");
      setMotivoReporte("");
    } catch (error) {
      alert("Error al reportar: " + error.message);
    }
  };

  // Eliminar cuenta con reautenticación
  const eliminarCuenta = async () => {
    if (!usuarioActual) return alert("No autenticado");
    if (!contrasenaActual)
      return alert("Ingresa contraseña para confirmar");

    try {
      const cred = EmailAuthProvider.credential(
        usuarioActual.email,
        contrasenaActual
      );
      await reauthenticateWithCredential(usuarioActual, cred);
      await deleteUser(usuarioActual);
      alert("Cuenta eliminada");
      // Redirige o limpia estado aquí
    } catch (error) {
      alert("Error al eliminar cuenta: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Configuración y Privacidad</h2>

      <section>
        <h3>Cambiar Contraseña</h3>
        <input
          type="password"
          placeholder="Contraseña actual"
          value={contrasenaActual}
          onChange={(e) => setContrasenaActual(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={cambiarContrasena}>Actualizar contraseña</button>
      </section>

      <section>
        <h3>Configuración de Privacidad</h3>

        <label>
          Visibilidad perfil:
          <select
            value={configPrivacidad.visibilidadPerfil}
            onChange={(e) =>
              actualizarPrivacidad("visibilidadPerfil", e.target.value)
            }
            style={{ width: "100%", marginBottom: 8 }}
          >
            <option value="publico">Público</option>
            <option value="amigos">Solo amigos</option>
            <option value="privado">Solo yo</option>
          </select>
        </label>

        <label>
          Visibilidad publicaciones:
          <select
            value={configPrivacidad.visibilidadPublicaciones}
            onChange={(e) =>
              actualizarPrivacidad("visibilidadPublicaciones", e.target.value)
            }
            style={{ width: "100%", marginBottom: 8 }}
          >
            <option value="publico">Público</option>
            <option value="amigos">Solo amigos</option>
            <option value="privado">Solo yo</option>
          </select>
        </label>

        <label>
          Visibilidad lista amigos:
          <select
            value={configPrivacidad.visibilidadListaAmigos}
            onChange={(e) =>
              actualizarPrivacidad("visibilidadListaAmigos", e.target.value)
            }
            style={{ width: "100%", marginBottom: 8 }}
          >
            <option value="publico">Público</option>
            <option value="amigos">Solo amigos</option>
            <option value="privado">Solo yo</option>
          </select>
        </label>

        <div>
          <p>Usuarios bloqueados:</p>
          <ul>
            {configPrivacidad.usuariosBloqueados.length === 0 && (
              <li>No tienes usuarios bloqueados</li>
            )}
            {configPrivacidad.usuariosBloqueados.map((uid) => (
              <li key={uid}>{uid}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3>Bloquear Usuario</h3>
        <input
          type="text"
          placeholder="UID usuario a bloquear"
          value={uidBloquear}
          onChange={(e) => setUidBloquear(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={bloquearUsuario}>Bloquear usuario</button>
      </section>

      <section>
        <h3>Reportar Usuario</h3>
        <input
          type="text"
          placeholder="UID usuario a reportar"
          value={uidReportar}
          onChange={(e) => setUidReportar(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <textarea
          placeholder="Motivo del reporte"
          value={motivoReporte}
          onChange={(e) => setMotivoReporte(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={reportarUsuario}>Enviar reporte</button>
      </section>

      <section>
        <h3>Eliminar Cuenta</h3>
        <input
          type="password"
          placeholder="Contraseña para confirmar"
          value={contrasenaActual}
          onChange={(e) => setContrasenaActual(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button
          onClick={eliminarCuenta}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Eliminar cuenta
        </button>
      </section>
    </div>
  );
}

