import React, { useEffect, useState } from "react";
// Toast importation
import { toast } from "react-toastify";
// IMport
import { Modal, Button } from "react-bootstrap";

// Fallback para entornos sin import.meta disponible
const getApiUrl = () => {
  try {
    return import.meta.env.VITE_API_URL;
  } catch (e) {
    return ""; 
  }
};
const API_URL = getApiUrl();

// ---------------------------------------------------------
// UTILIDADES: Carga dinámica de scripts para PDF
// ---------------------------------------------------------
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "", detalles: "" });

  const [form, setForm] = useState({
    id_cliente: "",
    nombre: "",
    telefono: "",
    contacto: "",
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Visibilidad del modal de confirmación
  const [idToDelete, setIdToDelete] = useState(null); // ID del cliente a eliminar

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");

  // Mostrar mensaje temporal
  const mostrarMensaje = (tipo, texto, detalles = "") => {
    switch (tipo) {
      case "warning":
        toast.info(texto, { position: "top-center", autoClose: 5000 })
        break;
      case "danger":
        toast.error(texto, { position: "top-center", autoClose: 5000 })
        break;
      case "success":
        toast.success(texto, { position: "top-center", autoClose: 5000 })
        break;
    }
    // setMensaje({ tipo, texto, detalles });
    // setTimeout(() => setMensaje({ tipo: "", texto: "", detalles: "" }), 6000);
  };

  // Obtener clientes
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();

      if (res.ok) {
        // Aseguramos que data sea un array, si la API retorna un objeto que contiene el array, ajustamos:
        const lista = data.clientes || data; 
        setClientes(Array.isArray(lista) ? lista : []);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar clientes");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // ---------------------------------------------------------
  // LÓGICA DE GENERACIÓN DE PDF
  // ---------------------------------------------------------
  const generarReportePDF = async () => {
    if (clientesFiltrados.length === 0) {
      mostrarMensaje("warning", "No hay datos filtrados para generar el reporte.");
      return;
    }

    mostrarMensaje("warning", "Generando Reporte de Clientes...", "Por favor espera un momento.");

    try {
      // 1. Cargar librerías
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // --- CONFIGURACIÓN ---
      const colorAzul = [41, 128, 185]; 
      const colorGris = [100, 100, 100];
      const colorNegro = [0, 0, 0];
      
      let currentY = 20; 

      // --- ENCABEZADO ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...colorAzul);
      doc.text("Reporte de Clientes Registrados", 105, currentY, { align: "center" });
      currentY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(...colorGris);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, currentY, { align: "center" });
      currentY += 8;
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, currentY, 196, currentY);
      currentY += 8; 

      // ==========================================
      // 1. RESUMEN
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...colorNegro);
      doc.text(`Total de Clientes: ${clientes.length}`, 14, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.text(`Clientes mostrados en este reporte (despues de filtrar): ${clientesFiltrados.length}`, 14, currentY);
      currentY += 15;


      // ==========================================
      // 2. TABLA DE DETALLES
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...colorNegro);
      doc.text("Detalle de Clientes", 14, currentY);
      currentY += 5;

      // Mapear los datos para la tabla
      const clientesData = clientesFiltrados.map(c => [
        c.id_cliente,
        c.nombre,
        c.telefono,
        c.contacto
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['ID', 'Nombre', 'Teléfono', 'Detalle de Contacto']],
        body: clientesData,
        headStyles: { fillColor: colorAzul, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
            3: { cellWidth: 'auto' } // Columna de contacto más ancha
        },
        theme: 'striped'
      });
      
      // Salvar el documento
      doc.save(`Reporte_Clientes_${new Date().toISOString().slice(0, 10)}.pdf`);
      mostrarMensaje("success", "Reporte PDF descargado correctamente.");

    } catch (error) {
      console.error("Error PDF:", error);
      mostrarMensaje("danger", "Error al generar PDF");
    }
  };
  
  // Crear / Actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? `${API_URL}/clientes/update`
      : `${API_URL}/clientes`;

    const method = modoEdicion ? "PUT" : "POST";

    if (!modoEdicion)
      delete form.id_cliente

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {

        mostrarMensaje("success", modoEdicion ? "Cliente actualizado" : "Cliente creado");
        setShowModal(false);
        setForm({ id_cliente: "", nombre: "", telefono: "", contacto: "" });
        setModoEdicion(false);
        fetchClientes();
      } else {
        mostrarMensaje("danger", data.message || "Error en la operación");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión con el servidor");
    }
  };

  // Editar
  const editarCliente = (c) => {
    setModoEdicion(true);
    setForm(c);
    setShowModal(true);
  };

  // Iniciar el flujo de confirmación para eliminar
  const solicitarConfirmacionEliminar = (id) => {
    setIdToDelete(id); // Guarda el ID temporalmente
    setShowDeleteConfirm(true); // Muestra el nuevo modal
  };
  // Eliminar (Lógica real que se ejecuta al confirmar en el modal)
  const ejecutarEliminacion = async () => {
    const id = idToDelete; // Usamos el ID guardado

    // 1. Cerrar el modal inmediatamente y limpiar el ID
    setShowDeleteConfirm(false);
    setIdToDelete(null);

    if (!id) return; // Seguridad extra

    try {
      const res = await fetch(`${API_URL}/clientes/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: id }),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", "Cliente eliminado correctamente");
        fetchClientes();
      } else {
        mostrarMensaje("danger", data.message);
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    }
  };

  // Filtrar
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      c.telefono?.toLowerCase().includes(filtroTelefono.toLowerCase())
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">

      {mensaje.texto && (
        <div
          className={`alert alert-${mensaje.tipo} text-center fw-semibold alerta-superior`}
          role="alert"
        >
          <div>{mensaje.texto}</div>
          {mensaje.detalles && <div className="small text-muted">{mensaje.detalles}</div>}
        </div>
      )}

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary mb-0">Gestión de Clientes</h4>

        <div>
            {/* BOTÓN PARA GENERAR PDF */}
            <button 
                className="btn btn-danger me-2"
                onClick={generarReportePDF}
                disabled={clientesFiltrados.length === 0}
            >
                <i className="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
            </button>

            <button
              className="btn btn-success"
              onClick={() => {
                setModoEdicion(false);
                setForm({ id_cliente: "", nombre: "", telefono: "", contacto: "" });
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>Nuevo Cliente
            </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm p-3">
        <h6 className="fw-bold text-secondary">Filtros de búsqueda</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Buscar por nombre</label>
            <input
              type="text"
              className="form-control"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Buscar por teléfono</label>
            <input
              type="text"
              className="form-control"
              value={filtroTelefono}
              onChange={(e) => setFiltroTelefono(e.target.value)}
              minLength={8}
              maxLength={8}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Contacto</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>{c.id_cliente}</td>
                    <td>{c.nombre}</td>
                    <td>{c.telefono}</td>
                    <td>{c.contacto}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editarCliente(c)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => solicitarConfirmacionEliminar(c.id_cliente)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">

                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {modoEdicion ? "Editar Cliente" : "Nuevo Cliente"}
                  </h5>

                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        minLength={8}
                        maxLength={8}
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Contacto</label>
                      <textarea
                        className="form-control"
                        value={form.contacto}
                        onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>
                      Cerrar
                    </button>

                    <button className="btn btn-success" type="submit">
                      <i className="bi bi-save me-2"></i>
                      {modoEdicion ? "Actualizar" : "Guardar"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar al cliente con ID <strong>{idToDelete}</strong>? Esta acción no se puede deshacer.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={ejecutarEliminacion}
            disabled={!idToDelete}
          >
            <i className="bi bi-trash me-2"></i>Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}