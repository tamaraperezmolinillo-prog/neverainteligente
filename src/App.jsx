import { useState, useEffect } from "react";
import Quagga from "@ericblade/quagga2";
import { db } from "./db";

export default function App() {
const [pantalla, setPantalla] =
  useState("nevera");

const [productos, setProductos] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "nevera"
      );

      

    return guardados
      ? JSON.parse(guardados)
      : [];
  });

const [compra, setCompra] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "compra"
      );

    return guardados
      ? JSON.parse(guardados)
      : [];
  });

const [tareas, setTareas] =
  useState(() => {

    const guardadas =
      localStorage.getItem(
        "tareas"
      );

    return guardadas
      ? JSON.parse(guardadas)
      : [];
  });

  


  const [codigo, setCodigo] =
  useState("");

const [nombre, setNombre] =
  useState("");

const [cantidad, setCantidad] =
  useState(1);

const [caducidad, setCaducidad] =
  useState("");

const [mostrarCalendario,
  setMostrarCalendario] =
  useState(false);

const [mostrarModalCompra,
  setMostrarModalCompra] =
  useState(false);

const [productoComprado,
  setProductoComprado] =
  useState(null);

const [cantidadCompra,
  setCantidadCompra] =
  useState(1);

const [caducidadCompra,
  setCaducidadCompra] =
  useState("");

const [modoCompra,
  setModoCompra] =
  useState(false);

const [nuevaTarea,
  setNuevaTarea] =
  useState("");

const [ubicacion, setUbicacion] =
  useState("Nevera");

const [nuevoCompra,
  setNuevoCompra] =
  useState("");

const [cantidadDeseada,
  setCantidadDeseada] =
  useState(1);

const [busquedaNevera, setBusquedaNevera] =
  useState("");

  const [ubicacionCompra,
  setUbicacionCompra] =
  useState("Nevera");


const [nuevoEvento, setNuevoEvento] =
  useState("");
const [eventos, setEventos] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "eventos"
      );

    return guardados
      ? JSON.parse(guardados)
      : [];

  });

const [colorEvento, setColorEvento] = useState("#4CAF50");
 
const [mesActual, setMesActual] = useState(
  new Date().getMonth()
);

const [añoActual, setAñoActual] = useState(
  new Date().getFullYear()
);

const [mostrarModalEvento, setMostrarModalEvento] =
  useState(false);

const [fechaSeleccionada, setFechaSeleccionada] =
  useState("");

  const [horaEvento, setHoraEvento] =
  useState("");
  const pendientes =
  tareas.filter(
    (t) => !t.hecha
  );

const completadas =
  tareas.filter(
    (t) => t.hecha
  );

const [fechaTarea,
  setFechaTarea] =
  useState("");
const [horaTarea, setHoraTarea] =
  useState("");

  const coloresPastel = [
  "#A8D5BA", // verde
  "#B8E0D2", // menta
  "#AFCBFF", // azul
  "#CDB4DB", // lila
  "#FFC8DD", // rosa
  "#FFD6A5", // melocotón
  "#FDFFB6", // amarillo
  "#CAE9FF", // celeste
  "#D8F3DC", // verde claro
  "#E9D5FF"  // violeta
];

// GUARDAR NEVERA

useEffect(() => {

  localStorage.setItem(
    "nevera",
    JSON.stringify(productos)
  );

}, [productos]);

// GUARDAR COMPRA

useEffect(() => {

  localStorage.setItem(
    "compra",
    JSON.stringify(compra)
  );

}, [compra]);

// GUARDAR TAREAS

useEffect(() => {

  localStorage.setItem(
    "tareas",
    JSON.stringify(tareas)
  );

}, [tareas]);

// CARGAR PRODUCTOS BASE
useEffect(() => {

  localStorage.setItem(
    "eventos",
    JSON.stringify(eventos)
  );

}, [eventos]);
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
    cad.getTime() -
    hoy.getTime();

  return Math.ceil(
    diferencia /
    (1000 * 60 * 60 * 24)
  );

}

function obtenerEstado(fecha) {

  const dias =
    diasRestantes(fecha);

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
  caducidad,
  ubicacion
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

  if (
    modoCompra &&
    productoComprado
  ) {

    setCompra(
      compra.filter(
        (item) =>
          item.id !==
          productoComprado.id
      )
    );

    setModoCompra(false);

    setProductoComprado(
      null
    );

  }

  setCodigo("");
  setNombre("");
  setCantidad(1);
  setCaducidad("");
  setUbicacion("Nevera");


}
async function escanearFoto(event) {

  const archivo = event.target.files[0];

  if (!archivo) return;

  try {

    const url = URL.createObjectURL(archivo);

    const resultado =
      await Quagga.decodeSingle({

        src: url,

        numOfWorkers: 0,

        inputStream: {
          size: 1600
        },

        locator: {
          patchSize: "large",
          halfSample: false
        },

        locate: true,

        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader"
          ]
        }

      });

    if (
      !resultado ||
      !resultado.codeResult
    ) {

      throw new Error(
        "No se pudo leer el código"
      );

    }

    const codigoLeido =
      resultado.codeResult.code;

    setCodigo(codigoLeido);

    // Buscar primero en la base local

    const producto =
      await db.productos.get(
        codigoLeido
      );

    if (producto) {

      setNuevoCompra(
        producto.nombre
      );

      return;

    }

    // Buscar online

    const nombreOnline =
      await buscarProductoOnline(
        codigoLeido
      );

    if (nombreOnline) {

      setNuevoCompra(
        nombreOnline
      );

      // Guardarlo para futuras veces

      await db.productos.put({
        codigo: codigoLeido,
        nombre: nombreOnline
      });

    } else {

      setNuevoCompra(
        codigoLeido
      );

    }

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

}
async function buscarProductoOnline(codigo) {

  try {

    const respuesta =
      await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`
      );

    const datos =
      await respuesta.json();

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

  const nuevosProductos =
    productos
      .map((p) => {

        if (
          p.id !== id
        ) return p;

        const nuevaCantidad =
          p.cantidad - 1;

        if (
          nuevaCantidad <= 0
        ) {

          const añadir =
            window.confirm(

              `${p.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`

            );

          if (añadir) {

            setCompra(
              (actual) => [

                ...actual,

                {
                  id: Date.now(),
                  nombre: p.nombre
                }

              ]
            );

          }

          return null;

        }

        return {

          ...p,

          cantidad:
            nuevaCantidad

        };

      })
      .filter(Boolean);

  setProductos(
    nuevosProductos
  );

}
function cambiarCantidad(
  id,
  nuevaCantidad
) {

  const producto =
    productos.find(
      (p) => p.id === id
    );

  if (!producto) return;

  if (
    nuevaCantidad <= 0
  ) {

    const añadir =
      window.confirm(

        `${producto.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`

      );

    if (añadir) {

      setCompra(
        (actual) => [

          ...actual,

          {
            id: Date.now(),
            nombre:
              producto.nombre
          }

        ]
      );

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
            cantidad:
              nuevaCantidad
          }

        : p

    )

  );

}
function confirmarCompra() {

  if (
    !productoComprado
  ) return;

  setProductos([

    ...productos,

    {
  id: Date.now(),
  nombre: productoComprado.nombre,
  cantidad: Number(cantidadCompra),
  caducidad: caducidadCompra,
  ubicacion: ubicacionCompra
}

  ]);

  setCompra(

    compra.filter(

      (item) =>

        item.id !==
        productoComprado.id

    )

  );

  setMostrarModalCompra(
    false
  );

  setProductoComprado(
    null
  );

  setCantidadCompra(1);

  setCaducidadCompra("");
  
  setUbicacionCompra(
  "Nevera"
);
function diasHasta(fecha) {

  if (!fecha) return 999;

  const hoy = new Date();
  const limite = new Date(fecha);

  hoy.setHours(0,0,0,0);
  limite.setHours(0,0,0,0);

  return Math.ceil(
    (limite - hoy) /
    (1000 * 60 * 60 * 24)
  );

}

}
function añadirTarea() {

  if (!nuevaTarea.trim())
    return;

 setTareas([
  ...tareas,
  {
    id: Date.now(),
    texto: nuevaTarea,
    fecha: fechaTarea,
    hora: horaTarea,
    hecha: false,
    color: "#C7CEEA"
  }
]);

  setNuevaTarea("");
  setFechaTarea("");
  setHoraTarea("");

}

function cambiarEstadoTarea(id) {

  setTareas(

    tareas.map((t) =>

      t.id === id
        ? {
            ...t,
            hecha: !t.hecha
          }
        : t

    )

  );

}

function eliminarTarea(id) {

  setTareas(

    tareas.filter(
      (t) => t.id !== id
    )

  );

}
function formatearFecha(fecha) {

  if (!fecha) return "";

  const [año, mes, dia] =
    fecha.split("-");

  return `${dia}-${mes}-${año.slice(-2)}`;

}

function añadirCompra() {

  if (!nuevoCompra.trim())
    return;

  setCompra([
    ...compra,
    {
      id: Date.now(),
      nombre: nuevoCompra,
      cantidad: cantidadDeseada
    }
  ]);

  setNuevoCompra("");
  setCantidadDeseada(1);

}
function añadirEvento() {

  if (!nuevoEvento.trim())
    return;

  const nuevo = {
    id: Date.now(),
    titulo: nuevoEvento,
    fecha: fechaSeleccionada,
    hora: horaEvento,
    color: colorEvento
  };

  setEventos([
    ...eventos,
    nuevo
  ]);

  setNuevoEvento("");
  setHoraEvento("");
  setColorEvento("#4CAF50");

  setMostrarModalEvento(false);
}
function eliminarEvento(id) {

  const nuevosEventos =
    eventos.filter(
      (evento) =>
        evento.id !== id
    );

  setEventos(nuevosEventos);

  setEventosDia(
    nuevosEventos.filter(
      (evento) =>
        evento.fecha ===
        fechaSeleccionada
    )
  );

}

const total = productos.length;

const ok =
  productos.filter(
    (p) =>
      diasRestantes(
        p.caducidad
      ) > 7
  ).length;

const atencion =
  productos.filter((p) => {

    const d =
      diasRestantes(
        p.caducidad
      );

    return d >= 3 && d <= 7;

  }).length;

const urgente =
  productos.filter((p) => {

    const d =
      diasRestantes(
        p.caducidad
      );

    return d >= 0 && d <= 2;

  }).length;

const caducado =
  productos.filter(
    (p) =>
      diasRestantes(
        p.caducidad
      ) < 0
  ).length;

const [mostrarDetalleDia,
setMostrarDetalleDia] =
useState(false);

const [eventosDia,
setEventosDia] =
useState([]);
  
function abrirDia(fecha) {

  setFechaSeleccionada(fecha);

  const elementosDia = [

    ...eventos
      .filter(
        (evento) =>
          evento.fecha === fecha
      )
      .map((evento) => ({
        ...evento,
        tipo: "evento"
      })),

    ...tareas
      .filter(
        (tarea) =>
          tarea.fecha === fecha &&
          !tarea.hecha
      )
      .map((tarea) => ({
        ...tarea,
        tipo: "tarea"
      })),

    ...productos
      .filter(
        (producto) =>
          producto.caducidad === fecha
      )
      .map((producto) => ({
        ...producto,
        tipo: "caducidad"
      }))

  ].sort((a, b) => {

    if (!a.hora) return 1;
    if (!b.hora) return -1;

    return a.hora.localeCompare(
      b.hora
    );

  });

  setEventosDia(elementosDia);

  setMostrarDetalleDia(true);

}

function abrirNuevoEvento() {

  setMostrarDetalleDia(false);

  setMostrarModalEvento(true);

}
function generarDiasMes() {

  const primerDia = new Date(
    añoActual,
    mesActual,
    1
  );

  const ultimoDia = new Date(
    añoActual,
    mesActual + 1,
    0
  );

  let diaSemana =
    primerDia.getDay();

  if (diaSemana === 0)
    diaSemana = 7;

  const dias = [];

  for (
    let i = 1;
    i < diaSemana;
    i++
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= ultimoDia.getDate();
    dia++
  ) {

    dias.push(
      `${añoActual}-${String(
        mesActual + 1
      ).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`
    );

  }

  return dias;

}

return (
  <div
    style={{
      minHeight: "100vh",
      paddingTop: 85,
      background: "#f3f4f6",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}
  >

    

    {/* CONTENIDO */}

    <div
      style={{
        flex: 1,
        padding: 12
      }}
    >

      {pantalla === "nevera" && (
<div
  style={{
    background: "#F0FDF4",
    minHeight: "100vh",
    padding: 15
  }}
>
<>

  <h2
    style={{
      marginBottom: 20,
      textAlign: "center",
      fontSize: 28
    }}
  >
    🥛 Nevera
  </h2>

  {/* AVISO CADUCIDADES */}

  <div
    style={{
      background:
        urgente > 0
          ? "#fde2e4"
          : atencion > 0
          ? "#fff4d6"
          : "#d8f3dc",

      borderRadius: 24,
      padding: 20,
      marginBottom: 25,
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)"
    }}
  >

    {urgente > 0 && (
      <>
        🔴 Tienes {urgente} productos que caducan en menos de 3 días
      </>
    )}

    {urgente === 0 &&
      atencion > 0 && (
        <>
          🟡 Tienes {atencion} productos que caducan esta semana
        </>
      )}

    {urgente === 0 &&
      atencion === 0 && (
        <>
          🟢 No hay productos próximos a caducar
        </>
      )}

  </div>

  {/* BUSCADOR */}

  <div
    style={{
      background: "#ffffff",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      padding: 20,
      borderRadius: 20,
      marginBottom: 25
    }}
  >

    <h3
      style={{
        marginTop: 0,
        marginBottom: 12,
        color: "#374151"
      }}
    >
      🔍 Buscar producto
    </h3>

    <input
      placeholder="Buscar producto..."
      value={busquedaNevera}
      onChange={(e) =>
        setBusquedaNevera(
          e.target.value
        )
      }
      style={{
        width: "100%",
        padding: 14,
        borderRadius: 14,
        border: "1px solid #ddd",
        fontSize: 16,
        boxSizing: "border-box"
      }}
    />

  </div>

  {/* TABLA */}

  <div
    style={{
      background: "white",
      borderRadius: 20,
      overflowX: "auto",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)"
    }}
  >

    <table
      style={{
        width: "100%",
        minWidth: "700px",
        borderCollapse: "collapse",
        textAlign: "center"
      }}
    >

      <thead>

        <tr
          style={{
            background: "#f3f4f6"
          }}
        >
          <th style={{ padding: 14 }}>
            Producto
          </th>

          <th style={{ padding: 14 }}>
            Ubicación
          </th>

          <th style={{ padding: 14 }}>
            Cantidad
          </th>

          <th style={{ padding: 14 }}>
            Caducidad
          </th>

          <th style={{ padding: 14 }}>
            Días
          </th>

          <th style={{ padding: 14 }}>
            Acción
          </th>
        </tr>

      </thead>

      <tbody>

        {productos
          .filter((producto) =>
            producto.nombre
              .toLowerCase()
              .includes(
                busquedaNevera.toLowerCase()
              )
          )
          .map((producto) => {

            const estado =
              obtenerEstado(
                producto.caducidad
              );

            return (

              <tr
                key={producto.id}
                style={{
                  background:
                    estado.color,
                  borderBottom:
                    "1px solid #e5e7eb"
                }}
              >

                <td
                  style={{
                    padding: 12,
                    fontWeight: 600
                  }}
                >
                  {estado.emoji}{" "}
                  {producto.nombre}
                </td>

                <td style={{ padding: 12 }}>

                  {producto.ubicacion === "Nevera" &&
                    "🥛 Nevera"}

                  {producto.ubicacion === "Congelador" &&
                    "❄️ Congelador"}

                  {producto.ubicacion === "Armario" &&
                    "🥫 Armario"}

                </td>

                <td>

                  <button
                    onClick={() =>
                      cambiarCantidad(
                        producto.id,
                        producto.cantidad - 1
                      )
                    }
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border:
                        "1px solid #d1d5db",
                      background:
                        "#ffffff",
                      cursor: "pointer"
                    }}
                  >
                    −
                  </button>

                  <span
                    style={{
                      margin: "0 10px",
                      fontWeight: "600"
                    }}
                  >
                    {producto.cantidad}
                  </span>

                  <button
                    onClick={() =>
                      cambiarCantidad(
                        producto.id,
                        producto.cantidad + 1
                      )
                    }
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border:
                        "1px solid #d1d5db",
                      background:
                        "#ffffff",
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>

                </td>

                <td style={{ padding: 12 }}>
                  {formatearFecha(
                    producto.caducidad
                  )}
                </td>

                <td>

                  {diasRestantes(
                    producto.caducidad
                  ) < 0
                    ? "Caducado"
                    : diasRestantes(
                        producto.caducidad
                      )}

                </td>

                <td>

                  <button
                    onClick={() =>
                      consumirProducto(
                        producto.id
                      )
                    }
                    style={{
                      background:
                        "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      padding:
                        "8px 12px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Consumir
                  </button>

                </td>

              </tr>

            );

          })}

      </tbody>

    </table>

  </div>

</>
</div>
)}

 {pantalla === "compra" && (

<div
  style={{
    background: "#F0FDF4",
    minHeight: "100vh",
    padding: 15
  }}
>

  <h2
    style={{
      marginBottom: 20,
      textAlign: "center",
      fontSize: 28
    }}
  >
    🛒 Lista de la compra
  </h2>

  {/* AÑADIR PRODUCTO */}

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 24,
      marginBottom: 20,
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)"
    }}
  >

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >

      <input
        placeholder="Producto"
        value={nuevoCompra}
        onChange={(e) =>
          setNuevoCompra(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "1px solid #ddd",
          fontSize: 16,
          boxSizing: "border-box"
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >

        <label
          style={{
            flex: 1,
            background: "#ff9800",
            color: "white",
            padding: "14px",
            borderRadius: 14,
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          📦 Escanear

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={escanearFoto}
            hidden
          />
        </label>

        <input
          type="number"
          min="1"
          value={cantidadDeseada}
          onChange={(e) =>
            setCantidadDeseada(
              Number(e.target.value)
            )
          }
          style={{
            width: 80,
            padding: 14,
            borderRadius: 14,
            border: "1px solid #ddd",
            textAlign: "center"
          }}
        />

      </div>

      <button
        onClick={añadirCompra}
        style={{
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 14,
          padding: "14px",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: "bold"
        }}
      >
        ➕ Añadir producto
      </button>

    </div>

  </div>

  {/* SIN PRODUCTOS */}

  {compra.length === 0 ? (

    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 24,
        textAlign: "center",
        color: "#666",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.08)"
      }}
    >
      No hay productos pendientes
    </div>

  ) : (

    <div
      style={{
        background: "white",
        borderRadius: 24,
        overflowX: "auto",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.08)"
      }}
    >

      <table
        style={{
          width: "100%",
          minWidth: "500px",
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr
            style={{
              background: "#f3f4f6"
            }}
          >

            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Producto
            </th>

            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Cantidad
            </th>

            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Acción
            </th>

          </tr>

        </thead>

        <tbody>

          {compra.map((item) => (

            <tr
              key={item.id}
              style={{
                borderTop:
                  "1px solid #eee"
              }}
            >

              <td
                style={{
                  textAlign: "center",
                  padding: 15,
                  fontWeight: 600
                }}
              >
                🛒 {item.nombre}
              </td>

              <td
                style={{
                  textAlign: "center",
                  padding: 15,
                  fontWeight: "bold",
                  fontSize: 18
                }}
              >
                {item.cantidad || 1}
              </td>

              <td
                style={{
                  textAlign: "center",
                  padding: 15
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10
                  }}
                >

                  <button
                    onClick={() => {
                      setProductoComprado(item);
                      setMostrarModalCompra(true);
                    }}
                    title="Comprado"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "none",
                      background: "#4CAF50",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold"
                    }}
                  >
                    ✓
                  </button>

                  <button
                    onClick={() =>
                      setCompra(
                        compra.filter(
                          (p) =>
                            p.id !== item.id
                        )
                      )
                    }
                    title="Cancelar"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "none",
                      background: "#f44336",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold"
                    }}
                  >
                    ✕
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</div>

)}
     {pantalla === "calendario" && (

<div
  style={{
    background: "#F0FDF4",
    minHeight: "100vh",
    padding: 15
  }}
  >
  <h2
  style={{
    marginBottom: 20,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#111827"
  }}
>
  📅 Calendario familiar
</h2>

 <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    background: "white",
    padding: 20,
    borderRadius: 24,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)"
  }}
>

  <button
    onClick={() => {

      if (mesActual === 0) {

        setMesActual(11);
        setAñoActual(añoActual - 1);

      } else {

        setMesActual(
          mesActual - 1
        );

      }

    }}
    style={{
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "none",
  background: "#f3f4f6",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: "bold"
}}
  >
    ◀
  </button>

  <h3
   style={{
  margin: 0,
  textTransform: "capitalize",
  fontSize: 22,
  fontWeight: "700",
  color: "#111827"
}}
  >
    {new Date(
      añoActual,
      mesActual
    ).toLocaleDateString(
      "es-ES",
      {
        month: "long",
        year: "numeric"
      }
    )}
  </h3>

  <button
    onClick={() => {

      if (mesActual === 11) {

        setMesActual(0);
        setAñoActual(añoActual + 1);

      } else {

        setMesActual(
          mesActual + 1
        );

      }

    }}
    style={{
      border: "none",
      background: "#f3f4f6",
      padding: "10px 15px",
      borderRadius: 10,
      cursor: "pointer"
    }}
  >
    ▶
  </button>

</div>

 <div
 style={{
  display: "grid",
  gridTemplateColumns:
    "repeat(7, 1fr)",
  gap: 8
}}
>

    {["L","M","X","J","V","S","D"].map(
      (dia) => (

        <div
          key={dia}
          style={{
  textAlign: "center",
  fontWeight: "700",
  padding: 10,
  color: "#6b7280",
  fontSize: 13
}}
        >
          {dia}
        </div>

      )
    )}

    {generarDiasMes().map((dia) => (

      <div
       key={dia || Math.random()}
      onClick={() => {
      if (!dia) return;
      abrirDia(dia);

}}
       style={{
  background: "white",
  borderRadius: 20,
  height: 170,
  padding: 10,
  cursor: "pointer",
  boxShadow:
    "0 4px 12px rgba(0,0,0,0.08)",
  transition: "0.2s",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column"
}}
      >

        <div
  style={{
  fontWeight: "700",
  marginBottom: 8,
  fontSize: 20,
  color: "#111827"
}}
>
  {new Date(dia).getDate()}
</div>


{[
  ...eventos
    .filter(
      (evento) =>
        evento.fecha === dia
    )
    .map((evento) => ({
      ...evento,
      tipo: "evento"
    })),

  ...tareas
    .filter(
      (tarea) =>
        tarea.fecha === dia &&
        !tarea.hecha
    )
    .map((tarea) => ({
      ...tarea,
      tipo: "tarea"
    })),

  ...productos
    .filter(
      (producto) =>
        producto.caducidad === dia
    )
    .map((producto) => ({
      ...producto,
      tipo: "caducidad"
    }))
]
.sort((a, b) => {

  if (!a.hora) return 1;
  if (!b.hora) return -1;

  return a.hora.localeCompare(
    b.hora
  );

})

.slice(0, 3)

.map((item) => (

  <div
    key={`${item.tipo}-${item.id}`}
    style={{
      background:
  item.tipo === "evento"
    ? item.color
    : item.tipo === "tarea"
    ? "#C7CEEA"
    : "#FFD6E7",

color:
  item.tipo === "evento"
    ? "white"
    : "#333",

      borderRadius: 8,
      padding: "4px 8px",
      marginBottom: 4,
      fontSize:
  window.innerWidth < 600
    ? 9
    : 12,

      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }}
  >

    {item.hora && (
      <>
        🕒 {item.hora}{" "}
      </>
    )}

    {item.tipo === "evento"
  ? `📅 ${item.titulo}`
  : item.tipo === "tarea"
  ? `📝 ${item.texto}`
  : `🧊 ${item.nombre}`}

  </div>

))}

{[
  ...eventos.filter(
    (evento) =>
      evento.fecha === dia
  ),
  ...tareas.filter(
    (tarea) =>
      tarea.fecha === dia &&
      !tarea.hecha
  ),
  ...productos.filter(
    (producto) =>
      producto.caducidad === dia
  )
].length > 3 && (

  <div
    style={{
      fontSize: 11,
      fontWeight: "bold",
      color: "#4CAF50",
      marginTop: 4
    }}
  >
    +
    {[
      ...eventos.filter(
        (evento) =>
          evento.fecha === dia
      ),
      ...tareas.filter(
        (tarea) =>
          tarea.fecha === dia &&
          !tarea.hecha
      ),
      ...productos.filter(
        (producto) =>
          producto.caducidad === dia
      )
    ].length - 3}
    {" "}más
  </div>

)}
      </div>

    ))}

  </div>
{mostrarDetalleDia && (

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
      zIndex: 9998
    }}
  >

    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 30,
boxShadow:
  "0 15px 40px rgba(0,0,0,0.2)",
        width: "90%",
maxWidth: 500
      }}
    >

      <h3>
        📅 {fechaSeleccionada}
      </h3>

      {eventosDia.length === 0 ? (

        <p>No hay eventos</p>

      ) : (

       eventosDia
  .sort((a, b) => {

    if (!a.hora) return 1;
    if (!b.hora) return -1;

    return a.hora.localeCompare(
      b.hora
    );

  })
  .map((item) => (

    <div
      key={`${item.tipo}-${item.id}`}
      style={{
        background:
          item.tipo === "evento"
            ? item.color
            : item.tipo === "tarea"
            ? "#C7CEEA"
            : "#FFD6E7",

        color:
          item.tipo === "evento"
            ? "white"
            : "#333",

        padding: 10,
        borderRadius: 10,
        marginBottom: 10,

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >

      <div>

        {item.hora && (

          <div
            style={{
              fontSize: 12,
              marginBottom: 4
            }}
          >
            🕒 {item.hora}
          </div>

        )}

        <div>

          {item.tipo === "evento" &&
            `📅 ${item.titulo}`}

          {item.tipo === "tarea" &&
            `📝 ${item.texto}`}

          {item.tipo === "caducidad" &&
            `🧊 ${item.nombre}`}

        </div>

      </div>

      <div
        style={{
          display: "flex",
          gap: 8
        }}
      >

        {item.tipo === "tarea" && (

          <button
            onClick={() => {
              cambiarEstadoTarea(
                item.id
              );
            }}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            ✅
          </button>

        )}

        <button
          onClick={(e) => {

            e.stopPropagation();

            if (
              item.tipo === "evento"
            ) {
              eliminarEvento(
                item.id
              );
            }

            if (
              item.tipo === "tarea"
            ) {
              eliminarTarea(
                item.id
              );
            }

            if (
              item.tipo === "caducidad"
            ) {
              eliminarProducto(
                item.id
              );
            }

          }}
          style={{
            background: "white",
            color: "#f44336",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            padding: "4px 8px"
          }}
        >
          🗑️
        </button>

      </div>

    </div>

))

      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20
        }}
      >

        <button
          onClick={abrirNuevoEvento}
          style={{
            flex: 1,
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: 12
          }}
        >
          ➕ Añadir evento
        </button>

        <button
          onClick={() =>
            setMostrarDetalleDia(false)
          }
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12
          }}
        >
          Cerrar
        </button>

      </div>

    </div>

  </div>

)}
  {mostrarModalEvento && (

    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.5)",
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
    borderRadius: 30,
boxShadow:
  "0 15px 40px rgba(0,0,0,0.2)",
    width: "90%",
maxWidth: 420,
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.2)"
  }}
>

  <h3
    style={{
      marginTop: 0,
      marginBottom: 5
    }}
  >
    📅 Nuevo evento
  </h3>

  <p
    style={{
      color: "#666",
      marginBottom: 20
    }}
  >
    {fechaSeleccionada}
  </p>

  <input
    placeholder="Nombre del evento"
    value={nuevoEvento}
    onChange={(e) =>
      setNuevoEvento(
        e.target.value
      )
    }
    style={{
      width: "100%",
      padding: 14,
      borderRadius: 12,
      border: "1px solid #ddd",
      marginBottom: 20,
      boxSizing: "border-box"
    }}
  />

<input
  type="time"
  value={horaEvento}
  onChange={(e) =>
    setHoraEvento(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "16px 18px",
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
    boxSizing: "border-box"
  }}
/>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 25
    }}
  >

    <span>
      
    </span>

    <div
  style={{
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  }}
>
  {coloresPastel.map((color) => (

    <div
      key={color}
      onClick={() =>
        setColorEvento(color)
      }
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border:
          colorEvento === color
            ? "3px solid #333"
            : "2px solid white",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.15)"
      }}
    />

  ))}
</div>

  </div>

  <div
    style={{
      display: "flex",
      gap: 12
    }}
  >

    <button
      onClick={añadirEvento}
      style={{
        flex: 1,
        padding: 14,
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: 12,
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Guardar
    </button>

    <button
      onClick={() =>
        setMostrarModalEvento(false)
      }
      style={{
        flex: 1,
        padding: 14,
        background: "#f3f4f6",
        border: "1px solid #ddd",
        borderRadius: 12,
        cursor: "pointer"
      }}
    >
      Cancelar
    </button>

  </div>

</div>
    </div>


)}

</div>

)}

{pantalla === "tareas" && (

<div
  style={{
    background: "#F0FDF4",
    minHeight: "100vh",
    padding: 15
  }}
>

  <h2
    style={{
      marginBottom: 20,
      textAlign: "center",
      fontSize: 28
    }}
  >
    📝 Tareas
  </h2>

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 24,
      marginBottom: 25,
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)"
    }}
  >

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >

      <input
  value={nuevaTarea}
  onChange={(e) =>
    setNuevaTarea(e.target.value)
  }
  placeholder="✏️ Escribe una tarea..."
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      añadirTarea();
    }
  }}
  style={{
  width: "100%",
  height: 72,
  padding: "0 24px",
  borderRadius: 36,
  border: "2px solid #D1D5DB",
  background: "#fff",
  fontSize: 17,
  boxSizing: "border-box"
}}
/>

<div
  style={{
    display: "flex",
    gap: 15,
    marginTop: 15,
    marginBottom: 15
  }}
>
  <div style={{ flex: 1 }}>
    <div
      style={{
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        color: "#4B5563"
      }}
    >
      📅 Fecha
    </div>

    <input
      type="date"
      value={fechaTarea}
      onChange={(e) =>
        setFechaTarea(e.target.value)
      }
      style={{
        width: "100%"
      }}
    />
  </div>

  <div style={{ flex: 1 }}>
    <div
      style={{
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        color: "#4B5563"
      }}
    >
      ⏰ Hora
    </div>

    <input
      type="time"
      value={horaTarea}
      onChange={(e) =>
        setHoraTarea(e.target.value)
      }
      style={{
        width: "100%"
      }}
    />
  </div>
</div>



      <button
  onClick={añadirTarea}
  style={{
  width: "100%",
  height: 72,
  padding: "0 24px",
  borderRadius: 36,
  border: "2px solid #D1D5DB",
  background: "#fff",
  fontSize: 17,
  boxSizing: "border-box"
}}
>
  ➕ Añadir tarea
</button>

    </div>

  </div>

  {tareas.length === 0 ? (

    <div
      style={{
  width: "100%",
  height: 72,
  padding: "0 24px",
  borderRadius: 36,
  border: "2px solid #D1D5DB",
  background: "#fff",
  fontSize: 17,
  boxSizing: "border-box"
}}
    >
      No hay tareas
    </div>

  ) : (

    tareas.map((tarea) => (

      <div
        key={tarea.id}
        style={{
          background: tarea.hecha
            ? "#dff5df"
            : "white",

          border: tarea.hecha
            ? "2px solid #4CAF50"
            : "2px solid transparent",

          padding: 18,
          borderRadius: 20,
          marginBottom: 12,

          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",

          transition: "0.2s"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 12
          }}
        >

          <div
            style={{
              flex: 1
            }}
          >

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,

                textDecoration:
                  tarea.hecha
                    ? "line-through"
                    : "none",

                color:
                  tarea.hecha
                    ? "#666"
                    : "#111"
              }}
            >
              {tarea.texto}
            </div>

            {tarea.fecha && (

              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  marginTop: 8
                }}
              >
                📅 {new Date(
                  tarea.fecha
                ).toLocaleDateString(
                  "es-ES"
                )}

                {tarea.hora &&
                  ` · 🕒 ${tarea.hora}`
                }
              </div>

            )}

          </div>

          <button
            onClick={() =>
              cambiarEstadoTarea(
                tarea.id
              )
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: tarea.hecha
                ? "#2e7d32"
                : "#4CAF50",

              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 18
            }}
          >
            {tarea.hecha
              ? "✔"
              : "✓"}
          </button>

          <button
            onClick={() =>
              eliminarTarea(
                tarea.id
              )
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#f44336",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 18
            }}
          >
            🗑️
          </button>

        </div>

      </div>

    ))

  )}

</div>

)}

    </div>

    {/* MENÚ INFERIOR */}

    <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    display: "flex",
    background: "white",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    zIndex: 9999
  }}
>

      <button
  onClick={() =>
    setPantalla("nevera")
  }
  style={{
  flex: 1,
  padding: 8,
  background:
    pantalla === "nevera"
      ? "#ffb4f9"
      : "#ffe8f5",
  border: "1px solid #e8c3e7",
  fontWeight: "bold"
}}

      >
        🥛
        <br />
        Nevera
      </button>

      <button
        onClick={() =>
          setPantalla("compra")
        }
       style={{
  flex: 1,
  padding: 8,
  background:
    pantalla === "compra"
      ? "#9FE3B0"
      : "#E6F8EB",
  border: "1px solid #b7d9c0",
  fontWeight: "bold"
}}
      >
        🛒
        <br />
        Compra
      </button>

      <button
        onClick={() =>
          setPantalla("calendario")
        }
        style={{
  flex: 1,
  padding: 8,
  background:
    pantalla === "calendario"
      ? "#A9D4FF"
      : "#EAF4FF",
  border: "1px solid #b9cfe6",
  fontWeight: "bold"
}}
      >
        📅
        <br />
        Calendario
      </button>

      <button
        onClick={() =>
          setPantalla("tareas")
        }
        style={{
  flex: 1,
  padding: 8,
  background:
    pantalla === "tareas"
      ? "#CDB4FF"
      : "#F0E8FF",
  border: "1px solid #cfc3e8",
  fontWeight: "bold"
}}
      >
        📝
        <br />
        Tareas
      </button>

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
        width: 420,
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.2)"
      }}
    >

      <h3
        style={{
          marginTop: 0,
          marginBottom: 10,
          fontSize: 24
        }}
      >
        🛒 Producto comprado
      </h3>

      <p
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: 18,
          color: "#374151"
        }}
      >
        {productoComprado?.nombre}
      </p>

      <input
        type="number"
        min="1"
        value={cantidadCompra}
        onChange={(e) =>
          setCantidadCompra(
            e.target.value
          )
        }
        placeholder="Cantidad"
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <input
        type="date"
        value={caducidadCompra}
        onChange={(e) =>
          setCaducidadCompra(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <select
        value={ubicacionCompra}
        onChange={(e) =>
          setUbicacionCompra(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 20,
          boxSizing: "border-box"
        }}
      >
        <option value="Nevera">
          🥛 Nevera
        </option>

        <option value="Congelador">
          ❄️ Congelador
        </option>

        <option value="Armario">
          🥫 Armario
        </option>
      </select>

      <div
        style={{
          display: "flex",
          gap: 12
        }}
      >

        <button
          onClick={confirmarCompra}
          style={{
            flex: 1,
            padding: 14,
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Guardar
        </button>

        <button
          onClick={() =>
            setMostrarModalCompra(
              false
            )
          }
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border:
              "1px solid #d1d5db",
            background: "#f3f4f6",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>

      </div>

    </div>

  </div>

)}
  </div>
);
}