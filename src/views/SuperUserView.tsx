import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  grupo: string;
  carrera: string;
}

export default function SuperAdminView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"asignacion" | "registrar" | "usuarios" | "reportes">("asignacion");
  
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de asignación
  const [selectedCarrera, setSelectedCarrera] = useState("Ingeniería en Sistemas Computacionales");
  const [selectedGrupo, setSelectedGrupo] = useState("1S1");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [saving, setSaving] = useState(false);

  // Estados para el formulario de registrar nuevo tutor[cite: 3]
  const [newTutorName, setNewTutorName] = useState("");
  const [newTutorEmail, setNewTutorEmail] = useState("");
  const [newTutorPassword, setNewTutorPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const carrerasList = [
    "Ingeniería en Sistemas Computacionales",
    "Ingeniería Industrial",
    "Ingeniería Electromecánica",
    "Licenciatura en Administración"
  ];
  
  const gruposList = ["1S1", "1S2", "3S1", "5S1", "7S1"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
      console.error("Error al cargar usuarios:", error);
    } else if (data) {
      setTutors(data.filter((u: Profile) => u.role === "tutor"));
      setStudents(data.filter((u: Profile) => u.role === "student"));
    }
    setLoading(false);
  };

  const handleAssignTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorId) {
      alert("Por favor selecciona un profesor tutor.");
      return;
    }

    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        grupo: selectedGrupo,
        carrera: selectedCarrera,
        role: "tutor"
      })
      .eq("id", selectedTutorId);

    setSaving(false);

    if (error) {
      alert("Error al asignar tutor: " + error.message);
    } else {
      alert(`¡Tutor asignado exitosamente al grupo ${selectedGrupo} (${selectedCarrera})!`);
      fetchUsers();
    }
  };

  const handleRegisterTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newTutorEmail,
        password: newTutorPassword,
        options: {
          data: {
            full_name: newTutorName,
            role: "tutor",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            full_name: newTutorName,
            email: newTutorEmail,
            role: "tutor",
            carrera: "Ingeniería en Sistemas Computacionales",
            grupo: ""
          });

        if (profileError) throw profileError;

        alert(`¡Tutor ${newTutorName} registrado correctamente!`);
        setNewTutorName("");
        setNewTutorEmail("");
        setNewTutorPassword("");
        fetchUsers();
        setTab("asignacion");
      }
    } catch (error: any) {
      alert("Error al registrar tutor: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  return (
    <div className="mobile-shell">
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <rect x="0" y="3" width="3" height="9" rx="1" />
            <rect x="4" y="2" width="3" height="10" rx="1" />
            <rect x="8" y="1" width="3" height="11" rx="1" />
            <rect x="12" y="0" width="3" height="12" rx="1" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a3a5c, #1d7a7a)" }} className="px-5 py-4 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-white/60 text-xs font-semibold">Panel de Control</p>
          <h2 className="text-white font-extrabold text-lg leading-tight truncate">Súper Administrador</h2>
          <p className="text-white/60 text-xs mt-0.5 truncate">Gestión Institucional TESOEM</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white flex-shrink-0"
          title="Cerrar sesión"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Tabs nav */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="tab-row flex gap-1">
          {[
            { key: "asignacion", label: "Asignar" },
            { key: "registrar", label: "Nuevo Tutor" },
            { key: "usuarios", label: "Usuarios" },
            { key: "reportes", label: "Reportes" }
          ].map((t) => (
            <button 
              key={t.key} 
              className={`tab-item flex-1 py-2 text-xs font-bold ${tab === t.key ? "active" : ""}`} 
              onClick={() => setTab(t.key as any)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area px-4 py-4 flex flex-col gap-4">
        
        {/* SECCIÓN 1: ASIGNAR TUTORES POR GRUPO */}
        {tab === "asignacion" && (
          <>
            <div className="card p-5">
              <h3 className="font-extrabold text-slate-800 text-sm mb-1">Asignación de Tutor por Grupo</h3>
              <p className="text-xs text-slate-400 mb-4">Selecciona la carrera, el grupo y asigna un profesor responsable.</p>

              <form onSubmit={handleAssignTutor} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Carrera</label>
                  <select 
                    value={selectedCarrera} 
                    onChange={(e) => setSelectedCarrera(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                  >
                    {carrerasList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Grupo</label>
                  <select 
                    value={selectedGrupo} 
                    onChange={(e) => setSelectedGrupo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                  >
                    {gruposList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Profesor Tutor</label>
                  <select 
                    value={selectedTutorId} 
                    onChange={(e) => setSelectedTutorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                    required
                  >
                    <option value="">-- Selecciona un profesor --</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.full_name} ({tutor.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary w-full mt-2 py-3 text-xs font-bold text-white rounded-xl shadow-md"
                  style={{ background: "#1a3a5c" }}
                >
                  {saving ? "Guardando..." : "Guardar Asignación"}
                </button>
              </form>
            </div>

            <div className="card p-4">
              <h3 className="font-extrabold text-slate-800 text-sm mb-3">Tutores Asignados Actuales</h3>
              {loading ? (
                <p className="text-xs text-slate-400 text-center py-4">Cargando...</p>
              ) : tutors.filter(t => t.grupo).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No hay grupos con tutores asignados.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tutors.filter(t => t.grupo).map((tutor) => (
                    <div key={tutor.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{tutor.full_name}</p>
                        <p className="text-[11px] text-slate-400">Grupo: {tutor.grupo}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Asignado
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* SECCIÓN 2: REGISTRAR NUEVO TUTOR[cite: 3] */}
        {tab === "registrar" && (
          <div className="card p-5">
            <h3 className="font-extrabold text-slate-800 text-sm mb-1">Registrar Nuevo Profesor Tutor</h3>
            <p className="text-xs text-slate-400 mb-4">Crea una cuenta de acceso para un nuevo docente en el sistema.</p>

            <form onSubmit={handleRegisterTutor} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo del Profesor</label>
                <input 
                  type="text"
                  placeholder="Ej. Ing. Carlos Mendoza"
                  value={newTutorName}
                  onChange={(e) => setNewTutorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Correo Institucional</label>
                <input 
                  type="email"
                  placeholder="carlos.mendoza@tesoem.edu.mx"
                  value={newTutorEmail}
                  onChange={(e) => setNewTutorEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña Temporal</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={newTutorPassword}
                  onChange={(e) => setNewTutorPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="btn-primary w-full mt-2 py-3 text-xs font-bold text-white rounded-xl shadow-md"
                style={{ background: "#1a3a5c" }}
              >
                {creating ? "Registrando..." : "Crear Cuenta de Tutor"}
              </button>
            </form>
          </div>
        )}

        {/* SECCIÓN 3: USUARIOS */}
        {tab === "usuarios" && (
          <div className="card p-4">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3">Directorio de Usuarios</h3>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-xs text-slate-400 text-center py-4">Cargando...</p>
              ) : (
                [...tutors, ...students].map((user) => (
                  <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 4: REPORTES */}
        {tab === "reportes" && (
          <div className="card p-6 text-center">
            <h3 className="font-extrabold text-slate-800 text-base mb-1">Reportes Generales</h3>
            <p className="text-xs text-slate-400 mb-4">Exporta la información de tutorías del periodo.</p>
            <button 
              className="btn-primary py-2.5 px-5 text-xs font-bold text-white rounded-xl"
              style={{ background: "#1a3a5c" }}
              onClick={() => alert("Generando reporte...")}
            >
              Exportar Reporte
            </button>
          </div>
        )}

      </div>
    </div>
  );
}