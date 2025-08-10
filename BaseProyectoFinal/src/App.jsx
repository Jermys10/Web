import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import  PerfilUsuario  from './components/PerfilUsuario';
import { Home } from './components/Home';
import ListaUsuarios from "./components/ListaUsuarios";
import { Usuarios } from "./components/Usuarios";
import { Solicitudes } from './components/Solicitudes';
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import Amistades from './components/Amistades'; 
import Recomendaciones from "./components/Recomendaciones"; // ajusta si está en otra carpeta
import Buscar from "./components/Buscar"; 
import EditarIntereses from "./components/EditarIntereses";
import ConfiguracionPrivacidad from './components/ConfiguracionPrivacidad';


export function App() {
  const currentUser = { uid: "usuario_demo_123" };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/home" element={<Home />} />
          <Route path="/ListaUsuarios" element={<ListaUsuarios />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
         <Route path="/Amistades" element={<Amistades />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/EditarIntereses" element={<EditarIntereses />} />
            <Route path="/ConfiguracionPrivacidad" element={<ConfiguracionPrivacidad />} />

        {/* Nueva ruta con publicaciones */}
        <Route
          path="/publicaciones"
          element={
            <>
              <PostForm currentUser={currentUser} />
              <PostList currentUser={currentUser} />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
