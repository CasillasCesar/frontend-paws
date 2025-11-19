import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";

const API_URL = "https://backend-paws.onrender.com/api/v1";

export default function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [usuariosOriginal, setUsuariosOriginal] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: "",
    nombre: "",
    rol: "",
    correo: "",
    // password: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const mostrarMensaje = (tipo, texto) => {
    const options = { position: "top-center", autoClose: 5000 };
    if (tipo === "warning") toast.info(texto, options);
    if (tipo === "danger") toast.error(texto, options);
    if (tipo === "success") toast.success(texto, options);
  };

  // ⭐ Aplicar filtros del frontend
  const aplicarFiltros = (lista = usuariosOriginal) => {
    let filtrados = lista;

    if (filtroNombre.trim() !== "") {
      filtrados = filtrados.filter((u) =>
        u.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    if (filtroRol.trim() !== "") {
      filtrados = filtrados.filter(
        (u) =>
          u.rol?.trim().toLowerCase() === filtroRol.trim().toLowerCase()
      );
    }

    setUsuarios(filtrados);
  };

  // ⭐ Reaplicar filtros cuando cambie algo
  useEffect(() => {
    aplicarFiltros(usuariosOriginal);
  }, [usuariosOriginal, filtroNombre, filtroRol]);

  // ⭐ Obtener usuarios del backend filtrando SOLO por ID
  const fetchUsuarios = async () => {
    setLoading(true);

    try {
      const filtros = {};
      if (filtroId) filtros.id = Number(filtroId);

      const res = await fetch(`${API_URL}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros),
      });

      const data = await res.json();

      if (res.ok) {
        const lista = Array.isArray(data) ? data : [];
        setUsuariosOriginal(lista);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar usuarios");
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Modal editar
  const editarUsuario = (u) => {
    setForm({
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      email: u.email,
      // password: "",
    });
    setShowModal(true);
  };

  // Actualizar usuario
  const actualizarUsuario = async () => {
    console.log(form);
    
    try {
      const res = await fetch(`${API_URL}/usuarios/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", "Usuario actualizado correctamente");
        setShowModal(false);
        fetchUsuarios();
      } else {
        mostrarMensaje("danger", data.message || "Error al actualizar");
      }
    } catch {
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
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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

        <button
          className="btn btn-success"
          onClick={() => navigate("/crearUsuario")}
        >
          <i className="bi bi-plus-circle me-2"></i>Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-3 shadow-sm mb-4">
        <h6 className="fw-bold mb-3 text-secondary">Filtros</h6>

        <div className="row g-3">
          {/* FILTRO POR ID */}
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

          {/* FILTROS LOCALES */}
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
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.rol}</td>
                    <td>{u.email}</td>

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
                  <td colSpan="7" className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Editar Usuario</h5>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <input
                    className="form-control"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={form.rol}
                    onChange={(e) =>
                      setForm({ ...form, rol: e.target.value })
                    }
                  >
                    <option value="Empleado">Empleado</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button className="btn btn-primary" onClick={actualizarUsuario}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas eliminar al usuario con ID{" "}
            <b>{idToDelete}</b>? Esta acción no se puede deshacer.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
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
