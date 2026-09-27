import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface TutorStudent { id: string; name: string; matriula: string; progress: number; alerts: number; status: string; }

const WEEKS = Array.from({length: 16}, (_, i) => ({
  week: i + 1,
  title: [
    "Encuadre y diagnóstico inicial",
    "Estilos de aprendizaje",
    "Plan de vida y metas",
    "Técnicas de estudio",
    "Hábitos saludables",
    "Resolución de conflictos",
    "Proyecto integrador 1",
    "Evaluación parcial 1",
    "Habilidades blandas",
    "Orientación vocacional",
    "Gestión emocional",
    "Proyecto integrador 2",
    "Evaluación parcial 2",
    "Fortalezas y áreas de mejora",
    "Reporte individual",
    "Cierre y evaluación final",
  ][i],
  pit: [1,2,4,7,9,11,12,15,16].includes(i + 1),
  published: i < 4,
}));

const CANALIZATION_TYPES = [
  { key: "academico", label: "Académico", color: "#1a3a5c", icon: "📚" },
  { key: "salud", label: "Salud", color: "#10b981", icon: "🏥" },
  { key: "emocional", label: "Emocional", color: "#8b5cf6", icon: "💙" },
  { key: "creditos", label: "Créditos", color: "#f59e0b", icon: "📋" },
];

export default function TutorView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"grupo" | "programa" | "canalizacion" | "reporte" | "fortalezas">("grupo");
  const [students, setStudents] = useState<TutorStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [canalType, setCanalType] = useState("academico");
  const [reportSaved, setReportSaved] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [fortalezasSaved, setFortalezasSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", matriula: "", email: "" });
  const [addSaved, setAddSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar alumnos reales desde la tabla profiles de Supabase
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, matricula, role")
        .eq("role", "student");

      if (error) throw error;

      if (data) {
        const formatted: TutorStudent[] = data.map((item: any, index: number) => ({
          id: item.id,
          name: item.full_name || "Sin nombre",
          matriula: item.matricula || `S/N-${index}`,
          progress: 30, // Valor por defecto o calculado
          alerts: 0,
          status: "ok",
        }));
        setStudents(formatted);
      }
    } catch (error: any) {
      console.error("Error al cargar estudiantes:", error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async () => {
    if (!addForm.name || !addForm.matriula || !addForm.email) return;
    setErrorMsg(null);

    try {
      // 1. Crear el usuario en Supabase Auth con una contraseña temporal basada en su matrícula
      const tempPassword = addForm.matriula;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addForm.email.trim().toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            full_name: addForm.name,
            matricula: addForm.matriula,
            role: "student",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insertar en la tabla profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            full_name: addForm.name,
            email: addForm.email.trim().toLowerCase(),
            role: "student",
            matricula: addForm.matriula,
            grupo: "1S1", // Ajusta según el grupo asignado al tutor
          });

        if (profileError) throw profileError;

        setAddSaved(true);
        fetchStudents();
        setTimeout(() => {
          setAddSaved(false);
          setShowAddModal(false);
          setAddForm({ name: "", matriula: "", email: "" });
        }, 1200);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="mobile-shell">
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4" y="2" width="3" height="10" rx="1"/><rect x="8" y="1" width="3" height="11" rx="1"/></svg>
        </div>
      </div>

      {/* Add student modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex flex-col" style={{background:"rgba(0,0,0,0.5)"}}>
          <div className="flex-1" onClick={() => setShowAddModal(false)}/>
          <div className="bg-white rounded-t-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Agregar alumno</h3>
                <p className="text-xs text-slate-400 mt-0.5">Grupo B · Tutoría I</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {addSaved && (
              <div className="alert-banner bg-green-50 border border-green-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-xs font-bold text-green-700">Alumno agregado correctamente</p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre completo *</label>
              <input className="input-field" placeholder="Ej. Ana López García" value={addForm.name} onChange={e => setAddForm(f => ({...f, name: e.target.value}))}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Matrícula *</label>
              <input className="input-field" placeholder="Ej. 2024301099" value={addForm.matriula} onChange={e => setAddForm(f => ({...f, matriula: e.target.value}))}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo institucional *</label>
              <input className="input-field" type="email" placeholder="alumno@tesoem.edu.mx" value={addForm.email} onChange={e => setAddForm(f => ({...f, email: e.target.value}))}/>
            </div>

            <p className="text-xs text-slate-400">
              <svg className="inline mr-1" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              La contraseña inicial será la matrícula ingresada.
            </p>

            <button
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleAddStudent}
              disabled={!addForm.name || !addForm.matriula || !addForm.email}
              style={{opacity: (!addForm.name || !addForm.matriula || !addForm.email) ? 0.5 : 1}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Registrar y agregar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background: "linear-gradient(135deg, #1a3a5c, #0f4c75)"}} className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-semibold">Tutor asignado</p>
          <h2 className="text-white font-extrabold text-lg leading-tight">Dr. Carlos Ruiz</h2>
          <p className="text-white/60 text-xs mt-0.5">Grupo B · Tutoría I · Semestre 2026-A</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-white font-extrabold text-2xl">{students.length}</p>
            <p className="text-white/60 text-xs">estudiantes</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-white/20"
            title="Cerrar sesión"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Salir
          </button>
        </div>
      </div>

      {/* Alert reminder */}
      {!alertDismissed && (
        <div className="mx-4 mt-3">
          <div className="alert-banner bg-amber-50 border border-amber-200 relative">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-800">Recordatorio: Reporte parcial</p>
              <p className="text-xs text-amber-600">Fecha límite de entrega: 10 de octubre 2026</p>
            </div>
            <button onClick={() => setAlertDismissed(true)} className="text-amber-400 ml-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {[
            {key:"grupo", label:"Mi Grupo"},
            {key:"programa", label:"Programa"},
            {key:"canalizacion", label:"Canalización"},
            {key:"reporte", label:"Reporte"},
            {key:"fortalezas", label:"Fortalezas"},
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tab === t.key ? "text-white" : "text-slate-400 bg-slate-50"
              }`}
              style={tab === t.key ? {background:"#1a3a5c"} : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area px-4 py-4 flex flex-col gap-4">

        {/* GRUPO */}
        {tab === "grupo" && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500">{students.length} alumnos registrados</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                style={{background:"#1a3a5c"}}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar alumno
              </button>
            </div>

            {loadingStudents ? (
              <p className="text-center text-xs text-slate-400 py-6">Cargando alumnos de la base de datos...</p>
            ) : students.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No hay alumnos registrados todavía.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {students.map(s => (
                  <div key={s.id} className="card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => setSelectedStudent(selectedStudent === s.id ? null : s.id)}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold flex-shrink-0" style={{background: "#10b981"}}>
                      {s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      </div>
                      <div className="progress-bar mt-1.5">
                        <div className="progress-fill" style={{width:`${s.progress}%`}}/>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{s.progress}% completado · Matrícula: {s.matriula}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* PROGRAMA */}
        {tab === "programa" && (
          <div className="flex flex-col gap-2">
            {WEEKS.map(w => (
              <div key={w.week} className={`card p-3 flex items-center gap-3 ${!w.published ? "opacity-50" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${w.published ? "text-white" : "bg-slate-100 text-slate-400"}`} style={w.published ? {background:"#1a3a5c"} : {}}>
                  {w.week}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 leading-snug">{w.title}</p>
                  <div className="flex gap-1 mt-1">
                    {w.pit && <span className="badge" style={{background:"#fef3c7", color:"#92400e"}}>PIT</span>}
                    <span className={`badge ${w.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {w.published ? "Publicada" : "Próximamente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CANALIZACIÓN */}
        {tab === "canalizacion" && (
          <div className="card p-4">
            <h3 className="font-extrabold text-slate-800 mb-3">Formato de Canalización</h3>
            <div className="mb-3">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Estudiante</label>
              <select className="input-field">
                <option value="">Seleccionar estudiante</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.matriula}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Tipo de canalización</label>
              <div className="grid grid-cols-2 gap-2">
                {CANALIZATION_TYPES.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCanalType(c.key)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: canalType === c.key ? c.color : "#e2e8f0",
                      background: canalType === c.key ? c.color + "10" : "white",
                    }}
                  >
                    <span className="text-lg block mb-1">{c.icon}</span>
                    <span className="text-xs font-bold" style={{color: canalType === c.key ? c.color : "#64748b"}}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full mt-3">Registrar canalización</button>
          </div>
        )}

        {/* REPORTE */}
        {tab === "reporte" && (
          <div className="card p-4 flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800">Reporte Final de Tutoría</h3>
            {reportSaved && (
              <div className="alert-banner bg-green-50 border border-green-200">
                <p className="text-xs font-bold text-green-700">Reporte guardado exitosamente</p>
              </div>
            )}
            <button className="btn-primary w-full" onClick={() => setReportSaved(true)}>Guardar reporte</button>
          </div>
        )}

        {/* FORTALEZAS */}
        {tab === "fortalezas" && (
          <div className="card p-4">
            <h3 className="font-extrabold text-slate-800 mb-3">Formato de Fortalezas</h3>
            {fortalezasSaved && (
              <div className="alert-banner bg-green-50 border border-green-200 mb-3">
                <p className="text-xs font-bold text-green-700">Formato guardado y almacenado</p>
              </div>
            )}
            <button className="btn-primary w-full" onClick={() => setFortalezasSaved(true)}>Guardar formato de fortalezas</button>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <div className="nav-bottom">
        {[
          { key: "grupo", label: "Grupo", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
          { key: "programa", label: "Programa", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/></svg> },
          { key: "canalizacion", label: "Canalizar", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg> },
          { key: "reporte", label: "Reporte", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg> },
          { key: "fortalezas", label: "Fortalezas", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14"/></svg> },
        ].map(item => (
          <button key={item.key} className={`nav-item ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key as any)}>
            {item.icon}
            <span className="text-[9px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}