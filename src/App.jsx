import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import Login from "./components/Login";
import Distribuidores from "./components/Distribuidores";
import Productos from "./components/Productos";
import { auth } from "./js/firebaseConfig";
import { signOut } from "firebase/auth";
import gsap from "gsap";

function App() {
  const [user, setUser] = useState(null);
  const [seccion, setSeccion] = useState("distribuidores");
  const prevSeccion = useRef("distribuidores");
  const distribuidoresRef = useRef(null);
  const productosRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };


  useLayoutEffect(() => {
    gsap.set(distribuidoresRef.current, { xPercent: 0, opacity: 1, zIndex: 2 });
    gsap.set(productosRef.current, { xPercent: 100, opacity: 0, zIndex: 1 });
  }, []);

  useLayoutEffect(() => {
    if (prevSeccion.current === seccion) return;

    const nuevaSeccion = seccion === "distribuidores" ? distribuidoresRef.current : productosRef.current;
    const seccionAnterior = prevSeccion.current === "distribuidores" ? distribuidoresRef.current : productosRef.current;

    const direction = seccion === "distribuidores" ? -200 : 100;

    gsap.set([distribuidoresRef.current, productosRef.current], {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    });

    gsap.fromTo(
      nuevaSeccion,
      { xPercent: direction, opacity: 0, zIndex: 2 },
      { xPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    gsap.to(seccionAnterior, { xPercent: direction * -1, opacity: 0, zIndex: 1, duration: 0.8 });

    prevSeccion.current = seccion;
  }, [seccion]);

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
          
          <div className="seccion-contenedor">
            <div ref={distribuidoresRef} className="seccion section-distribuidores">
              <Distribuidores user={user} />
            </div>
            <div ref={productosRef} className="seccion section-productos">
              <Productos user={user} />
            </div>
          </div>
        </>
      ) : (
        <Login setUser={setUser} user={user}/>
      )}
      <div className="background"></div>
      {/* <div className={`background ${user ? "bg-colorchange" : ""}` }></div> */}
    </div>
  );
}

export default App;
