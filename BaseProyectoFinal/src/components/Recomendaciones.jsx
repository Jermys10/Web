import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export default function Recomendaciones() {
  const [usuarios, setUsuarios] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [intereses, setIntereses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cargarRecomendaciones = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setUsuarios([]);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const interesesUsuario = userData.intereses || [];
        setIntereses(interesesUsuario);

        const biografiaUsuario = userData.biografia || "";
        const palabrasClave = biografiaUsuario
          .toLowerCase()
          .split(/\W+/)
          .filter((palabra) => palabra.length > 3);

        const usuariosSnap = await getDocs(collection(db, "users"));
        let usuariosRaw = usuariosSnap.docs
          .filter((doc) => doc.id !== user.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        const usuariosConPuntaje = usuariosRaw.map((u) => {
          const interesesUser = u.intereses || [];
          const coincidenciasIntereses = interesesUsuario.filter((i) =>
            interesesUser.includes(i)
          ).length;

          const bio = (u.biografia || "").toLowerCase();
          const coincidenciasBio = palabrasClave.filter((pal) =>
            bio.includes(pal)
          ).length;

          const puntaje = coincidenciasIntereses * 2 + coincidenciasBio;

          return { ...u, puntaje, coincidenciasIntereses, coincidenciasBio };
        });

        const usuariosRecomendados = usuariosConPuntaje
          .filter((u) => u.puntaje > 0)
          .sort((a, b) => b.puntaje - a.puntaje);

        let publicacionesRecomendadas = [];
        if (interesesUsuario.length > 0) {
          const publicacionesQuery = query(
            collection(db, "posts"),
            where("text", ">=", interesesUsuario[0])
          );
          const publicacionesSnap = await getDocs(publicacionesQuery);
          publicacionesRecomendadas = publicacionesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }

        setUsuarios(usuariosRecomendados);
        setPublicaciones(publicacionesRecomendadas);
      } catch (error) {
        console.error("Error cargando recomendaciones:", error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarRecomendaciones();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <span className="ms-2 fs-5">Cargando recomendaciones...</span>
      </div>
    );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-gradient fw-bold" style={{ background: "linear-gradient(45deg, #6a11cb, #2575fc)", WebkitBackgroundClip: "text", color: "transparent" }}>
        Recomendaciones para ti
      </h2>

      <h5 className="mb-3">Tus intereses:</h5>
      {intereses.length > 0 ? (
        <ul className="list-inline mb-4">
          {intereses.map((i, idx) => (
            <li
              key={idx}
              className="list-inline-item badge bg-primary fs-6 me-2 mb-2"
              style={{ padding: "0.6em 1.2em", borderRadius: "50px", boxShadow: "0 4px 8px rgba(101, 115, 255, 0.4)" }}
            >
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted fst-italic">No definidos aún.</p>
      )}

      <hr className="mb-5" />

      <h4 className="mb-4 text-secondary fw-semibold">Usuarios sugeridos (ordenados por coincidencias):</h4>
      {usuarios.length === 0 ? (
        <p className="text-muted fst-italic">No hay usuarios recomendados según tus intereses y biografía.</p>
      ) : (
        <div className="row g-4">
          {usuarios.map((u) => (
            <div key={u.id} className="col-sm-12 col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 h-100 hover-shadow">
                <div className="card-body d-flex align-items-center gap-3">
                  {u.fotoURL ? (
                    <img
                      src={u.fotoURL}
                      alt="Perfil"
                      className="rounded-circle"
                      style={{ width: 90, height: 90, objectFit: "cover", boxShadow: "0 0 10px rgba(37,117,252,0.3)" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white"
                      style={{ width: 90, height: 90, fontSize: 28, boxShadow: "0 0 10px rgba(101,115,255,0.2)" }}
                    >
                      {u.nombre ? u.nombre.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}

                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1 fw-bold text-primary">{u.nombre}</h5>
                    <p className="text-muted mb-1">{u.ubicacion || "Ubicación no especificada"}</p>
                    <p className="fst-italic mb-2 text-truncate" style={{ maxHeight: "3em", overflow: "hidden" }}>
                      {u.biografia || "Sin biografía"}
                    </p>
                    <small className="text-info">
                      <i className="bi bi-heart-fill me-1"></i>
                      Intereses en común: {u.coincidenciasIntereses} |{" "}
                      <i className="bi bi-bookmark-star-fill me-1"></i>
                      Coincidencias en biografía: {u.coincidenciasBio}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-5" />

      <h4 className="mb-4 text-secondary fw-semibold">Publicaciones sugeridas:</h4>
      {publicaciones.length === 0 ? (
        <p className="text-muted fst-italic">No hay publicaciones recomendadas.</p>
      ) : (
        publicaciones.map((p) => (
          <div key={p.id} className="card mb-4 rounded-4 shadow-sm border-0">
            <div className="card-body">
              <p className="card-text fs-5">{p.text}</p>
              {p.mediaUrl && (
                <img
                  src={p.mediaUrl}
                  alt="Imagen"
                  className="img-fluid rounded mt-3"
                  style={{ maxHeight: 320, objectFit: "cover" }}
                />
              )}
              <small className="text-muted d-block mt-2">
                {p.createdAt?.toDate().toLocaleString() || "Fecha desconocida"}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

