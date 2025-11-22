import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; 
// import "bootstrap-icons/font/bootstrap-icons.css"; 
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";

const API_URL = "https://backend-paws.onrender.com/api/v1";

export default function Usuarios() {
  // Eliminado useNavigate y react-router-dom para evitar errores de contexto

  const [usuarios, setUsuarios] = useState([]);
  const [usuariosOriginal, setUsuariosOriginal] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Estado para controlar si estamos editando o creando
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    id: "",
    nombre: "",
    rol: "Empleado",
    email: "",
    password: "", // Agregado para creación
  });

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const mostrarMensaje = (tipo, texto) => {
    // Aseguramos que el texto sea un string para evitar error "Objects are not valid as React child"
    const mensajeStr = typeof texto === 'object' ? JSON.stringify(texto) : String(texto);
    const options = { position: "top-center", autoClose: 5000 };
    if (tipo === "warning") toast.info(mensajeStr, options);
    if (tipo === "danger") toast.error(mensajeStr, options);
    if (tipo === "success") toast.success(mensajeStr, options);
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
  //  LÓGICA DE GENERACIÓN DE PDF (Usuarios)
  // ---------------------------------------------------------
  const generarReportePDF = async () => {
    if (usuarios.length === 0) {
      mostrarMensaje("warning", "No hay datos para generar el reporte.");
      return;
    }

    mostrarMensaje("warning", "Generando PDF de Usuarios...");

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const colorAzul = [41, 128, 185]; 
      const colorGris = [44, 62, 80];
      const colorMorado = [142, 68, 173];

      let currentY = 20; 

      // --- ENCABEZADO ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...colorAzul);
      doc.text("Reporte de Personal y Usuarios", 105, currentY, { align: "center" });
      currentY += 8;

      doc.setFontSize(10);
      doc.setTextColor(...colorGris);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, currentY, { align: "center" });
      currentY += 15; 

      // 1. GRÁFICA DE ROLES
      // Filtramos las listas
      const listaAdmins = usuarios.filter(u => u.rol === 'Administrador');
      const listaEmpleados = usuarios.filter(u => u.rol === 'Empleado');

      const adminsCount = listaAdmins.length;
      const empleadosCount = listaEmpleados.length;
      const total = usuarios.length;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. Distribucion de Roles", 14, currentY);
      currentY += 10;

      doc.setFillColor(230, 230, 230);
      doc.roundedRect(14, currentY, 180, 15, 2, 2, "F");

      const widthAdmin = total > 0 ? (adminsCount / total) * 180 : 0;
      if (widthAdmin > 0) {
        doc.setFillColor(...colorMorado);
        doc.rect(14, currentY, widthAdmin, 15, "F");
      }

      currentY += 22;
      
      doc.setFillColor(...colorMorado);
      doc.circle(20, currentY - 1, 2, "F");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Administradores: ${adminsCount} (${total > 0 ? Math.round((adminsCount/total)*100) : 0}%)`, 25, currentY);

      doc.setFillColor(200, 200, 200);
      doc.circle(90, currentY - 1, 2, "F");
      doc.text(`Empleados: ${empleadosCount} (${total > 0 ? Math.round((empleadosCount/total)*100) : 0}%)`, 95, currentY);

      currentY += 15;

      // ==========================================
      // 2. TABLA DE ADMINISTRADORES
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...colorMorado); // Título morado para admins
      doc.text("2. Lista de Administradores", 14, currentY);
      currentY += 5;

      if (listaAdmins.length > 0) {
        doc.autoTable({
            startY: currentY,
            head: [['ID', 'Nombre', 'Correo Electronico']],
            body: listaAdmins.map(u => [
            u.id,
            u.nombre,
            u.email || "Sin correo"
            ]),
            headStyles: { fillColor: colorMorado }, // Encabezado morado
            styles: { fontSize: 10 },
            theme: 'grid'
        });
        // Actualizamos currentY para que la siguiente tabla empiece después de esta
        currentY = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("No hay administradores registrados.", 14, currentY + 5);
        currentY += 20;
      }

      // Verificamos si hay espacio para la siguiente tabla, si no, nueva página
      if (currentY > 250) {
          doc.addPage();
          currentY = 20;
      }

      // ==========================================
      // 3. TABLA DE EMPLEADOS
      // ==========================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...colorAzul); // Título azul para empleados
      doc.text("3. Lista de Empleados", 14, currentY);
      currentY += 5;

      if (listaEmpleados.length > 0) {
        doc.autoTable({
            startY: currentY,
            head: [['ID', 'Nombre', 'Correo Electronico']],
            body: listaEmpleados.map(u => [
            u.id,
            u.nombre,
            u.email || "Sin correo"
            ]),
            headStyles: { fillColor: colorAzul }, // Encabezado azul
            styles: { fontSize: 10 },
            theme: 'grid'
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("No hay empleados registrados.", 14, currentY + 5);
      }

      doc.save(`Reporte_Usuarios_${new Date().toISOString().slice(0, 10)}.pdf`);
      mostrarMensaje("success", "PDF descargado correctamente.");

    } catch (error) {
      console.error("Error PDF:", error);
      mostrarMensaje("danger", "Error al generar PDF");
    }
  };

  // ---------------------------------------------------------

  // Filtros Frontend
  const aplicarFiltros = (lista = usuariosOriginal) => {
    let filtrados = lista;

    if (filtroNombre.trim() !== "") {
      filtrados = filtrados.filter((u) =>
        u.nombre && u.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    if (filtroRol.trim() !== "") {
      filtrados = filtrados.filter(
        (u) =>
          u.rol && u.rol.trim().toLowerCase() === filtroRol.trim().toLowerCase()
      );
    }

    setUsuarios(filtrados);
  };

  useEffect(() => {
    aplicarFiltros(usuariosOriginal);
  }, [usuariosOriginal, filtroNombre, filtroRol]);

  // Fetch Usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroId) filtros.id = Number(filtroId);

      const res = await fetch(`${API_URL}/usuarios/`, {
        method: "POST", // Nota: Usualmente GET para listar, pero mantenemos tu lógica POST para filtros
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros),
      });

      const data = await res.json();

      if (res.ok) {
        const lista = Array.isArray(data) ? data : (data.usuarios || []);
        setUsuariosOriginal(lista);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar usuarios");
      }
    } catch (e) {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setForm({
      id: "",
      nombre: "",
      rol: "Empleado",
      email: "",
      password: "",
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const editarUsuario = (u) => {
    setModoEdicion(true);
    setForm({
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      email: u.email || "", // Unificar campos
      password: "", // No mostramos password al editar
    });
    setShowModal(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmit = async () => {
    // Determinar URL y Método
    const url = modoEdicion 
      ? `${API_URL}/usuarios/update` 
      : `${API_URL}/usuarios/nuevo`; // Endpoint asumido para crear
    
    const method = modoEdicion ? "PUT" : "POST";

    // Preparar datos
    const payload = { ...form };
    if (modoEdicion) {
      // Al editar, enviamos email en lugar de correo si el backend lo prefiere, o ambos
      payload.email = form.email; 
      // Generalmente no enviamos password vacío al editar a menos que se cambie
      if (!payload.password) delete payload.password; 
    } else {
      // Al crear
       payload.email = form.email; 
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", modoEdicion ? "Usuario actualizado" : "Usuario creado exitosamente");
        setShowModal(false);
        fetchUsuarios();
      } else {
        mostrarMensaje("danger", data.message || "Error en la operación");
      }
    } catch (e) {
      mostrarMensaje("danger", "No se pudo conectar al servidor");
    }
  };

  // Eliminar usuario
  const solicitarConfirmacionEliminar = (id) => {
    setIdToDelete(id);
    setShowConfirmModal(true);
  };

  const ejecutarEliminacion = async () => {
    const id = idToDelete;
    setShowConfirmModal(false);
    setIdToDelete(null);

    try {
      const res = await fetch(`${API_URL}/usuarios/delete`, { // Ajuste a endpoint común de delete o mantener tu lógica
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: id, id: id }), // Enviamos ambas claves por si acaso
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", "Usuario eliminado correctamente");
        fetchUsuarios();
      } else {
        mostrarMensaje("danger", data.message || "No se pudo eliminar");
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Gestión de Usuarios</h4>

        <div>
          {/* Botón de Exportar PDF */}
          <button 
            className="btn btn-danger me-2"
            onClick={generarReportePDF}
            disabled={usuarios.length === 0}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
          </button>

          <button
            className="btn btn-success"
            onClick={abrirModalCrear}
          >
            <i className="bi bi-plus-circle me-2"></i>Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-3 shadow-sm mb-4">
        <h6 className="fw-bold mb-3 text-secondary">Filtros</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Buscar por ID</label>
            <div className="input-group">
              <input
                className="form-control"
                value={filtroId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) setFiltroId(value);
                }}
                placeholder="Ingrese ID"
                inputMode="numeric"
              />
              <button className="btn btn-primary" onClick={fetchUsuarios}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          <div className="col-md-8">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Filtrar por nombre"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
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
                <th>Rol</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id || Math.random()}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.rol}</td>
                    <td>{u.email || ""}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editarUsuario(u)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => solicitarConfirmacionEliminar(u.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{modoEdicion ? "Editar Usuario" : "Crear Nuevo Usuario"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={form.rol}
                      onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    >
                      <option value="Empleado">Empleado</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>

                  {/* Campo Password solo visible al crear o si se desea editar (opcional) */}
                  {!modoEdicion && (
                    <div className="col-md-6">
                      <label className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Ingrese contraseña temporal"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                   {modoEdicion ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar al usuario con ID <b>{idToDelete}</b>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={ejecutarEliminacion} disabled={!idToDelete}>
            <i className="bi bi-trash me-2"></i>Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}