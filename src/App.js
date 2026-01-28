import React, { useState } from 'react';

function App() {
  // --- ESTADOS DE CONTROL DE SESIÓN Y UI ---
  const [esAdmin, setEsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [mostrarModalPass, setMostrarModalPass] = useState(false);
  const [filtroDescarga, setFiltroDescarga] = useState({ inicio: '', fin: '' });
  const [editandoId, setEditandoId] = useState(null);

  const PASSWORD_CORRECTA = "Admin1234";

  // --- CONFIGURACIÓN DE LA CLÍNICA ---
  const doctoresClinica = [
    "Dr. Miguel Angel Rivera Puente (Medicina Psiquiatra)",
    "Psi. Roberto Moreno Topete (Psicologo)"
  ];

  const horariosBase = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "16:00", "17:00", "18:00", "19:00"
  ];

  const initialFormState = {
    doctor: '', 
    nombre: '', 
    correo: '', 
    telefono: '', 
    fechaCita: '', 
    horaCita: '', 
    requiereFactura: false,
    rfc: '', 
    razonSocial: '', 
    cp: '', 
    regimenFiscal: '',
    usoCFDI: '', 
    calle: '', 
    numero: '', 
    colonia: '', 
    estado: '', 
    municipio: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [citasRegistradas, setCitasRegistradas] = useState([]);
  
  // Estado para la herramienta de bloqueo masivo del administrador
  const [bloqueoMasivo, setBloqueoMasivo] = useState({
    doctor: '',
    fecha: '',
    horasSeleccionadas: []
  });

  // --- LÓGICA DE VALIDACIÓN DE TIEMPO ---
  const hoy = new Date().toISOString().split('T')[0];

  const esFinDeSemana = (fechaStr) => {
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr + 'T00:00:00');
    const dia = fecha.getDay(); 
    return (dia === 0 || dia === 6); // 0 es Domingo, 6 es Sábado
  };

  const esFechaPasada = (fechaStr) => {
    if (!fechaStr) return false;
    return fechaStr < hoy;
  };

  // --- FUNCIONES DE ADMINISTRACIÓN Y SEGURIDAD ---
  const manejarLoginAdmin = () => {
    if (passwordInput === PASSWORD_CORRECTA) {
      setEsAdmin(true);
      setMostrarModalPass(false);
      setPasswordInput('');
    } else {
      alert("Contraseña incorrecta. Intente de nuevo.");
    }
  };

  const toggleHoraBloqueo = (hora) => {
    const actuales = bloqueoMasivo.horasSeleccionadas;
    if (actuales.includes(hora)) {
      setBloqueoMasivo({
        ...bloqueoMasivo, 
        horasSeleccionadas: actuales.filter(h => h !== hora)
      });
    } else {
      setBloqueoMasivo({
        ...bloqueoMasivo, 
        horasSeleccionadas: [...actuales, hora]
      });
    }
  };

  const ejecutarBloqueoMasivo = () => {
    const { doctor, fecha, horasSeleccionadas } = bloqueoMasivo;
    if (!doctor || !fecha || horasSeleccionadas.length === 0) {
      alert("Por favor complete Doctor, Fecha y seleccione al menos un horario.");
      return;
    }
    if (esFinDeSemana(fecha) || esFechaPasada(fecha)) {
      alert("No se pueden bloquear fines de semana o fechas pasadas.");
      return;
    }

    const nuevosBloqueos = horasSeleccionadas.map(hora => ({
      id: Date.now() + Math.random(),
      doctor,
      nombre: "🚫 BLOQUEO ADMINISTRATIVO",
      fecha,
      hora,
      estatus: 'BLOQUEADO',
      metodoPagoActual: 'N/A',
      requiereFactura: false
    }));

    setCitasRegistradas([...citasRegistradas, ...nuevosBloqueos]);
    setBloqueoMasivo({ ...bloqueoMasivo, horasSeleccionadas: [] });
    alert("Horarios bloqueados exitosamente en la agenda.");
  };

  // --- LÓGICA DE CITAS ---
  const obtenerHorasDisponibles = (doc, fecha) => {
    if (!doc || !fecha || esFinDeSemana(fecha) || esFechaPasada(fecha)) return [];
    return horariosBase.filter(hora => 
      !citasRegistradas.some(c => 
        c.fecha === fecha && 
        c.hora === hora && 
        c.doctor === doc && 
        c.id !== editandoId
      )
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (esFinDeSemana(formData.fechaCita) || esFechaPasada(formData.fechaCita)) {
      alert("La fecha seleccionada no es válida (Fin de semana o fecha pasada).");
      return;
    }

    const dataFinal = { 
      ...formData, 
      fecha: formData.fechaCita, 
      hora: formData.horaCita 
    };

    if (editandoId) {
      setCitasRegistradas(citasRegistradas.map(c => 
        c.id === editandoId ? { ...dataFinal, id: editandoId, estatus: c.estatus, metodoPagoActual: c.metodoPagoActual } : c
      ));
      setEditandoId(null);
      alert("Cita actualizada correctamente.");
    } else {
      setCitasRegistradas([
        ...citasRegistradas, 
        { ...dataFinal, id: Date.now(), estatus: 'Pendiente', metodoPagoActual: 'Pendiente' }
      ]);
      alert("Cita agendada con éxito.");
    }
    setFormData(initialFormState);
  };

  // --- ACCIONES DEL ADMINISTRADOR ---
  const marcarComoPagado = (id, metodo) => {
    setCitasRegistradas(citasRegistradas.map(c => 
      c.id === id ? { ...c, estatus: 'Pagado', metodoPagoActual: metodo } : c
    ));
  };

  const reabrirPago = (id) => {
    setCitasRegistradas(citasRegistradas.map(c => 
      c.id === id ? { ...c, estatus: 'Pendiente', metodoPagoActual: 'Pendiente' } : c
    ));
  };

  const eliminarRegistro = (id) => {
    if (window.confirm("¿Seguro que desea eliminar este registro permanentemente?")) {
      setCitasRegistradas(citasRegistradas.filter(c => c.id !== id));
    }
  };

  const prepararEdicion = (cita) => {
    setEditandoId(cita.id);
    setFormData({ 
      ...cita, 
      fechaCita: cita.fecha, 
      horaCita: cita.hora 
    });
    window.scrollTo(0, 0);
  };

  const descargarExcel = () => {
    if (!filtroDescarga.inicio || !filtroDescarga.fin) {
      alert("Por favor seleccione un rango de fechas para exportar.");
      return;
    }
    
    const filtradas = citasRegistradas.filter(c => 
      c.fecha >= filtroDescarga.inicio && 
      c.fecha <= filtroDescarga.fin && 
      c.estatus !== 'BLOQUEADO'
    );

    if (filtradas.length === 0) {
      alert("No hay citas pagadas o pendientes en este rango de fechas.");
      return;
    }

    const headers = [
      "ID", "Doctor", "Paciente", "Correo", "Telefono", "Fecha", "Hora", 
      "Estatus", "Metodo Pago", "Factura", "RFC", "Razon Social", "CP", 
      "Regimen Fiscal", "Uso CFDI", "Calle", "Numero", "Colonia", "Estado", "Municipio"
    ];

    const filas = filtradas.map(c => [
      c.id, c.doctor, c.nombre, c.correo, c.telefono, c.fecha, c.hora, 
      c.estatus, c.metodoPagoActual, c.requiereFactura ? 'SI' : 'NO',
      c.rfc || '', c.razonSocial || '', c.cp || '', c.regimenFiscal || '', 
      c.usoCFDI || '', c.calle || '', c.numero || '', c.colonia || '', 
      c.estado || '', c.municipio || ''
    ]);

    let csvContent = "\uFEFF" + headers.join(",") + "\n" + filas.map(f => f.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Clinica_${filtroDescarga.inicio}_al_${filtroDescarga.fin}.csv`;
    link.click();
  };

  return (
    <div className="container my-5">
      {/* BOTÓN DE ACCESO ADMIN */}
      <div className="d-flex justify-content-end mb-4">
        {!esAdmin ? (
          <button className="btn btn-outline-dark btn-sm" onClick={() => setMostrarModalPass(true)}>
            🔑 Acceso Admin
          </button>
        ) : (
          <button className="btn btn-danger btn-sm" onClick={() => setEsAdmin(false)}>
            🔒 Cerrar Sesión Admin
          </button>
        )}
      </div>

      {/* MODAL DE CONTRASEÑA */}
      {mostrarModalPass && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{background: 'rgba(0,0,0,0.8)', zIndex: 1050}}>
          <div className="bg-white p-4 rounded shadow-lg text-center" style={{maxWidth: '350px'}}>
            <h4 className="mb-3">Panel Privado</h4>
            <input 
              type="password" 
              className="form-control mb-3" 
              placeholder="Contraseña" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && manejarLoginAdmin()}
            />
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={manejarLoginAdmin}>Entrar</button>
              <button className="btn btn-link btn-sm text-muted" onClick={() => setMostrarModalPass(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE BLOQUEO MASIVO (SÓLO ADMIN) */}
      {esAdmin && (
        <div className="card border-danger mb-5 shadow-sm">
          <div className="card-header bg-danger text-white">
            <strong>🚫 Herramienta de Bloqueo Masivo (Lunes a Viernes)</strong>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-bold small">1. Seleccionar Doctor</label>
                <select className="form-select" value={bloqueoMasivo.doctor} onChange={(e) => setBloqueoMasivo({...bloqueoMasivo, doctor: e.target.value})}>
                  <option value="">Seleccione un médico...</option>
                  {doctoresClinica.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">2. Seleccionar Fecha</label>
                <input type="date" className="form-control" min={hoy} value={bloqueoMasivo.fecha} onChange={(e) => setBloqueoMasivo({...bloqueoMasivo, fecha: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">3. Marcar Horarios a Cerrar</label>
                <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light">
                  {horariosBase.map(h => (
                    <div key={h} className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="checkbox" id={`block-${h}`} checked={bloqueoMasivo.horasSeleccionadas.includes(h)} onChange={() => toggleHoraBloqueo(h)} />
                      <label className="form-check-label small" htmlFor={`block-${h}`}>{h}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn btn-danger mt-3 w-100 fw-bold" onClick={ejecutarBloqueoMasivo}>BLOQUEAR AGENDA PARA ESTE DÍA</button>
          </div>
        </div>
      )}

      {/* FORMULARIO DE AGENDAMIENTO PARA PACIENTES */}
      <div className="card shadow-lg mb-5 border-0">
        <div className={`card-header ${editandoId ? 'bg-warning text-dark' : 'bg-primary text-white'} text-center py-3`}>
          <h2 className="mb-0">{editandoId ? '📝 Editando Registro de Cita' : '📅 Sistema de Citas Médicas'}</h2>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <h4 className="text-primary mb-3 border-bottom pb-2">1. Información de la Cita</h4>
            <div className="row g-3 mb-4">
              <div className="col-md-12">
                <label className="form-label fw-bold">Médico Especialista *</label>
                <select className="form-select border-primary" name="doctor" value={formData.doctor} onChange={handleChange} required>
                  <option value="">Haga clic para seleccionar médico...</option>
                  {doctoresClinica.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              </div>
              <div className="col-md-4"><label className="form-label fw-bold">Nombre del Paciente *</label><input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Correo Electrónico *</label><input type="email" className="form-control" name="correo" value={formData.correo} onChange={handleChange} required /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Teléfono de Contacto *</label><input type="tel" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} required /></div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Fecha de la Cita (Lunes a Viernes) *</label>
                <input 
                  type="date" 
                  className={`form-control ${esFinDeSemana(formData.fechaCita) || esFechaPasada(formData.fechaCita) ? 'is-invalid' : ''}`} 
                  name="fechaCita" 
                  min={hoy} 
                  value={formData.fechaCita} 
                  onChange={handleChange} 
                  required 
                />
                <div className="invalid-feedback">Lo sentimos, no hay citas en fines de semana o fechas pasadas.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Horarios Disponibles *</label>
                <select 
                  className="form-select" 
                  name="horaCita" 
                  value={formData.horaCita} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.fechaCita || esFinDeSemana(formData.fechaCita) || esFechaPasada(formData.fechaCita)}
                >
                  <option value="">Seleccione un horario...</option>
                  {obtenerHorasDisponibles(formData.doctor, formData.fechaCita).map(h => (
                    <option key={h} value={h}>{h} hrs</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECCIÓN DE FACTURACIÓN */}
            <div className="form-check form-switch mb-4">
              <input className="form-check-input" type="checkbox" name="requiereFactura" id="checkFactura" checked={formData.requiereFactura} onChange={handleChange} />
              <label className="form-check-label fw-bold text-primary" htmlFor="checkFactura">¿Desea solicitar factura fiscal?</label>
            </div>

            {formData.requiereFactura && (
              <div className="p-4 bg-light rounded border mb-4 shadow-sm">
                <h4 className="text-primary mb-3 border-bottom pb-2">2. Datos Fiscales (Todos Obligatorios)</h4>
                <div className="row g-3">
                  <div className="col-md-4"><label className="form-label fw-bold small">RFC *</label><input type="text" className="form-control" name="rfc" value={formData.rfc} onChange={handleChange} required /></div>
                  <div className="col-md-8"><label className="form-label fw-bold small">Razón Social *</label><input type="text" className="form-control" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required /></div>
                  <div className="col-md-3"><label className="form-label fw-bold small">CP *</label><input type="text" className="form-control" name="cp" value={formData.cp} onChange={handleChange} required /></div>
                  <div className="col-md-5">
                    <label className="form-label fw-bold small">Régimen Fiscal *</label>
                    <select className="form-select" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} required>
                      <option value="">Seleccione...</option>
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="605">605 - Sueldos y Salarios</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Uso de CFDI *</label>
                    <select className="form-select" name="usoCFDI" value={formData.usoCFDI} onChange={handleChange} required>
                      <option value="">Seleccione...</option>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="D01">D01 - Honorarios médicos, dentales y gastos hospitalarios</option>
                    </select>
                  </div>
                  <div className="col-md-6"><label className="form-label small">Calle *</label><input type="text" className="form-control" name="calle" value={formData.calle} onChange={handleChange} required /></div>
                  <div className="col-md-2"><label className="form-label small">Núm. *</label><input type="text" className="form-control" name="numero" value={formData.numero} onChange={handleChange} required /></div>
                  <div className="col-md-4"><label className="form-label small">Colonia *</label><input type="text" className="form-control" name="colonia" value={formData.colonia} onChange={handleChange} required /></div>
                  <div className="col-md-6"><label className="form-label small">Estado *</label><input type="text" className="form-control" name="estado" value={formData.estado} onChange={handleChange} required /></div>
                  <div className="col-md-6"><label className="form-label small">Municipio *</label><input type="text" className="form-control" name="municipio" value={formData.municipio} onChange={handleChange} required /></div>
                </div>
              </div>
            )}
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className={`btn ${editandoId ? 'btn-warning' : 'btn-primary'} btn-lg shadow fw-bold`} 
                disabled={esFinDeSemana(formData.fechaCita) || esFechaPasada(formData.fechaCita)}
              >
                {editandoId ? '💾 GUARDAR CAMBIOS EN LA CITA' : '✅ CONFIRMAR Y AGENDAR CITA'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PANEL DE CONTROL DE CITAS (SÓLO ADMIN) */}
      {esAdmin && (
        <div className="card border-dark shadow-lg mt-5">
          <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-0">Administración de Agenda y Pagos</h4>
            <div className="d-flex gap-2">
              <input type="date" className="form-control form-control-sm" onChange={(e) => setFiltroDescarga({...filtroDescarga, inicio: e.target.value})} />
              <input type="date" className="form-control form-control-sm" onChange={(e) => setFiltroDescarga({...filtroDescarga, fin: e.target.value})} />
              <button className="btn btn-success btn-sm" onClick={descargarExcel}>📊 Exportar Ventas Excel</button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center small mb-0">
                <thead className="table-secondary text-nowrap">
                  <tr>
                    <th>Doctor / Especialista</th>
                    <th>Paciente / Contacto</th>
                    <th>Fecha y Hora</th>
                    <th>Estatus</th>
                    <th>Método de Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasRegistradas.map(cita => (
                    <tr key={cita.id} className={cita.estatus === 'BLOQUEADO' ? 'table-secondary text-muted' : ''}>
                      <td className="text-start"><strong>{cita.doctor}</strong></td>
                      <td className="text-start">
                        {cita.nombre}
                        {cita.estatus !== 'BLOQUEADO' && (
                          <div className="text-muted" style={{fontSize: '10px'}}>{cita.correo} | {cita.telefono}</div>
                        )}
                      </td>
                      <td>{cita.fecha}<br/>{cita.hora} hrs</td>
                      <td>
                        <span className={`badge ${cita.estatus === 'Pagado' ? 'bg-success' : cita.estatus === 'BLOQUEADO' ? 'bg-dark' : 'bg-danger'}`}>
                          {cita.estatus}
                        </span>
                      </td>
                      <td>
                        {cita.estatus === 'Pendiente' ? (
                          <div className="btn-group btn-group-sm">
                            <button title="Transferencia" className="btn btn-outline-primary" onClick={() => marcarComoPagado(cita.id, 'Transferencia')}>T</button>
                            <button title="T. Crédito" className="btn btn-outline-info" onClick={() => marcarComoPagado(cita.id, 'T. Crédito')}>TC</button>
                            <button title="Efectivo" className="btn btn-outline-success" onClick={() => marcarComoPagado(cita.id, 'Efectivo')}>$</button>
                          </div>
                        ) : cita.estatus === 'BLOQUEADO' ? '---' : (
                          <div className="text-muted fw-bold">
                            {cita.metodoPagoActual} 
                            <button className="btn btn-sm btn-link p-0 ms-1" onClick={() => reabrirPago(cita.id)} title="Revertir Pago">🔄</button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {cita.estatus !== 'BLOQUEADO' && (
                            <button className="btn btn-warning" onClick={() => prepararEdicion(cita)} title="Editar">📝</button>
                          )}
                          <button className="btn btn-danger" onClick={() => eliminarRegistro(cita.id)} title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {citasRegistradas.length === 0 && (
                    <tr><td colSpan="6" className="py-4 text-muted">No hay registros en la agenda actualmente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;