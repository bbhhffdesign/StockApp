const logProductosFaltantes = (productosPorDistribuidor = {}, nombresDistribuidores = {}) => {
  let mensaje = "";

  Object.keys(productosPorDistribuidor).forEach((distribuidorId) => {
    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter((producto) => producto.cantActual < producto.cantDeseada)
      .map((producto) => `- ${producto.nombre} ${producto.cantDeseada - producto.cantActual}`);

    if (productosFaltantes.length > 0) {
      mensaje += `${nombresDistribuidores[distribuidorId]?.nombre || distribuidorId}:\n`;
      mensaje += productosFaltantes.join("\n") + "\n-------------------\n";
    }
  });

  if (mensaje) {
    navigator.clipboard.writeText(mensaje)
      .then(() => console.log("📋 Copiado al portapapeles:\n" + mensaje))
      .catch((err) => console.error("Error al copiar: ", err));
  } else {
    console.log("No hay productos con faltante.");
  }
};

export default logProductosFaltantes;