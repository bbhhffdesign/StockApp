import React, { useState } from "react";

const logProductosFaltantes = (productosPorDistribuidor = {}, nombresDistribuidores = {}) => {
  let mensaje = "Productos faltantes:\n\n";

  Object.keys(productosPorDistribuidor).forEach((distribuidorId) => {
    const distribuidor = nombresDistribuidores[distribuidorId];
    if (!distribuidor) return;

    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter((producto) => producto.cantActual < producto.cantDeseada)
      .map((producto) => `- ${producto.nombre} (${producto.cantDeseada - producto.cantActual})`)
      .join("\n");

    if (productosFaltantes) {
      mensaje += `${distribuidor.nombre}:\n${productosFaltantes}\n\n`;
    }
  });

  if (mensaje === "Productos faltantes:\n\n") {
    alert("No hay productos faltantes.");
    return;
  }

  navigator.clipboard.writeText(mensaje)
    .then(() => "")
    .catch((err) => console.error("Error al copiar", err));
};

const BotonCopiarLista = ({ productosPorDistribuidor, nombresDistribuidores }) => {
  const [botonTexto, setBotonTexto] = useState("Copiar Lista");

  const handleClick = () => {
    // Cambiar el texto a "Copiado"
    setBotonTexto("Copiado");

    // Llamar a la función de copiar la lista
    logProductosFaltantes(productosPorDistribuidor, nombresDistribuidores);

    // Volver a cambiar el texto a "Copiar Lista" después de 1 segundo
    setTimeout(() => {
      setBotonTexto("Copiar Lista");
    }, 1000);
  };

  return (
    <button className="btn" onClick={handleClick}>
      {botonTexto}
    </button>
  );
};

export default BotonCopiarLista;