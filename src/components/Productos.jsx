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
  

  const enviarMensajeWhatsApp = (distribuidorId, productosPorDistribuidor, nombresDistribuidores) => {
    const distribuidor = nombresDistribuidores[distribuidorId];
    if (!distribuidor) return;
  
    const { nombre, telefono } = distribuidor;
    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter((producto) => producto.cantActual < producto.cantDeseada)
      .map(
        (producto) => `- ${producto.nombre} ${producto.cantDeseada - producto.cantActual}`
      )
      .join("\n");
  
    if (!productosFaltantes) {
      alert("No hay productos faltantes para este distribuidor.");
      return;
    }
  
    const mensaje = `${productosFaltantes}`;
  
    // Si hay número de teléfono, se usa en el enlace de WhatsApp
    const telefonoFormateado = telefono ? telefono.replace(/\D/g, "") : "";
    const url = telefonoFormateado
      ? `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  
    window.open(url, "_blank");
  };

  return (
    <div className="section section-productos">
      <div className="btn-group dist-buttons d-flex mb-3">
        <button
          className={modoEdicion ? "btn btn-edit-true" : "btn"}
          onClick={() => setModoEdicion(!modoEdicion)}
        >
          Editar
        </button>
        <button
          className="btn"
          onClick={() =>
            logProductosFaltantes(
              productosPorDistribuidor,
              nombresDistribuidores
            )
          }
        >
          Copiar Lista
        </button> 
      </div>
      {Object.keys(productosPorDistribuidor).length > 0 ? (
  Object.keys(productosPorDistribuidor)
    .filter((distribuidorId) => nombresDistribuidores[distribuidorId]?.nombre) 
    .map((distribuidorId) => (
      <div key={distribuidorId} className="mb-4">
        <table className="table-products">
          <thead>
            <tr className="table-products-header-top">
              <th colSpan={modoEdicion ? 4 : 3} className="text-center list-distr-name">
                <div className="products-header">
                  <h3>{nombresDistribuidores[distribuidorId].nombre}</h3>
                  <button
                    className="btn btn-sm ms-2 btn-wpp"
                    onClick={() =>
                      enviarMensajeWhatsApp(
                        distribuidorId,
                        productosPorDistribuidor,
                        nombresDistribuidores
                      )

                    }
                  >
                    <i className="fa fa-whatsapp" aria-hidden="true"></i>
                  </button>
                </div>
              </th>
            </tr>
            <tr className={modoEdicion ? "table-products-header-large" : "table-products-header"}>
              <th><small>Nombre</small></th>
              <th><small>Actual</small></th>
              <th><small>Deseada</small></th>
              {modoEdicion && <th><i className="fa fa-times-circle-o" aria-hidden="true"></i></th>}
            </tr>
          </thead>
          <tbody>
            {productosPorDistribuidor[distribuidorId].map((producto) => {
              const faltante = producto.cantActual < producto.cantDeseada;
              return (
                <React.Fragment key={producto.id}>
                  <tr
                    className={faltante ? "producto producto-faltante" : "producto producto-suficiente"}
                    onClick={() => {
                      if (modoEdicion) {
                        setProductoSeleccionado(producto);
                        setDistribuidorSeleccionado(distribuidorId);
                        setMostrarModalProducto(true);
                      } else {
                        setFilaExpandida(filaExpandida === producto.id ? null : producto.id);
                      }
                    }}
                  >
                    <td>{producto.nombre}</td>
                    <td className={faltante ? "cant-actual-faltante" : "cant-actual"}>{producto.cantActual}</td>
                    <td className="cant-deseada">{producto.cantDeseada}</td>
                    {modoEdicion && (
                      <td>
                        <button
                          className="btn btn-sm btn-delete-product"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarProducto(distribuidorId, producto.id);
                          }}
                        >
                          <i className="fa fa-times-circle-o" aria-hidden="true"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                  {filaExpandida === producto.id && !modoEdicion && (
                    <tr className="fila-expandida">
                      <td colSpan="3" className="text-center">
                        <div className="btn-group w-100">
                          <button
                            className="btn"
                            onClick={() =>
                              actualizarCantidadProducto(
                                distribuidorId,
                                producto.id,
                                producto.cantActual - (multiplicarPorDiez ? 10 : 1)
                              )
                            }
                          >
                            -{multiplicarPorDiez ? "10" : "1"}
                          </button>
                          <button
                            className={multiplicarPorDiez ? "btn btn-multiplicar-on" : "btn btn-multiplicar"}
                            onClick={() => setMultiplicarPorDiez(!multiplicarPorDiez)}
                          >
                            ×10
                          </button>
                          <button
                            className="btn"
                            onClick={() =>
                              actualizarCantidadProducto(
                                distribuidorId,
                                producto.id,
                                producto.cantActual + (multiplicarPorDiez ? 10 : 1)
                              )
                            }
                          >
                            +{multiplicarPorDiez ? "10" : "1"}
                          </button>
                        </div>
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
