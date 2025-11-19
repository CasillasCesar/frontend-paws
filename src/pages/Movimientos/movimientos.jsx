import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Datos cargados
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Usuario logeado
  const usuarioLogeado = JSON.parse(localStorage.getItem("userData"));

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

  const mostrarMensaje = (tipo, texto) => {
    switch (tipo) {
      case "warning":
        toast.info(texto);
        break;
      case "danger":
        toast.error(texto);
        break;
      case "success":
        toast.success(texto);
        break;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchProductos();
    fetchProveedores();
    fetchClientes();

    if (usuarioLogeado) {
      setForm((f) => ({
        ...f,
        id_usuario: usuarioLogeado.id,
        responsable: usuarioLogeado.nombre,
      }));
    }
  }, []);

  // === FETCHS ===
  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (res.ok) {
        const lista = data.products || data.productos || data.data || data;
        setProductos(Array.isArray(lista) ? lista : []);
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const data = await res.json();

      if (res.ok) {
        const lista = data.proveedores || data.data || data;
        setProveedores(Array.isArray(lista) ? lista : []);
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();

      if (res.ok) {
        const lista = data.clientes || data.data || data;
        setClientes(Array.isArray(lista) ? lista : []);
      }
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // HISTORIAL
  // =======================
  const fetchHistorial = async () => {
    const idProductoNumber = Number(form.id_producto);

    if (!idProductoNumber || idProductoNumber <= 0) {
      mostrarMensaje("warning", "Seleccione un producto válido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/movimientos/historial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: idProductoNumber }),
      });

      const data = await res.json();
      if (res.ok) setMovimientos(data.movimientos);
      else mostrarMensaje("danger", data.message);
    } catch {
      mostrarMensaje("danger", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // REGISTRO MOVIMIENTO
  // =======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      tipo: form.tipo,
      id_producto: Number(form.id_producto),
      cantidad: Number(form.cantidad),
      referencia: form.referencia || null,
      responsable: form.responsable,
      id_usuario: Number(form.id_usuario),
    };

    if (form.tipo === "Entrada") {
      body.id_proveedor = Number(form.id_proveedor);
    }

    if (form.tipo === "Salida") {
      body.id_cliente = Number(form.id_cliente);
    }

    // LIMPIAR CAMPOS NO NECESARIOS
    if (form.tipo === "Entrada") delete body.id_cliente;
    if (form.tipo === "Salida") delete body.id_proveedor;

    console.log("BODY ENVIADO:", body);

    try {
      const res = await fetch(`${API_URL}/movimientos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        mostrarMensaje("success", data.message);
        setShowModal(false);
        fetchHistorial();
      } else {
        mostrarMensaje("danger", data.message);
      }
    } catch {
      mostrarMensaje("danger", "No se pudo enviar la información");
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
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Movimientos de Inventario</h4>

        <button
          className="btn btn-success"
          onClick={() => {
            setShowModal(true);
            setForm({
              tipo: "Entrada",
              id_producto: "",
              cantidad: "",
              referencia: "",
              responsable: usuarioLogeado?.nombre || "",
              id_proveedor: "",
              id_cliente: "",
              id_usuario: usuarioLogeado?.id || "",
            });
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>Registrar Movimiento
        </button>
      </div>

      {/* Consultar historial */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-bold text-secondary">Historial por producto</h6>

        <div className="d-flex gap-2">
          {/* SELECT DE PRODUCTOS */}
          <select
            className="form-select"
            value={form.id_producto}
            onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
          >
            <option value="">Seleccione un producto</option>
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={fetchHistorial}>
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-bold text-secondary">Filtros</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option key="vacio" value=""></option>
              <option key="entrada" value="Entrada">
                Entrada
              </option>
              <option key="salida" value="Salida">
                Salida
              </option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Responsable</label>
            <input
              className="form-control"
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Referencia</label>
            <input
              className="form-control"
              value={filtroReferencia}
              onChange={(e) => setFiltroReferencia(e.target.value)}
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
        <div className="table-responsive shadow-sm">
          <table className="table table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
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
                    <td
                      className={
                        m.tipo === "Salida"
                          ? "text-danger fw-bold"
                          : "text-success fw-bold"
                      }
                    >
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

      {/* ============================
          MODAL DE REGISTRO
      ============================ */}
      {showModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Registrar Movimiento</h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body row g-3">
                    {/* Tipo */}
                    <div className="col-md-4">
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-select"
                        value={form.tipo}
                        onChange={(e) =>
                          setForm({ ...form, tipo: e.target.value })
                        }
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Salida">Salida</option>
                      </select>
                    </div>

                    {/* PRODUCTO */}
                    <div className="col-md-4">
                      <label className="form-label">Producto</label>
                      <select
                        className="form-select"
                        value={form.id_producto}
                        onChange={(e) =>
                          setForm({ ...form, id_producto: e.target.value })
                        }
                      >
                        <option value="">Seleccione un producto</option>
                        {productos.map((p) => (
                          <option key={p.id_producto} value={p.id_producto}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="col-md-4">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={form.cantidad}
                        onChange={(e) =>
                          setForm({ ...form, cantidad: e.target.value })
                        }
                      />
                    </div>

                    {/* PROVEEDOR */}
                    {form.tipo === "Entrada" && (
                      <div className="col-md-6">
                        <label className="form-label">Proveedor</label>
                        <select
                          className="form-select"
                          value={form.id_proveedor}
                          onChange={(e) =>
                            setForm({ ...form, id_proveedor: e.target.value })
                          }
                        >
                          <option value="">Seleccione proveedor</option>
                          {proveedores.map((prov) => (
                            <option
                              key={prov.id_proveedor}
                              value={prov.id_proveedor}
                            >
                              {prov.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* CLIENTE */}
                    {form.tipo === "Salida" && (
                      <div className="col-md-6">
                        <label className="form-label">Cliente</label>
                        <select
                          className="form-select"
                          value={form.id_cliente}
                          onChange={(e) =>
                            setForm({ ...form, id_cliente: e.target.value })
                          }
                        >
                          <option value="">Seleccione cliente</option>
                          {clientes.map((c) => (
                            <option key={c.id_cliente} value={c.id_cliente}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Responsable */}
                    <div className="col-md-6">
                      <label className="form-label">Responsable</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.responsable}
                        disabled
                      />
                    </div>

                    {/* Referencia */}
                    <div className="col-md-12">
                      <label className="form-label">Referencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.referencia}
                        onChange={(e) =>
                          setForm({ ...form, referencia: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
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
