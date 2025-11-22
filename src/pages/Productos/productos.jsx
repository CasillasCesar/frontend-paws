import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; 
// import "bootstrap-icons/font/bootstrap-icons.css"; 
import { toast } from "react-toastify";
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

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "", detalles: "" });
  const [form, setForm] = useState({
    id_producto: "",
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    unidad: "",
    stock_minimo: "",
    stock_actual: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Estados para eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

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
  //  LÓGICA DE GENERACIÓN DE PDF (MEJORADA - SIN EMOJIS)
  // ---------------------------------------------------------
  const generarReportePDF = async () => {
    if (productos.length === 0) {
      mostrarMensaje("warning", "No hay datos para generar el reporte.");
      return;
    }

    mostrarMensaje("warning", "Generando PDF...", "Por favor espera un momento.");

    try {
      // 1. Cargar librerías
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // --- COLORES Y CONFIG ---
      const colorAzul = [41, 128, 185]; 
      const colorRojo = [231, 76, 60];  
      const colorVerde = [39, 174, 96]; 
      const colorGris = [44, 62, 80];
      const colorNaranja = [243, 156, 18]; 

      let currentY = 20; 

      // --- ENCABEZADO ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...colorAzul);
      doc.text("Reporte General de Inventario", 105, currentY, { align: "center" });
      currentY += 8;

      doc.setFontSize(10);
      doc.setTextColor(...colorGris);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de generacion: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, currentY, { align: "center" });
      currentY += 8;
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, currentY, 196, currentY);
      currentY += 15; 

      // ==========================================
      // 1. RESUMEN DE ESTADO 
      // ==========================================
      const totalActivos = productos.filter(p => p.activo).length;
      const totalProductos = productos.length;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. Estado del Inventario", 14, currentY);
      currentY += 10;

      // Fondo barra total
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(14, currentY, 180, 12, 2, 2, "F");

      // Barra Activos
      const anchoActivos = (totalActivos / totalProductos) * 180;
      if (anchoActivos > 0) {
        doc.setFillColor(...colorVerde);
        doc.rect(14, currentY, anchoActivos, 12, "F"); 
      }
      
      // Textos de la barra
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Activos: ${totalActivos} (${Math.round((totalActivos/totalProductos)*100)}%)`, 14, currentY + 18);
      doc.text(`Inactivos: ${totalProductos - totalActivos}`, 100, currentY + 18);
      
      currentY += 30; 

      // ==========================================
      // 2. REPORTE POR CATEGORÍA 
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("2. Distribucion por Categoria", 14, currentY);
      currentY += 10;

      const categoriasCount = {};
      productos.forEach(p => {
        const cat = p.categoria || "Sin Categoria";
        categoriasCount[cat] = (categoriasCount[cat] || 0) + 1;
      });
      const categoriasData = Object.entries(categoriasCount).sort((a,b) => b[1] - a[1]);

      const maxCatCount = Math.max(...Object.values(categoriasCount), 1);
      
      categoriasData.forEach(([catName, count]) => {
         if (currentY > 270) { doc.addPage(); currentY = 20; }

         const barWidth = (count / maxCatCount) * 120;
         
         doc.setFont("helvetica", "normal");
         doc.setFontSize(10);
         doc.setTextColor(0,0,0);
         doc.text(`${catName.substring(0, 25)}`, 14, currentY + 5);

         doc.setFillColor(...colorNaranja);
         doc.rect(70, currentY, barWidth, 6, "F"); 

         doc.setTextColor(80, 80, 80);
         doc.text(`${count}`, 70 + barWidth + 2, currentY + 4.5); 

         currentY += 10;
      });

      currentY += 10; 

      // ==========================================
      // 3. ANÁLISIS DE STOCK 
      // ==========================================
      if (currentY > 220) { doc.addPage(); currentY = 20; } 

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("3. Analisis de Stock Critico", 14, currentY);
      currentY += 10;

      // --- 3A. Top Menor Stock ---
      const topMenor = [...productos].sort((a, b) => Number(a.stock_actual) - Number(b.stock_actual)).slice(0, 5);
      doc.setFontSize(11);
      doc.setTextColor(...colorRojo);
      // ELIMINADO EL EMOJI AQUI
      doc.text("Productos con Menor Stock (Revisar urgente)", 14, currentY);
      currentY += 8;

      const maxValMenor = Math.max(...topMenor.map(p => Number(p.stock_actual)), 1);

      topMenor.forEach(p => {
        const w = (Number(p.stock_actual) / maxValMenor) * 100;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`${p.nombre.substring(0, 30)}`, 14, currentY + 4);

        doc.setFillColor(...colorRojo);
        doc.rect(80, currentY, w + 1, 5, "F");
        doc.text(`${p.stock_actual} un.`, 80 + w + 2, currentY + 4);

        currentY += 8;
      });

      currentY += 10;

      // --- 3B. Top Mayor Stock ---
      if (currentY > 250) { doc.addPage(); currentY = 20; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...colorAzul);
      // ELIMINADO EL EMOJI AQUI
      doc.text("Productos con Mayor Stock (Excedente)", 14, currentY);
      currentY += 8;

      const topMayor = [...productos].sort((a, b) => Number(b.stock_actual) - Number(a.stock_actual)).slice(0, 5);
      const maxValMayor = Math.max(...topMayor.map(p => Number(p.stock_actual)), 1);

      topMayor.forEach(p => {
        const w = (Number(p.stock_actual) / maxValMayor) * 100;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`${p.nombre.substring(0, 30)}`, 14, currentY + 4);

        doc.setFillColor(...colorAzul);
        doc.rect(80, currentY, w + 1, 5, "F");
        doc.text(`${p.stock_actual} un.`, 80 + w + 2, currentY + 4);

        currentY += 8;
      });

      // ==========================================
      // TABLA DE DETALLES (Nueva Página)
      // ==========================================
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Detalle Completo del Inventario", 14, 20);

      doc.autoTable({
        startY: 25,
        head: [['Codigo', 'Producto', 'Categoria', 'Stock', 'Minimo', 'Estado']],
        body: productos.map(p => [
          p.codigo,
          p.nombre,
          p.categoria,
          p.stock_actual,
          p.stock_minimo,
          p.activo ? 'Activo' : 'Inactivo'
        ]),
        headStyles: { fillColor: colorAzul },
        styles: { fontSize: 9 },
        theme: 'grid',
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 3) {
                if (Number(data.cell.raw) < Number(productos[data.row.index].stock_minimo)) {
                    data.cell.styles.textColor = colorRojo;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
      });

      doc.save(`Reporte_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
      mostrarMensaje("success", "PDF descargado correctamente.");

    } catch (error) {
      console.error("Error PDF:", error);
      mostrarMensaje("danger", "Error al generar PDF");
    }
  };

  // ---------------------------------------------------------
  //  RESTO DE FUNCIONES (CRUD) - Sin cambios
  // ---------------------------------------------------------

  const mostrarMensaje = (tipo, texto, detalles = "") => {
    switch (tipo) {
      case "warning": toast.info(texto); break;
      case "danger": toast.error(texto); break;
      case "success": toast.success(texto); break;
      default: break;
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (res.ok) {
        setProductos(data.products || []);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar productos");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = modoEdicion ? `${API_URL}/products/update` : `${API_URL}/products/nuevo`;
    const method = modoEdicion ? "PUT" : "POST";

    try {
      let dataToSend = { ...form };
      if (modoEdicion) {
        delete dataToSend.stock_minimo;
        delete dataToSend.stock_actual;
        delete dataToSend.created_at;
        delete dataToSend.updated_at;
      } else {
        delete dataToSend.id_producto;
      }
      
      const invalidWords = ["null", "true", "false"];
      for (const key in dataToSend) {
        const value = String(dataToSend[key]).trim().toLowerCase();
        if (invalidWords.includes(value)) return mostrarMensaje("danger", "Datos inválidos");
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message || "Operación exitosa");
        setForm({
          id_producto: "", codigo: "", nombre: "", descripcion: "",
          categoria: "", unidad: "", stock_minimo: "", stock_actual: "",
        });
        setModoEdicion(false);
        setShowModal(false);
        fetchProductos();
      } else {
        mostrarMensaje("danger", data.message || "Error en la operación");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión");
    }
  };

  const confirmarEliminacion = (id) => {
    setIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmation = async () => {
    setShowDeleteConfirm(false);
    if (!idToDelete) return;
    try {
      const res = await fetch(`${API_URL}/products/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: idToDelete }),
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje("success", "Producto eliminado");
        fetchProductos();
      } else {
        mostrarMensaje("danger", "Error al eliminar");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión");
    } finally {
      setIdToDelete(null);
    }
  };

  const editarProducto = (p) => {
    setModoEdicion(true);
    setForm(p);
    setShowModal(true);
  };

  const cambiarEstado = async (id, activo) => {
    try {
      const res = await fetch(`${API_URL}/products/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: id, activo: activo ? 0 : 1 }),
      });
      if (res.ok) {
        mostrarMensaje("success", "Estado actualizado");
        setProductos((prev) => prev.map((p) => (p.id_producto === id ? { ...p, activo: activo ? 0 : 1 } : p)));
      } else {
        mostrarMensaje("danger", "Error al actualizar estado");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión");
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      p.codigo?.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      p.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} text-center fw-semibold alerta-superior`} role="alert">
          {mensaje.texto}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary mb-0">Gestión de Productos</h4>
        
        <div>
          <button 
            className="btn btn-danger me-2"
            onClick={generarReportePDF}
            disabled={productos.length === 0}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
          </button>

          <button
            className="btn btn-success"
            onClick={() => {
              setModoEdicion(false);
              setForm({
                id_producto: "", codigo: "", nombre: "", descripcion: "",
                categoria: "", unidad: "", stock_minimo: "", stock_actual: "",
              });
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>Nuevo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm p-3">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text" className="form-control" placeholder="🔍 Buscar por nombre..."
              value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text" className="form-control" placeholder="🔍 Buscar por código..."
              value={filtroCodigo} onChange={(e) => setFiltroCodigo(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text" className="form-control" placeholder="🔍 Buscar por categoría..."
              value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Min</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.id_producto}</td>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td className={p.stock_actual < p.stock_minimo ? "text-danger fw-bold" : ""}>
                      {p.stock_actual} {p.stock_actual < p.stock_minimo && <i className="bi bi-exclamation-circle-fill ms-1"></i>}
                    </td>
                    <td>{p.stock_minimo}</td>
                    <td>
                      <span className={`badge bg-${p.activo ? "success" : "secondary"}`}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editarProducto(p)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger me-1" onClick={() => confirmarEliminacion(p.id_producto)}>
                        <i className="bi bi-trash"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => cambiarEstado(p.id_producto, p.activo)}>
                         <i className={`bi ${p.activo ? "bi-toggle2-on" : "bi-toggle2-off"}`}></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center py-4">No hay productos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALES */}
      {showModal && (
        <>
          <div className="modal fade show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">{modoEdicion ? "Editar Producto" : "Nuevo Producto"}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Código</label>
                      <input type="text" className="form-control" value={form.codigo} onChange={(e) => setForm({...form, codigo: e.target.value})} required />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-control" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría</label>
                      <input type="text" className="form-control" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Unidad</label>
                      <input type="text" className="form-control" value={form.unidad} onChange={(e) => setForm({...form, unidad: e.target.value})} />
                    </div>
                    {!modoEdicion && (
                      <>
                        <div className="col-md-2">
                          <label className="form-label">Stock Min</label>
                          <input type="number" className="form-control" value={form.stock_minimo} onChange={(e) => setForm({...form, stock_minimo: e.target.value})} min="1" />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Stock Actual</label>
                          <input type="number" className="form-control" value={form.stock_actual} onChange={(e) => setForm({...form, stock_actual: e.target.value})} min="0" />
                        </div>
                      </>
                    )}
                    <div className="col-md-12">
                      <label className="form-label">Descripción</label>
                      <textarea className="form-control" value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})}></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                    <button type="submit" className="btn btn-success">{modoEdicion ? "Actualizar" : "Guardar"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Eliminar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de eliminar el producto ID <strong>{idToDelete}</strong>? Esta acción es irreversible.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteConfirmation}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}