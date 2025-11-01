import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
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

  // 🔹 Mostrar mensaje temporal
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 4000);
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
        mostrarMensaje("danger", data.message || "Error al cargar productos");
      }
    } catch (error) {
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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message || "Operación exitosa");
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
        fetchProductos();
      } else {
        // Mostrar mensajes de error del backend
        mostrarMensaje(
          "danger",
          data.details ? `${data.message}: ${data.details}` : data.message
        );
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
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
        mostrarMensaje("success", data.message || "Producto eliminado");
        fetchProductos();
      } else {
        mostrarMensaje(
          "danger",
          data.details ? `${data.message}: ${data.details}` : data.message
        );
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    }
  };

  // 🔹 Editar producto
  const editarProducto = (p) => {
    setModoEdicion(true);
    setForm(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        mostrarMensaje("success", data.message || "Estado actualizado");
        fetchProductos();
      } else {
        mostrarMensaje(
          "danger",
          data.details ? `${data.message}: ${data.details}` : data.message
        );
      }
    } catch {
      mostrarMensaje("danger", "No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-row p-0">
      <main className="flex-grow-1 p-4 bg-white overflow-auto">
        {/* Mensaje del servidor */}
        {mensaje.texto && (
          <div className={`alert alert-${mensaje.tipo} text-center fw-semibold`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              {modoEdicion ? "Editar Producto" : "Nuevo Producto"}
            </h5>
            <form onSubmit={handleSubmit} className="row g-3">
              {modoEdicion && (
                <div className="col-md-2">
                  <label className="form-label">ID</label>
                  <input type="text" className="form-control" value={form.id_producto} disabled />
                </div>
              )}

              <div className="col-md-2">
                <label className="form-label">Código</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
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

              <div className="col-md-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                ></textarea>
              </div>

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success me-2">
                  <i className="bi bi-save me-1"></i> {modoEdicion ? "Actualizar" : "Guardar"}
                </button>
                {modoEdicion && (
                  <button
                    type="button"
                    className="btn btn-secondary"
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
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tabla de productos */}
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length > 0 ? (
                  productos.map((p) => (
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
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editarProducto(p)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger me-2" onClick={() => eliminarProducto(p.id_producto)}>
                          <i className="bi bi-trash"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => cambiarEstado(p.id_producto, p.activo)}>
                          <i className={`bi ${p.activo ? "bi-toggle2-on text-success" : "bi-toggle2-off text-secondary"}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
