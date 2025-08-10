import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function crearNotificacion({ userId, email, tipo, mensaje }) {
  try {
    await addDoc(collection(db, "notificaciones"), {
      userId,
      email,
      tipo, // Ejemplo: "Me gusta", "Solicitud de amistad"
      mensaje,
      timestamp: serverTimestamp(),
      leida: false,
    });
  } catch (error) {
    console.error("Error creando notificación:", error);
  }
}
