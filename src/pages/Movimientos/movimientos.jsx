import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "", detalles: "" });
  const [showModal, setShowModal] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(true);

  const [form, setForm] = useState({
    tipo: "Entrada",
    id_producto: "",
    cantidad: "",
    referencia: "",
    responsable: "",
    id_proveedor: "",
    id_cliente: "",
    id_usuario: "",
  });

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");

  const mostrarMensaje = (tipo, texto, detalles = "") => {
    setMensaje({ tipo, texto, detalles });
    setTimeout(() => setMensaje({ tipo: "", texto: "", detalles: "" }), 6000);
  };

  // Obtener historial
  const fetchHistorial = async () => {
    if (!form.id_producto) {
      mostrarMensaje("warning", "Ingresa un ID de producto para ver su historial");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/movimientos/historial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: form.id_producto }),
      });

      const data = await res.json();

      if (res.ok) {
        setMovimientos(data.movimientos);
      } else {
        mostrarMensaje("danger", data.message, data.details);
      }
    } catch (err) {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Registrar movimiento
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_usuario) {
      mostrarMensaje("danger", "Debes especificar el ID del usuario responsable");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/movimientos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message);
        setShowModal(false);
        fetchHistorial();
      } else {
        mostrarMensaje("danger", data.message, data.details);
      }
    } catch {
      mostrarMensaje("danger", "Error al enviar los datos");
    }
  };

  const movimientosFiltrados = movimientos.filter(
    (m) =>
      m.tipo.toLowerCase().includes(filtroTipo.toLowerCase()) &&
      m.responsable.toLowerCase().includes(filtroResponsable.toLowerCase()) &&
      String(m.referencia || "")
        .toLowerCase()
        .includes(filtroReferencia.toLowerCase())
  );

  return (
    <div className="container-fluid p-4 bg-white vh-100 overflow-auto">

      {/* Mensaje Superior */}
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} text-center fw-semibold`}>
          {mensaje.texto}
          {mensaje.detalles && <div className="small text-muted">{mensaje.detalles}</div>}
        </div>
      )}

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Movimientos de Inventario</h4>

        <button
          className="btn btn-success"
          onClick={() => {
            setShowModal(true);
            setModoRegistro(true);
            setForm({
              tipo: "Entrada",
              id_producto: "",
              cantidad: "",
              referencia: "",
              responsable: "",
              id_proveedor: "",
              id_cliente: "",
              id_usuario: "",
            });
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>Registrar Movimiento
        </button>
      </div>

      {/* Buscar historial */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-bold text-secondary">Consultar historial por ID de producto</h6>
        <div className="d-flex gap-2">
          <input
            type="number"
            className="form-control"
            placeholder="ID del producto"
            value={form.id_producto}
            onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
          />
          <button className="btn btn-primary" onClick={fetchHistorial}>
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-bold text-secondary">Filtros de búsqueda</h6>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Tipo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Entrada / Salida"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Responsable</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Juan Pérez"
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Referencia</label>
            <input
              type="text"
              className="form-control"
              placeholder="Factura, ticket..."
              value={filtroReferencia}
              onChange={(e) => setFiltroReferencia(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla historial */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID Movimiento</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Referencia</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td>{m.id_movimiento}</td>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                    <td className={m.tipo === "Salida" ? "text-danger fw-bold" : "text-success fw-bold"}>
                      {m.tipo}
                    </td>
                    <td>{m.cantidad}</td>
                    <td>{m.referencia || "—"}</td>
                    <td>{m.responsable}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No hay movimientos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Registro */}
      {showModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">

                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Registrar Movimiento</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">

                    <div className="col-md-4">
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-select"
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Salida">Salida</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">ID Producto</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.id_producto}
                        onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.cantidad}
                        onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                      />
                    </div>

                    {form.tipo === "Entrada" && (
                      <div className="col-md-6">
                        <label className="form-label">ID Proveedor</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.id_proveedor}
                          onChange={(e) => setForm({ ...form, id_proveedor: e.target.value })}
                        />
                      </div>
                    )}

                    {form.tipo === "Salida" && (
                      <div className="col-md-6">
                        <label className="form-label">ID Cliente</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.id_cliente}
                          onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label">ID Usuario (responsable)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.id_usuario}
                        onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Referencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.referencia}
                        onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Responsable</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.responsable}
                        onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)} type="button">
                      Cerrar
                    </button>
                    <button className="btn btn-success" type="submit">
                      <i className="bi bi-save me-1"></i> Guardar Movimiento
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
