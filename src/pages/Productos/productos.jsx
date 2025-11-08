import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = import.meta.env.VITE_API_URL;

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

  // 🔹 Filtros individuales
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // 🔹 Mostrar mensaje temporal con detalles opcionales
  const mostrarMensaje = (tipo, texto, detalles = "") => {
    setMensaje({ tipo, texto, detalles });
    setTimeout(() => setMensaje({ tipo: "", texto: "", detalles: "" }), 6000);
  };

  // 🔹 Obtener productos
  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (res.ok) {
        setProductos(data.products || []);
      } else {
        mostrarMensaje("danger", data.message || "Error al cargar productos", data.details || "");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 🔹 Crear o actualizar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = modoEdicion
      ? `${API_URL}/products/update`
      : `${API_URL}/products/nuevo`;
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message || "Operación exitosa", data.details || "");
        setForm({
          id_producto: "",
          codigo: "",
          nombre: "",
          descripcion: "",
          categoria: "",
          unidad: "",
          stock_minimo: "",
          stock_actual: "",
        });
        setModoEdicion(false);
        setShowModal(false);
        fetchProductos();
      } else {
        mostrarMensaje("danger", data.message || "Error en la operación", data.details || "");
      }
    } catch {
      mostrarMensaje("danger", "Error de conexión con el servidor");
    }
  };

  // 🔹 Eliminar producto
  const eliminarProducto = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_URL}/products/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: id }),
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje("success", data.message || "Producto eliminado", data.details || "");
        fetchProductos();
      } else {
        mostrarMensaje("danger", data.message || "Error al eliminar producto", data.details || "");
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    }
  };

  // 🔹 Editar producto
  const editarProducto = (p) => {
    setModoEdicion(true);
    setForm(p);
    setShowModal(true);
  };

  // 🔹 Cambiar estado activo/inactivo
  const cambiarEstado = async (id, activo) => {
    try {
      const res = await fetch(`${API_URL}/products/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: id, activo: activo ? 0 : 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje("success", data.message || "Estado actualizado", data.details || "");
        setProductos((prev) =>
          prev.map((p) =>
            p.id_producto === id ? { ...p, activo: activo ? 0 : 1 } : p
          )
        );
      } else {
        mostrarMensaje("danger", data.message || "Error al actualizar estado", data.details || "");
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    }
  };

  // 🔹 Filtrar productos
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      p.codigo?.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      p.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
  );

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-4 bg-white overflow-auto">
      {/* Mensaje superior */}
      {mensaje.texto && (
        <div
          className={`alert alert-${mensaje.tipo} text-center fw-semibold alerta-superior`}
          role="alert"
        >
          <div>{mensaje.texto}</div>
          {mensaje.detalles && (
            <div className="small mt-1 text-muted">{mensaje.detalles}</div>
          )}
        </div>
      )}

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary mb-0">Gestión de Productos</h4>
        <button
          className="btn btn-success"
          onClick={() => {
            setModoEdicion(false);
            setForm({
              id_producto: "",
              codigo: "",
              nombre: "",
              descripcion: "",
              categoria: "",
              unidad: "",
              stock_minimo: "",
              stock_actual: "",
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm p-3">
        <h6 className="fw-bold mb-3 text-secondary">Filtros de búsqueda</h6>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Buscar por nombre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Zapato, Monitor..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Buscar por código</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. P001, ABC123..."
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Buscar por categoría</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Electrónica, Ropa..."
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
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
                    <td>{p.unidad}</td>
                    <td className={p.stock_actual < p.stock_minimo ? "text-danger fw-bold" : ""}>
                      {p.stock_actual}
                    </td>
                    <td>{p.stock_minimo}</td>
                    <td>
                      {p.activo ? (
                        <span className="badge bg-success">Activo</span>
                      ) : (
                        <span className="badge bg-secondary">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editarProducto(p)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger me-2"
                        onClick={() => eliminarProducto(p.id_producto)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => cambiarEstado(p.id_producto, p.activo)}
                      >
                        <i
                          className={`bi ${
                            p.activo ? "bi-toggle2-on text-success" : "bi-toggle2-off text-secondary"
                          }`}
                        ></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                {/* Encabezado */}
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {modoEdicion ? "Editar Producto" : "Nuevo Producto"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                {/* Mensaje del backend */}
                {mensaje.texto && (
                  <div className={`alert alert-${mensaje.tipo} text-center fw-semibold m-3`}>
                    <div>{mensaje.texto}</div>
                    {mensaje.detalles && (
                      <div className="small mt-1 text-muted">{mensaje.detalles}</div>
                    )}
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    {modoEdicion && (
                      <div className="col-md-2">
                        <label className="form-label">ID</label>
                        <input type="text" className="form-control" value={form.id_producto} disabled />
                      </div>
                    )}
                    <div className="col-md-3">
                      <label className="form-label">Código</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.codigo}
                        onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Unidad</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.unidad}
                        onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                      />
                    </div>
                    {!modoEdicion && (
                      <>
                        <div className="col-md-2">
                          <label className="form-label">Stock Mínimo</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.stock_minimo}
                            onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Stock Actual</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.stock_actual}
                            onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                    <div className="col-md-12">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
