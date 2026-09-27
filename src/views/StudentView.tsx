import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface StudentProfile {
  fullName: string;
  email: string;
  matricula: string;
  carrera: string;
  semestre: string;
  grupo: string;
  tutorAsignado: boolean;
  nombreTutor: string;
}

export default function StudentView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"inicio" | "actividades" | "evidencias" | "perfil">("inicio");
  const [actTab, setActTab] = useState<"pendientes" | "completadas">("pendientes");

  // Estado del alumno
  const [student, setStudent] = useState<StudentProfile>({
    fullName: "Cargando...",
    email: "",
    matricula: "-",
    carrera: "-",
    semestre: "-",
    grupo: "-",
    tutorAsignado: false,
    nombreTutor: "Pendiente de asignar",
  });

  useEffect(() => {
    const fetchStudentProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 1. Obtenemos el perfil del alumno desde la tabla 'profiles'
        const { data: studentProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Usamos datos de la tabla, o caemos en los metadatos de auth como respaldo
        const alumnoGrupo = studentProfile?.grupo || user.user_metadata?.grupo;
        const alumnoCarrera = studentProfile?.carrera || user.user_metadata?.carrera;

        let tutorData = null;

        // 2. Si el alumno tiene un grupo, buscamos si hay un profesor asignado a ese grupo
        if (alumnoGrupo && alumnoCarrera) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "tutor")
            .eq("grupo", alumnoGrupo)
            .eq("carrera", alumnoCarrera)
            .maybeSingle(); // Retorna un solo tutor o null si no hay
            
          tutorData = data;
        }

        setStudent({
          fullName: studentProfile?.full_name || user.user_metadata?.full_name || "Alumno TESOEM",
          email: user.email || "",
          matricula: studentProfile?.matricula || user.user_metadata?.matricula || "S/M",
          carrera: alumnoCarrera || "Ing. Sistemas",
          semestre: studentProfile?.semestre || user.user_metadata?.semestre || "1er",
          grupo: alumnoGrupo || "1S1",
          tutorAsignado: !!tutorData,
          nombreTutor: tutorData ? tutorData.full_name : "Pendiente de asignar",
        });
      }
    };

    fetchStudentProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  const initial = student.fullName ? student.fullName.charAt(0).toUpperCase() : "A";

  return (
    <div className="mobile-shell bg-slate-50 min-h-screen pb-20">
      {/* Status Bar Simulada */}
      <div className="status-bar sticky top-0 z-50 bg-[#1a3a5c] px-4 py-2 flex justify-between items-center text-white text-xs font-medium">
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

      {/* Header Dinámico */}
      <div style={{ background: "linear-gradient(135deg, #1a3a5c, #1d7a7a)" }} className="px-5 py-4 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-white/60 text-xs font-semibold">Bienvenido(a) de vuelta,</p>
          <h2 className="text-white font-extrabold text-lg leading-tight truncate">{student.fullName}</h2>
          <p className="text-white/60 text-xs mt-0.5 truncate">
            {student.carrera} · {student.semestre} Semestre · Grupo {student.grupo}
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-sm">
          {initial}
        </div>
      </div>

      {/* Tabs Nav Principal */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-[72px] z-40 shadow-sm">
        <div className="flex justify-between items-center bg-slate-100 p-1 rounded-xl">
          {["inicio", "actividades", "evidencias", "perfil"].map((t) => (
            <button
              key={t}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setTab(t as any)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Contenido */}
      <div className="px-4 py-5 flex flex-col gap-4">
        {tab === "inicio" && (
          <>
            {!student.tutorAsignado ? (
              /* ESTADO VACÍO: Aún no hay tutor para este grupo */
              <div className="bg-white rounded-3xl p-6 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100 my-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Sin tutor asignado</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                  Tu grupo <b>({student.grupo})</b> aún no cuenta con un profesor tutor. En cuanto se asigne uno, verás tu plan de tutorías aquí.
                </p>
              </div>
            ) : (
              /* VISTA ACTIVA: El grupo ya tiene tutor, arranca en 0% (se conectará a la DB después) */
              <>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">Progreso del semestre</h3>
                      <p className="text-xs text-slate-400 font-medium">Tutoría I · 16 semanas</p>
                    </div>
                    <span className="text-2xl font-extrabold" style={{ color: "#1a3a5c" }}>0%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `0%`, background: "#1d7a7a" }} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-xs text-slate-400 font-medium">0 completadas</span>
                    <span className="text-xs text-slate-400 font-medium">0 pendientes</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100 mt-2">
                  <p className="text-sm text-slate-500">Tu tutor <b>{student.nombreTutor}</b> aún no ha publicado actividades.</p>
                </div>
              </>
            )}
          </>
        )}

        {tab === "actividades" && (
          <>
            {!student.tutorAsignado ? (
              <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100 my-6">
                <svg className="mb-3 mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="text-sm font-semibold text-slate-700">Sin actividades</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Aún no cuentas con un tutor asignado.</p>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40">
                <p className="text-sm font-medium text-slate-400">No hay tareas publicadas por el momento.</p>
              </div>
            )}
          </>
        )}

        {tab === "evidencias" && (
          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100 my-6">
            <svg className="mb-3 mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Portafolio vacío</p>
            <p className="text-xs text-slate-400 mt-1">Tus evidencias entregadas aparecerán aquí.</p>
          </div>
        )}

        {/* Tab Perfil Dinámico */}
        {tab === "perfil" && (
          <>
            <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 text-center shadow-sm border border-slate-100">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-lg border-4 border-white"
                style={{ background: "linear-gradient(135deg,#1a3a5c,#1d7a7a)" }}
              >
                {initial}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-xl">{student.fullName}</h3>
                <p className="text-slate-500 text-sm mt-1">{student.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                {[
                  ["Matrícula", student.matricula],
                  ["Carrera", student.carrera],
                  ["Semestre / Grupo", `${student.semestre} · ${student.grupo}`],
                  ["Profesor Tutor", student.nombreTutor],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl p-4 flex flex-col justify-center bg-slate-50 border border-slate-100 text-left">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{k}</p>
                    <p className="text-sm font-extrabold text-slate-700 mt-1 truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="w-full mt-2 bg-white rounded-2xl py-4 flex items-center justify-center gap-2 text-red-600 font-bold border border-red-100 shadow-sm hover:bg-red-50 transition-colors" 
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}