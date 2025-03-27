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

  // Establecer siempre la sección a "distribuidores" cuando el usuario se loguee
  useEffect(() => {
    if (user) {
      setSeccion("distribuidores");
    }
  }, [user]);

  useLayoutEffect(() => {
    if (!user) return; // Si no hay usuario, no ejecuta la animación

    // Configurar las secciones al inicio
    gsap.set(distribuidoresRef.current, { xPercent: 0, opacity: 1, zIndex: 2 });
    gsap.set(productosRef.current, { xPercent: 100, opacity: 0, zIndex: 1 });
  }, [user]); // Se ejecuta cuando el usuario cambia

  useLayoutEffect(() => {
    // Evitar ejecutar la animación si la sección no cambia
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

    // Animación de la nueva sección
    gsap.fromTo(
      nuevaSeccion,
      { xPercent: direction, opacity: 0, zIndex: 2 },
      { xPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Animación de la sección anterior
    gsap.to(seccionAnterior, { xPercent: direction * -1, opacity: 0, zIndex: 1, duration: 0.8 });

    prevSeccion.current = seccion; // Actualizamos la referencia de la sección actual
  }, [seccion]); // Esta lógica se ejecuta cada vez que se cambia la sección

  // Gestos touch para cambiar de sección
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndRef.current = e.changedTouches[0].clientX;

    if (touchStartRef.current - touchEndRef.current > 50) {
      // Deslizar de derecha a izquierda
      if (seccion !== "productos") {
        setSeccion("productos");
      }
    } else if (touchEndRef.current - touchStartRef.current > 50) {
      // Deslizar de izquierda a derecha
      if (seccion !== "distribuidores") {
        setSeccion("distribuidores");
      }
    }
  };

  return (
    <div
      className={"main-container container-fluid"}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {user ? (
        <>
          <div className="btn-group btn-group-nav w-100">
            <button
              className={`btn ${seccion === "distribuidores" ? "active" : ""}`}
              onClick={() => seccion !== "distribuidores" && setSeccion("distribuidores")}
            >
              Distribuidores
            </button>
            <button
              className={`btn ${seccion === "productos" ? "active" : ""}`}
              onClick={() => seccion !== "productos" && setSeccion("productos")}
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
        <Login setUser={setUser} user={user} />
      )}
      <div className="background"></div>
    </div>
  );
}

export default App;
