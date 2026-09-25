
import { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { db } from "./db";
import Tesseract from "tesseract.js";

export default function App() {

  const [pantalla, setPantalla] = useState("nevera");

  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem("nevera");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [compra, setCompra] = useState(() => {
    const guardados = localStorage.getItem("compra");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [codigo, setCodigo] = useState("");

  const [nombre, setNombre] = useState("");

  const [cantidad, setCantidad] = useState(1);

  const [caducidad, setCaducidad] =
  useState("");

const [leyendoFecha, setLeyendoFecha] =
  useState(false);


const [mostrarModalCompra, setMostrarModalCompra] =
  useState(false);

  const [productoComprado, setProductoComprado] =
    useState(null);

  const [cantidadCompra, setCantidadCompra] =
    useState(1);

  const [caducidadCompra, setCaducidadCompra] =
    useState("");

  const [modoCompra, setModoCompra] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      "nevera",
      JSON.stringify(productos)
    );
  }, [productos]);

  useEffect(() => {
    localStorage.setItem(
      "compra",
      JSON.stringify(compra)
    );
  }, [compra]);


  useEffect(() => {

    async function cargarProductosIniciales() {

      const total =
        await db.productos.count();

      if (total === 0) {

        await db.productos.bulkAdd([
          {
            codigo: "8410188012345",
            nombre: "Cola Cao"
          },
          {
            codigo: "8410000000001",
            nombre: "Leche Entera"
          },
          {
            codigo: "8410000000002",
            nombre: "Yogur Natural"
          }
        ]);
      }
    }

    cargarProductosIniciales();

  }, []);



  function diasRestantes(fecha) {
    if (!fecha) return 999;

    const hoy = new Date();
    const cad = new Date(fecha);

    hoy.setHours(0, 0, 0, 0);
    cad.setHours(0, 0, 0, 0);

    const diferencia =
      cad.getTime() - hoy.getTime();

    return Math.ceil(
      diferencia / (1000 * 60 * 60 * 24)
    );
  }

  function obtenerEstado(fecha) {
    const dias = diasRestantes(fecha);

    if (dias < 0) {
      return {
        emoji: "☠️",
        color: "#e5e7eb"
      };
    }

    if (dias <= 2) {
      return {
        emoji: "🔴",
        color: "#f8d7da"
      };
    }

    if (dias <= 7) {
      return {
        emoji: "🟡",
        color: "#fff3cd"
      };
    }

    return {
      emoji: "🟢",
      color: "#d4edda"
    };
  }

  async function añadirProducto() {

  if (!nombre.trim()) return;

  const nuevoProducto = {
    id: Date.now(),
    codigo,
    nombre,
    cantidad: Number(cantidad),
    caducidad
  };
  setProductos([
    ...productos,
    nuevoProducto
  ]);

  if (codigo && nombre) {

    await db.productos.put({
      codigo,
      nombre
    });

  }

  // Si viene de la lista de compra
  if (
    modoCompra &&
    productoComprado
  ) {

    setCompra(
      compra.filter(
        (item) =>
          item.id !== productoComprado.id
      )
    );

    setModoCompra(false);
    setProductoComprado(null);
  }

  // Limpiar formulario
  setCodigo("");
  setNombre("");
  setCantidad(1);
  setCaducidad("");
}

async function prepararImagenOCR(archivo) {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => {

      const canvas =
        document.createElement("canvas");

      const ctx =
        canvas.getContext("2d");

      // Recorte central
      const x =
        img.width * 0.15;

      const y =
        img.height * 0.15;

      const ancho =
        img.width * 0.70;

      const alto =
        img.height * 0.70;

      canvas.width = ancho;
      canvas.height = alto;

      ctx.drawImage(
        img,
        x,
        y,
        ancho,
        alto,
        0,
        0,
        ancho,
        alto
      );

      resolve(
        canvas.toDataURL("image/png")
      );
    };

    img.src =
      URL.createObjectURL(archivo);

  });
}

function detectarFechaUniversal(texto) {

  if (!texto) return null;

  texto = texto
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .toUpperCase();

  const patrones = [

    /\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4}/g,

    /\d{4}[\/\-.]\d{2}[\/\-.]\d{2}/g,

    /\d{8}/g,

    /\d{6}/g
  ];

  for (const patron of patrones) {

    const encontrados =
      texto.match(patron);

    if (!encontrados)
      continue;

    const valor =
      encontrados[0];

    if (/^\d{8}$/.test(valor)) {

      const año =
        valor.substring(0,4);

      if (
        Number(año) > 2020 &&
        Number(año) < 2100
      ) {

        return `${año}-${valor.substring(4,6)}-${valor.substring(6,8)}`;
      }

      return `20${valor.substring(4,6)}-${valor.substring(2,4)}-${valor.substring(0,2)}`;
    }

    if (/^\d{6}$/.test(valor)) {

      return `20${valor.substring(4,6)}-${valor.substring(2,4)}-${valor.substring(0,2)}`;
    }

    const partes =
      valor.replace(/[.-]/g,"/")
           .split("/");

    if (
      partes.length === 3
    ) {

      if (
        partes[0].length === 4
      ) {

        return `${partes[0]}-${partes[1].padStart(2,"0")}-${partes[2].padStart(2,"0")}`;
      }

      let año =
        partes[2];

      if (
        año.length === 2
      ) {
        año = "20" + año;
      }

      return `${año}-${partes[1].padStart(2,"0")}-${partes[0].padStart(2,"0")}`;
    }
  }

  return null;
}
async function escanearFecha(event) {

  const archivo = event.target.files[0];

  if (!archivo) return;

  try {

    setLeyendoFecha(true);

    const resultado = await Tesseract.recognize(
      archivo,
      "eng",
      {
        tessedit_char_whitelist:
          "0123456789/-."
      }
    );

    const texto =
      resultado.data.text;

    console.log(texto);

    const match = texto.match(
      /\b\d{2}[\/.-]\d{2}[\/.-]\d{4}\b/
    );

    if (match) {

      const partes =
        match[0]
          .replace(/\./g, "/")
          .replace(/-/g, "/")
          .split("/");

      const fecha =
        `${partes[2]}-${partes[1]}-${partes[0]}`;

      setCaducidad(fecha);

      alert(
        "Fecha encontrada: " +
        fecha
      );

      return;
    }

    alert(
      "No se encontró ninguna fecha"
    );

  } catch (error) {

    console.error(error);

    alert(
      "Error leyendo la fecha"
    );

  } finally {

    setLeyendoFecha(false);

  }
}
async function generarVariantesOCR(archivo) {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = async () => {

      const variantes = [];

      const canvas =
        document.createElement("canvas");

      const ctx =
        canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(
        img,
        0,
        0
      );

      variantes.push(
        canvas.toDataURL("image/png")
      );

      const imageData =
        ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

      const data =
        imageData.data;

      for (
        let i = 0;
        i < data.length;
        i += 4
      ) {

        const gris =
          (
            data[i] +
            data[i + 1] +
            data[i + 2]
          ) / 3;

        const valor =
          gris > 140 ? 255 : 0;

        data[i] = valor;
        data[i + 1] = valor;
        data[i + 2] = valor;
      }

      ctx.putImageData(
        imageData,
        0,
        0
      );

      variantes.push(
        canvas.toDataURL("image/png")
      );

      resolve(variantes);
    };

    img.src =
      URL.createObjectURL(archivo);

  });
}

function extraerFecha(texto) {

  if (!texto) return null;

  texto = texto
    .toUpperCase()
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ");

  console.log("OCR RECIBIDO:", texto);

  const patrones = [

    /\b\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}\b/g,

    /\b\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}\b/g,

    /\b\d{8}\b/g,

    /\b\d{6}\b/g,

    /\b\d{2}\s+[A-Z]{3,9}\s+\d{2,4}\b/g,

    /\b[A-Z]{3,9}\s+\d{2}\s+\d{2,4}\b/g,

    /\b\d{2}[\/\-]\d{4}\b/g,

    /\b\d{2}[\/\-]\d{2}\b/g
  ];

  for (const patron of patrones) {

    const encontrados = texto.match(patron);

    if (!encontrados) continue;

    for (let fecha of encontrados) {

      fecha = fecha.trim();

      console.log("POSIBLE FECHA:", fecha);

      try {

        if (/^\d{8}$/.test(fecha)) {

          const año = fecha.substring(0, 4);

          if (
            Number(año) > 2020 &&
            Number(año) < 2100
          ) {
            return `${año}-${fecha.substring(4,6)}-${fecha.substring(6,8)}`;
          }

          return `20${fecha.substring(4,6)}-${fecha.substring(2,4)}-${fecha.substring(0,2)}`;
        }

        if (/^\d{6}$/.test(fecha)) {

          const dia = fecha.substring(0,2);
          const mes = fecha.substring(2,4);
          const año = "20" + fecha.substring(4,6);

          return `${año}-${mes}-${dia}`;
        }

        fecha = fecha
          .replace(/\./g, "/")
          .replace(/-/g, "/");

        const partes = fecha.split("/");

        if (partes.length === 3) {

          let dia;
          let mes;
          let año;

          if (partes[0].length === 4) {

            año = partes[0];
            mes = partes[1];
            dia = partes[2];

          } else {

            dia = partes[0];
            mes = partes[1];
            año = partes[2];

            if (año.length === 2) {
              año = "20" + año;
            }
          }

          dia = dia.padStart(2, "0");
          mes = mes.padStart(2, "0");

          return `${año}-${mes}-${dia}`;
        }

      } catch (e) {
        console.log(e);
      }
    }
  }

  return null;
}

function normalizarFecha(fecha) {

    fecha = fecha.replace(/\./g, "/");
    fecha = fecha.replace(/-/g, "/");

    return fecha;
}

async function escanearFoto(event) {

  const archivo =
    event.target.files[0];

  if (!archivo) return;

  try {

    const img = new Image();

    img.src =
      URL.createObjectURL(
        archivo
      );

    await new Promise(
      (resolve) => {
        img.onload =
          resolve;
      }
    );

    const canvas =
      document.createElement(
        "canvas"
      );

    const ctx =
      canvas.getContext("2d");

    const maxAncho = 1200;

    let ancho =
      img.width;

    let alto =
      img.height;

    if (
      ancho > maxAncho
    ) {

      const ratio =
        maxAncho /
        ancho;

      ancho =
        ancho *
        ratio;

      alto =
        alto *
        ratio;
    }

    canvas.width =
      ancho;

    canvas.height =
      alto;

    ctx.drawImage(
      img,
      0,
      0,
      ancho,
      alto
    );

    const imagen =
      document.createElement(
        "img"
      );

    imagen.src =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    await new Promise(
      (resolve) => {
        imagen.onload =
          resolve;
      }
    );

    const codeReader =
      new BrowserMultiFormatReader();

    const resultado =
      await codeReader.decodeFromImageElement(
        imagen
      );

    const codigoLeido =
      resultado.text;

    console.log(
      "CODIGO:",
      codigoLeido
    );

    setCodigo(
      codigoLeido
    );

    const producto =
      await db.productos.get(
        codigoLeido
      );

    if (producto) {

      setNombre(
        producto.nombre
      );

    } else {

      const nombreOnline =
        await buscarProductoOnline(
          codigoLeido
        );

      if (nombreOnline) {

        setNombre(
          nombreOnline
        );

      } else {

        setNombre(
          codigoLeido
        );

      }
    }

  } catch (error) {

    console.error(
      error
    );

    alert(
      "No se ha encontrado ningún código de barras"
    );
  }
}




async function rotarImagen(
  base64,
  grados
) {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => {

      const canvas =
        document.createElement("canvas");

      const ctx =
        canvas.getContext("2d");

      const rad =
        grados *
        Math.PI /
        180;

      if (
        grados === 90 ||
        grados === -90
      ) {

        canvas.width =
          img.height;

        canvas.height =
          img.width;

      } else {

        canvas.width =
          img.width;

        canvas.height =
          img.height;
      }

      ctx.translate(
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.rotate(rad);

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2
      );

      resolve(
        canvas.toDataURL(
          "image/jpeg",
          0.9
        )
      );
    };

    img.src = base64;
  });
}
async function buscarProductoOnline(codigo) {

  try {

    const respuesta = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`
    );

    const datos = await respuesta.json();

    console.log(datos);

    if (datos.status === 1) {

      return (
        datos.product.product_name_es ||
        datos.product.product_name ||
        datos.product.generic_name ||
        null
      );

    }

  } catch (error) {

    console.error(error);

  }

  return null;
}
  function consumirProducto(id) {
    const nuevosProductos = productos
      .map((p) => {
        if (p.id !== id) return p;

        const nuevaCantidad = p.cantidad - 1;

        if (nuevaCantidad <= 0) {
          const añadir = window.confirm(
            `${p.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`
          );

          if (añadir) {
            setCompra((actual) => [
              ...actual,
              {
                id: Date.now(),
                nombre: p.nombre
              }
            ]);
          }

          return null;
        }

        return {
          ...p,
          cantidad: nuevaCantidad
        };
      })
      .filter(Boolean);

    setProductos(nuevosProductos);
  }

function cambiarCantidad(id, nuevaCantidad) {

  const producto = productos.find(
    (p) => p.id === id
  );

  if (!producto) return;

  if (nuevaCantidad <= 0) {

    const añadir = window.confirm(
      `${producto.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`
    );

    if (añadir) {
      setCompra((actual) => [
        ...actual,
        {
          id: Date.now(),
          nombre: producto.nombre
        }
      ]);
    }

    setProductos(
      productos.filter(
        (p) => p.id !== id
      )
    );

    return;
  }

  setProductos(
    productos.map((p) =>
      p.id === id
        ? {
            ...p,
            cantidad: nuevaCantidad
          }
        : p
    )
  );
}
  function eliminarCompra(id) {

    const producto = compra.find(
    (item) => item.id === id
    );

    setProductoComprado(producto);
    setCantidadCompra(1);
    setCaducidadCompra("");

    setMostrarModalCompra(true);
  }

function confirmarCompra() {

  if (!caducidadCompra || !productoComprado) {
    return;
  }

  setProductos([
    ...productos,
    {
      id: Date.now(),
      nombre: productoComprado.nombre,
      cantidad: Number(cantidadCompra),
      caducidad: caducidadCompra
    }
  ]);

  setCompra(
    compra.filter(
      (item) =>
        item.id !== productoComprado.id
    )
  );

  setMostrarModalCompra(false);
  setProductoComprado(null);
  setCantidadCompra(1);
  setCaducidadCompra("");
}



  const total = productos.length;

  const ok = productos.filter(
    (p) => diasRestantes(p.caducidad) > 7
  ).length;

  const atencion = productos.filter((p) => {
    const d = diasRestantes(p.caducidad);
    return d >= 3 && d <= 7;
  }).length;

  const urgente = productos.filter((p) => {
    const d = diasRestantes(p.caducidad);
    return d >= 0 && d <= 2;
  }).length;

  const caducado = productos.filter(
    (p) => diasRestantes(p.caducidad) < 0
  ).length;

return (
  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      background: "#f5f5f5"
    }}
  >
    {/* CABECERA */}
    <div
      style={{
        background: "#4CAF50",
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        padding: "20px",
        fontSize: "32px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >
      🏠 Nevera Inteligente
    </div>

    {/* CONTENIDO */}
    <div
      style={{
        flex: 1,
        padding: "20px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
  {pantalla === "nevera" && (
          <>
            <h2>🥛 Nevera</h2>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 20
              }}
            >
              <div
                style={{
                  background: "#dbeafe",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                <b>TOTAL</b>
                <br />
                {total}
              </div>

              <div
                style={{
                  background: "#d4edda",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold",
                  
                  
                }}
              >
                🟢
                <br />
                {ok}
              </div>

              <div
                style={{
                  background: "#fff3cd",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                🟡
                <br />
                {atencion}
              </div>

              <div
                style={{
                  background: "#f8d7da",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                🔴
                <br />
                {urgente}
              </div>

              <div
                style={{
                  background: "#e5e7eb",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                ☠️
                <br />
                {caducado}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 15,
                marginBottom: 20
              }}
            >
              

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
               <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 2
  }}
>
  <input
    placeholder="Producto"
    value={nombre}
    onChange={(e) =>
      setNombre(e.target.value)
    }
    style={{
      flex: 1,
      padding: 10
    }}
  />

 <label
  style={{
    padding: "10px 15px",
    background: "#ff9800",
    color: "white",
    borderRadius: 8,
    cursor: "pointer"
  }}
>
  📦 Escanear producto

  <input
  type="file"
  accept="image/*"
  onChange={escanearFoto}
  style={{
    display: "none"
  }}
/>
</label>
</div>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  }}
>

 

  <input
    type="number"
    value={cantidad}
    onChange={(e) =>
      setCantidad(e.target.value)
    }
    style={{
      width: 100,
      padding: 10
    }}
  />

  <input
    type="date"
    value={caducidad}
    onChange={(e) =>
      setCaducidad(e.target.value)
    }
    style={{
      padding: 10
    }}
  />

  <label
    style={{
      padding: "10px 15px",
      background: "#3f51b5",
      color: "white",
      borderRadius: 8,
      cursor: "pointer"
    }}
  >
     escanear fecha 📅

    <input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={escanearFecha}
  style={{
    display: "none"
  }}
/>
  </label>

{leyendoFecha && (
  <div
    style={{
      color: "#3f51b5",
      fontWeight: "bold",
      marginTop: 5
    }}
  >
    🔍 Leyendo fecha...
  </div>
)}

</div>

<button
  onClick={añadirProducto}
  style={{
    padding: "10px 20px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 8
  }}
>
  ➕ Añadir
</button>
                </div>
            </div>

          
            <table
              width="100%"
              border="1"
              cellPadding="10"
            >
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Caducidad</th>
                  <th>Días</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => {
                  const estado = obtenerEstado(
                    p.caducidad
                  );

                  const dias = diasRestantes(
                    p.caducidad
                  );

                  return (
                    <tr
                      key={p.id}
                      style={{
                        backgroundColor:
                          estado.color
                      }}
                    >
                      <td>
                        {p.codigo || "-"}
                      </td>

                      <td>
                        {estado.emoji}{" "}
                        {p.nombre}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            cambiarCantidad(
                              p.id,
                              p.cantidad - 1
                            )
                          }
                        >
                          ➖
                        </button>

                        <span
                          style={{
                            margin: "0 12px",
                            fontWeight: "bold",
                            fontSize: 18
                          }}
                        >
                          {p.cantidad}
                        </span>

                        <button
                          onClick={() =>
                            cambiarCantidad(
                              p.id,
                              p.cantidad + 1
                            )
                          }
                        >
                          ➕
                        </button>
                      </td>

                      <td>
                        {p.caducidad}
                      </td>

                      <td>
                        {dias < 0
                          ? "Caducado"
                          : `${dias} días`}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            consumirProducto(
                              p.id
                            )
                          }
                        >
                          Consumir 1
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {pantalla === "compra" && (
          <>
            <h2>🛒 Lista de la compra</h2>

            {compra.length === 0 && (
              <p>No hay productos.</p>
            )}

            <ul>
              {compra.map((item) => (
                <li key={item.id}>
                  {item.nombre}

                  <button
                    style={{
                      marginLeft: 10
                    }}
                    onClick={() =>
                      eliminarCompra(
                        item.id
                      )
                    }
                  >
                    ✓ Comprado
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setCompra(
                        compra.filter(
                          (p) => p.id !== item.id
                        )
                      );
                    }}
                    style={{
                      marginLeft: 10,
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {pantalla === "calendario" && (
          <>
            <h2>📅 Calendario familiar</h2>

            <ul>
              <li>Cole de Joan</li>
              <li>Pediatra de Lola</li>
              <li>Cumpleaños</li>
              <li>Eventos familiares</li>
            </ul>
          </>
        )}
      </div>
{mostrarModalCompra && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 20,
        width: 450,
        maxWidth: "90%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}
    >
      <h2>🛒 Producto comprado</h2>

      <h3>{productoComprado?.nombre}</h3>

      <input
        type="number"
        min="1"
        value={cantidadCompra}
        onChange={(e) =>
          setCantidadCompra(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <input
        type="date"
        value={caducidadCompra}
        onChange={(e) =>
          setCaducidadCompra(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
          boxSizing: "border-box"
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10
        }}
      >
        <button
          onClick={confirmarCompra}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: 10
          }}
        >
          Añadir
        </button>

        <button
          onClick={() =>
            setMostrarModalCompra(false)
          }
          style={{
            padding: "12px 25px",
            borderRadius: 10
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ccc"
        }}
      >

        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("nevera")
          }
        >
          🥛 Nevera
        </button>

        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("compra")
          }
        >
          🛒 Compra
        </button>

        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("calendario")
          }
        >
          📅 Calendario
        </button>

       
      </div>
    </div>

    
  );
}