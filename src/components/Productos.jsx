import React, { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Modal from "./Modal";
import ProductForm from "./ProductForm";
import logProductosFaltantes from "../js/productosFaltantes";

const Productos = ({ user }) => {
  const [productosPorDistribuidor, setProductosPorDistribuidor] = useState({});
  const [nombresDistribuidores, setNombresDistribuidores] = useState({});
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] =
    useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [multiplicarPorDiez, setMultiplicarPorDiez] = useState(false);

  useEffect(() => {
    if (!user) return;

    const distribuidorRef = collection(
      db,
      `stocks/${user.email}/distribuidores`
    );
    const unsubscribeDistribuidores = onSnapshot(
      distribuidorRef,
      (snapshot) => {
        const datosDistribuidores = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          datosDistribuidores[doc.id] = {
            nombre: data.nombre,
            telefono: data.telefono,
          };
        });
        setNombresDistribuidores(datosDistribuidores);
      }
    );

    // Cargar productos por distribuidor
    const unsubscribeProductos = onSnapshot(distribuidorRef, (snapshot) => {
      snapshot.docs.forEach((distribuidorDoc) => {
        const distribuidorId = distribuidorDoc.id;
        const productosRef = collection(
          db,
          `stocks/${user.email}/distribuidores/${distribuidorId}/productos`
        );

        onSnapshot(productosRef, (productosSnapshot) => {
          const productos = productosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const productosOrdenados = productos.sort(
            (a, b) =>
              (b.cantActual < b.cantDeseada) - (a.cantActual < a.cantDeseada)
          );

          setProductosPorDistribuidor((prevState) => ({
            ...prevState,
            [distribuidorId]: productosOrdenados,
          }));
        });
      });
    });

    return () => {
      unsubscribeDistribuidores();
      unsubscribeProductos();
    };
  }, [user]);

  const actualizarCantidadProducto = async (
    distribuidorId,
    productoId,
    cantidad
  ) => {
    const productoRef = doc(
      db,
      `stocks/${user.email}/distribuidores/${distribuidorId}/productos/${productoId}`
    );
    try {
      await updateDoc(productoRef, {
        cantActual: cantidad,
      });
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
    }
  };

  const handleEliminarProducto = async (distribuidorId, productoId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      await deleteDoc(
        doc(
          db,
          `stocks/${user.email}/distribuidores/${distribuidorId}/productos/${productoId}`
        )
      );

      // Actualizar el estado para eliminar el producto de la UI
      setProductosPorDistribuidor((prevState) => {
        const nuevosProductos = { ...prevState };
        nuevosProductos[distribuidorId] = nuevosProductos[
          distribuidorId
        ].filter((p) => p.id !== productoId);
        return nuevosProductos;
      });
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const enviarMensajeWhatsApp = (
    distribuidorId,
    productosPorDistribuidor,
    nombresDistribuidores
  ) => {
    const distribuidorNombre =
      nombresDistribuidores[distribuidorId] || "Distribuidor";
    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter((producto) => producto.cantActual < producto.cantDeseada)
      .map(
        (producto) =>
          `- ${producto.nombre} ${producto.cantDeseada - producto.cantActual}`
      )
      .join("\n");

    if (!productosFaltantes) {
      alert("No hay productos faltantes para este distribuidor.");
      return;
    }

    const mensaje = `${productosFaltantes}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="section section-productos">
      <button
        className="btn btn-warning mb-3"
        onClick={() => setModoEdicion(!modoEdicion)}
      >
        {modoEdicion ? "Salir del modo edición" : "Modo edición"}
      </button>
      <button
        className="btn btn-info mb-3"
        onClick={() =>
          logProductosFaltantes(productosPorDistribuidor, nombresDistribuidores)
        }
      >
        Copiar productos faltantes 📋
      </button>

      {Object.keys(productosPorDistribuidor).length > 0 ? (
        Object.keys(productosPorDistribuidor).map((distribuidorId) => (
          <div key={distribuidorId} className="mb-4">
            <table className="table table-bordered">
              <thead>
                <tr className="table-primary">
                  <th colSpan={modoEdicion ? 4 : 3} className="text-center">
                    {nombresDistribuidores[distribuidorId]?.nombre ||
                      "Cargando..."}
                    <button
                      className="btn btn-success btn-sm ms-2"
                      onClick={() =>
                        enviarMensajeWhatsApp(
                          distribuidorId,
                          productosPorDistribuidor,
                          nombresDistribuidores
                        )
                      }
                    >
                      WPP
                    </button>
                  </th>
                </tr>
                <tr className="table-light">
                  <th>Nombre</th>
                  <th>Cant. Actual</th>
                  <th>Cant. Deseada</th>
                  {modoEdicion && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productosPorDistribuidor[distribuidorId].map((producto) => {
                  const faltante = producto.cantActual < producto.cantDeseada;
                  return (
                    <React.Fragment key={producto.id}>
                      <tr
                        style={{
                          backgroundColor: faltante ? "#ffcccc" : "#ccffcc",
                        }}
                        onClick={() => {
                          if (modoEdicion) {
                            setProductoSeleccionado(producto);
                            setDistribuidorSeleccionado(distribuidorId);
                            setMostrarModalProducto(true);
                          } else {
                            setFilaExpandida(
                              filaExpandida === producto.id ? null : producto.id
                            );
                          }
                        }}
                      >
                        <td>{producto.nombre}</td>
                        <td>{producto.cantActual}</td>
                        <td>{producto.cantDeseada}</td>
                        {modoEdicion && (
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarProducto(
                                  distribuidorId,
                                  producto.id
                                );
                              }}
                            >
                              ×
                            </button>
                          </td>
                        )}
                      </tr>
                      {filaExpandida === producto.id && !modoEdicion && (
                        <tr>
                          <td colSpan="3" className="text-center">
                            <button
                              className="btn btn-outline-secondary me-2"
                              onClick={() =>
                                actualizarCantidadProducto(
                                  distribuidorId,
                                  producto.id,
                                  producto.cantActual -
                                    (multiplicarPorDiez ? 10 : 1)
                                )
                              }
                            >
                              -{multiplicarPorDiez ? "10" : "1"}
                            </button>
                            <button
                              className="btn btn-outline-secondary me-2"
                              onClick={() =>
                                actualizarCantidadProducto(
                                  distribuidorId,
                                  producto.id,
                                  producto.cantActual +
                                    (multiplicarPorDiez ? 10 : 1)
                                )
                              }
                            >
                              +{multiplicarPorDiez ? "10" : "1"}
                            </button>
                            <button
                              className={`btn ${
                                multiplicarPorDiez
                                  ? "btn-warning"
                                  : "btn-outline-warning"
                              }`}
                              onClick={() =>
                                setMultiplicarPorDiez(!multiplicarPorDiez)
                              }
                            >
                              ×10
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No hay productos disponibles.</p>
      )}

      <Modal
        isOpen={mostrarModalProducto}
        onClose={() => setMostrarModalProducto(false)}
      >
        <ProductForm
          user={user}
          distribuidor={distribuidorSeleccionado}
          producto={productoSeleccionado}
          onProductoAgregado={() => setMostrarModalProducto(false)}
        />
      </Modal>
    </div>
  );
};

export default Productos;
