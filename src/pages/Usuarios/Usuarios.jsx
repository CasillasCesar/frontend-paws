import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = "https://backend-paws.onrender.com/api/v1";

export default function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "", detalles: "" });

  const [form, setForm] = useState({
    id_usuario: "",
    nombre: "",
    usuario: "",
    rol: "",
    correo: "",
    telefono: "",
    password: "",
  });

  const [showModal, setShowModal] = useState(false);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const mostrarMensaje = (tipo, texto, detalles = "") => {
    setMensaje({ tipo, texto, detalles });
    setTimeout(() => setMensaje({ tipo: "", texto: "", detalles: "" }), 6000);
  };

  // Obtener usuarios
  const fetchUsuarios = async () => {
    setLoading(true);

    try {
      const filtros = {};

      if (filtroId) filtros.id = Number(filtroId);
      if (filtroNombre) filtros.nombre = filtroNombre;
      if (filtroUsuario) filtros.usuario = filtroUsuario;
      if (filtroRol) filtros.rol = filtroRol;

      const res = await fetch(`${API_URL}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros),
      });

      const data = await res.json();

      if (res.ok) {
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar usuarios");
      }
    } catch (error) {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Abrir modal editar
  const editarUsuario = (u) => {
    setForm({
      id_usuario: u.id,
      nombre: u.nombre,
      usuario: u.usuario,
      rol: u.rol,
      correo: u.email,
      telefono: u.telefono,
      password: "",
    });
    setShowModal(true);
  };

  // Actualizar usuario
  const actualizarUsuario = async () => {
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
  // Eliminar usuario (CORREGIDO)
  const eliminarUsuario = async (id) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario con ID ${id}?`))
      return;

    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // <= AQUÍ tu backend sí elimina
      });

      const data = await res.json();

      if (res.ok && data.success) {
        mostrarMensaje("success", "Usuario eliminado correctamente");
        fetchUsuarios(); // recargar tabla
      } else {
        mostrarMensaje(
          "danger",
          data.message || "No se pudo eliminar el usuario"
        );
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      mostrarMensaje("danger", "Error al conectar con el servidor");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} text-center fw-semibold`}>
          {mensaje.texto}
          {mensaje.detalles && (
            <div className="small text-muted mt-1">{mensaje.detalles}</div>
          )}
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Gestión de Usuarios</h4>

        <button
          className="btn btn-success"
          onClick={() => navigate("/crearUsuario")}
        >
          <i className="bi bi-plus-circle me-2"></i>Nuevo Usuario
        </button>
      </div>

      {/* FILTROS */}
      <div className="card p-3 shadow-sm mb-4">
        <h6 className="fw-bold mb-3 text-secondary">Filtros</h6>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">ID</label>
            <input
              className="form-control"
              value={filtroId}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) setFiltroId(value);
              }}
              inputMode="numeric"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Usuario</label>
            <input
              className="form-control"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Rol</label>
            <input
              className="form-control"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            />
          </div>

          <div className="col-12 text-end mt-3">
            <button className="btn btn-primary px-4" onClick={fetchUsuarios}>
              <i className="bi bi-search me-2"></i>Buscar
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
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
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.usuario}</td>
                    <td>{u.nombre}</td>
                    <td>{u.rol}</td>
                    <td>{u.email}</td>
                    <td>{u.telefono}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editarUsuario(u)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarUsuario(u.id)}
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

      {/* MODAL EDITAR */}
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
                <div className="col-md-6">
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
                  <label className="form-label">Usuario</label>
                  <input
                    className="form-control"
                    value={form.usuario}
                    onChange={(e) =>
                      setForm({ ...form, usuario: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <input
                    className="form-control"
                    value={form.correo}
                    onChange={(e) =>
                      setForm({ ...form, correo: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-control"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rol</label>
                  <input
                    className="form-control"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
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
    </div>
  );
}
