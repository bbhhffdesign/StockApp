import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Distribuidores from "./components/Distribuidores";
import Productos from "./components/Productos";
import { auth } from "./js/firebaseConfig";
import { signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [seccion, setSeccion] = useState("distribuidores");

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="container mt-4">
      {user ? (
        <>
          {/* <h2>Bienvenido, {user.displayName}</h2> */}
          <button className="btn btn-danger mb-3" onClick={handleLogout}>
            Cerrar sesión
          </button>
          
          <div className="btn-group mb-3">
            <button
              className={`btn ${seccion === "distribuidores" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeccion("distribuidores")}
            >
              Distribuidores
            </button>
            <button
              className={`btn ${seccion === "productos" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeccion("productos")}
            >
              Productos
            </button>
          </div>
          
          {seccion === "distribuidores" ? <Distribuidores user={user} /> : <Productos user={user} />}
        </>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
