import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // ejemplo contexto de usuario
import { CrearPublicacion } from "./CrearPublicacion";
import { ListaPublicaciones } from "./ListaPublicaciones";

export function Publicaciones() {
  const { usuario } = useContext(AuthContext);

  return (
    <div>
      {usuario ? <CrearPublicacion usuario={usuario} /> : <p>Inicia sesión para publicar</p>}
      <ListaPublicaciones usuario={usuario} />
    </div>
  );
}
