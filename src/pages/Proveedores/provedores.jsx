import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// Toast importation
import { toast } from "react-toastify";
// IMport
import { Modal, Button } from "react-bootstrap";

// Ajuste para evitar error de import.meta en ciertos entornos
const getApiUrl = () => {
  try {
    return import.meta.env.VITE_API_URL;
  } catch (e) {
    return "https://backend-paws.onrender.com/api/v1"; // Fallback seguro
  }
};
const API_URL = getApiUrl();

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "", detalles: "" });
  const [form, setForm] = useState({
    id_proveedor: "",
    nombre: "",
    telefono: "",
    contacto: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // NUEVOS ESTADOS para la confirmación de ELIMINAR
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [idToDelete, setIdToDelete] = useState(null); 

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");

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
  };

  // ---------------------------------------------------------
  //  UTILIDADES: Carga dinámica de scripts para PDF
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

  // ---------------------------------------------------------
  //  LÓGICA DE GENERACIÓN DE PDF (SIMPLIFICADO)
  // ---------------------------------------------------------
  const generarReportePDF = async () => {
    if (proveedores.length === 0) {
      mostrarMensaje("warning", "No hay datos para generar el reporte.");
      return;
    }

    mostrarMensaje("warning", "Generando lista de proveedores...");

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // --- CONFIGURACIÓN ---
      const colorPrincipal = [41, 128, 185]; // Azul profesional
      
      // --- ENCABEZADO SIMPLE ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...colorPrincipal);
      doc.text("Listado de Proveedores", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de emision: ${new Date().toLocaleDateString()}`, 14, 26);

      // Línea divisoria simple
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 30, 196, 30);

      // --- TABLA LIMPIA ---
      // Ordenamos por nombre para facilitar la búsqueda visual
      const sortedProveedores = [...proveedores].sort((a, b) => a.nombre.localeCompare(b.nombre));

      doc.autoTable({
        startY: 35,
        head: [['Empresa / Proveedor', 'Telefono', 'Contacto Directo']],
        body: sortedProveedores.map(p => [
          p.nombre,
          p.telefono || "—",
          p.contacto || "—"
        ]),
        headStyles: { 
            fillColor: colorPrincipal,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Filas alternas gris muy claro
        styles: { 
            fontSize: 11, 
            cellPadding: 4,
            textColor: 50
        },
        columnStyles: {
            0: { fontStyle: 'bold' }, // Nombre de la empresa en negrita
            1: { cellWidth: 50 },     // Ancho fijo para teléfono
            2: { fontStyle: 'italic' } // Contacto en cursiva
        },
        theme: 'plain' // Tema minimalista (sin líneas verticales pesadas)
      });

      doc.save(`Proveedores_${new Date().toISOString().slice(0, 10)}.pdf`);
      mostrarMensaje("success", "Lista descargada correctamente.");

    } catch (error) {
      console.error("Error PDF:", error);
      mostrarMensaje("danger", "Error al generar el archivo.");
    }
  };

  // 🔹 Obtener proveedores
  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const data = await res.json();

      if (res.ok) {
        setProveedores(data);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar proveedores");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // 🔹 Crear o actualizar proveedor
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? `${API_URL}/proveedores/update`
      : `${API_URL}/proveedores`;

    const method = modoEdicion ? "PUT" : "POST";

    try {
      const dataToSend = { ...form };
      if (!modoEdicion) delete dataToSend.id_proveedor;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", "Operación exitosa");
        setForm({ id_proveedor: "", nombre: "", telefono: "", contacto: "" });
        setModoEdicion(false);
        setShowModal(false);
        fetchProveedores();
      } else {
        mostrarMensaje("danger", data.message || "Error", data.details || "");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión");
    }
  };

  // Iniciar el flujo de confirmación para eliminar
  const solicitarConfirmacionEliminar = (id) => {
    setIdToDelete(id); 
    setShowDeleteConfirm(true); 
  };
  
  // Eliminar (Lógica real que se ejecuta al confirmar en el modal)
  const ejecutarEliminacion = async () => {
    const id = idToDelete; 

    setShowDeleteConfirm(false);
    setIdToDelete(null);

    if (!id) return; 

    try {
      const res = await fetch(`${API_URL}/proveedores/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_proveedor: id }),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message || "Proveedor eliminado correctamente");
        fetchProveedores();
      } else {
        mostrarMensaje("danger", data.message || "No se pudo eliminar el proveedor");
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar al servidor");
    }
  };

  // Editar proveedor
  const editarProveedor = (p) => {
    setModoEdicion(true);
    setForm(p);
    setShowModal(true);
  };

  const proveedoresFiltrados = proveedores.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      p.telefono?.toLowerCase().includes(filtroTelefono.toLowerCase())
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">
      {/* Mensaje superior */}
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} text-center fw-semibold`}>
          {mensaje.texto}
          {mensaje.detalles && (
            <div className="small mt-1 text-muted">{mensaje.detalles}</div>
          )}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Gestión de Proveedores</h4>
        <div>
            {/* Botón de Exportar PDF */}
            <button 
                className="btn btn-danger me-2"
                onClick={generarReportePDF}
                disabled={proveedores.length === 0}
            >
                <i className="bi bi-file-earmark-pdf me-2"></i>Lista PDF
            </button>

            <button
            className="btn btn-success"
            onClick={() => {
                setModoEdicion(false);
                setForm({
                id_proveedor: "",
                nombre: "",
                telefono: "",
                contacto: "",
                });
                setShowModal(true);
            }}
            >
            <i className="bi bi-plus-circle me-2"></i>Nuevo Proveedor
            </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 p-3 shadow-sm">
        <h6 className="fw-bold mb-3 text-secondary">Filtros de búsqueda</h6>

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
              {proveedoresFiltrados.length > 0 ? (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id_proveedor}>
                    <td>{p.id_proveedor}</td>
                    <td>{p.nombre}</td>
                    <td>{p.telefono}</td>
                    <td>{p.contacto || "—"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editarProveedor(p)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => solicitarConfirmacionEliminar(p.id_proveedor)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No hay proveedores registrados.
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
          <div className="modal fade show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {modoEdicion ? "Editar Proveedor" : "Nuevo Proveedor"}
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({ ...form, telefono: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contacto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.contacto}
                        onChange={(e) =>
                          setForm({ ...form, contacto: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cerrar
                    </button>

                    <button type="submit" className="btn btn-success">
                      <i className="bi bi-save me-1"></i>
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
          <p>¿Estás seguro de que deseas eliminar al proveedor con ID <strong>{idToDelete}</strong>? Esta acción no se puede deshacer.</p>
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