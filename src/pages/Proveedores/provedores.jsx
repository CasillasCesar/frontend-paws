import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Toast importation
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

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
    // setMensaje({ tipo, texto, detalles });
    // setTimeout(() => setMensaje({ tipo: "", texto: "", detalles: "" }), 6000);
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

  // 🔹 Eliminar proveedor
  const eliminarProveedor = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;

    try {
      const res = await fetch(`${API_URL}/proveedores/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_proveedor: id }),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message);
        fetchProveedores();
      } else {
        mostrarMensaje("danger", data.message);
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
                        onClick={() => eliminarProveedor(p.id_proveedor)}
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
          <div className="modal fade show d-block" tabIndex="-1">
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
    </div>
  );
}
