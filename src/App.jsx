import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.css";
// import "./css/layout.css"
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
    <div className={"main-container container-fluid"} >
      {user ? (
        <>
          
          <div className="btn-group btn-group-nav w-100">
            <button
              className={`btn ${seccion === "distribuidores" ? "active" : ""}`}
              onClick={() => setSeccion("distribuidores")}
            >
              Distribuidores
            </button>
            <button
              className={`btn ${seccion === "productos" ? "active" : ""}`}
              onClick={() => setSeccion("productos")}
            >
              Productos
            </button>
            <button className="btn btn-danger btn-danger-nav" onClick={handleLogout}>
              X
            </button>
          </div>
          
          {seccion === "distribuidores" ? <Distribuidores user={user} /> : <Productos user={user} />}
        </>
      ) : (
        <Login setUser={setUser} />
      )}
      <div className="background"></div>
      {/* <div className={`background ${user ? "bg-colorchange" : ""}` }></div> */}
    </div>
  );
}

export default App;
