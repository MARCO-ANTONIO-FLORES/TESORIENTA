import { useState } from "react";  
import { supabase } from "../supabaseClient"; // Ajusta la ruta si tu archivo supabaseClient.ts está en otra carpeta

type Role = "login" | "student" | "tutor" | "superuser";  
  
interface Props {  
  onLogin: (role: Role) => void;  
}  
  
export default function LoginView({ onLogin }: Props) {  
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");  
  const [showPass, setShowPass] = useState(false);  
  const [loading, setLoading] = useState(false);  

  // Estados para el flujo de recuperación de contraseña con Supabase
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  
  const handleLogin = () => {  
    if (!email || !password) return;  
    setLoading(true);  
    setTimeout(() => {  
      setLoading(false);  
      if (email.includes("admin")) onLogin("superuser");  
      else if (email.includes("tutor")) onLogin("tutor");  
      else onLogin("student");  
    }, 900);  
  };  

  // Función real conectada a Supabase para recuperar contraseña
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setRecoverySent(true);
    } catch (error: any) {
      alert("Error al enviar el correo: " + (error.message || "Ocurrió un error"));
    } finally {
      setLoading(false);
    }
  };
  
  return (  
    <div className="mobile-shell">  
      {/* Status bar */}  
      <div className="status-bar">  
        <span>9:41</span>  
        <div className="flex gap-1 items-center">  
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4" y="2" width="3" height="10" rx="1"/><rect x="8" y="1" width="3" height="11" rx="1"/><rect x="12" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>  
          <svg width="16" height="12" viewBox="0 0 24 12" fill="white"><rect x="0" y="3" width="20" height="9" rx="2" stroke="white" strokeWidth="1.5" fill="none"/><rect x="20" y="5" width="3" height="5" rx="1" fill="white"/><rect x="1.5" y="4.5" width="14" height="6" rx="1" fill="white"/></svg>  
        </div>  
      </div>  
  
      <div className="scroll-area flex flex-col">  
        {/* Hero */}  
        <div style={{background: "linear-gradient(160deg, #1a3a5c 60%, #1d7a7a)"}} className="px-8 pt-12 pb-16">  
          <div className="flex justify-center mb-6">  
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/30">  
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">  
                <circle cx="20" cy="13" r="6" fill="white"/>  
                <path d="M8 32c0-6.627 5.373-12 12-12h0c6.627 0 12 5.373 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>  
                <path d="M26 18l6-3-6-3v6z" fill="#f59e0b"/>  
              </svg>  
            </div>  
          </div>  
          <h1 className="text-white text-3xl font-extrabold text-center leading-tight">Sistema de Tutorías</h1>  
          <p className="text-white/70 text-center mt-2 text-sm font-medium">TESOEM · Tec. de Estudios Superiores</p>  
        </div>  
  
        {/* Form card */}  
        <div className="px-5 -mt-8 pb-6">  
          <div className="card p-6 shadow-xl">  
            {!isRecovering ? (  
              <>  
                <h2 className="text-lg font-extrabold text-slate-800 mb-1">Iniciar sesión</h2>  
                <p className="text-xs text-slate-400 font-medium mb-5">Ingresa con tu cuenta institucional</p>  
          
                <div className="flex flex-col gap-4">  
                  <div>  
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo institucional</label>  
                    <input  
                      className="input-field"  
                      type="email"  
                      placeholder="usuario@tesoem.edu.mx"  
                      value={email}  
                      onChange={e => setEmail(e.target.value)}  
                    />  
                  </div>  
                  <div>  
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Contraseña</label>  
                    <div className="relative">  
                      <input  
                        className="input-field pr-12"  
                        type={showPass ? "text" : "password"}  
                        placeholder="••••••••"  
                        value={password}  
                        onChange={e => setPassword(e.target.value)}  
                      />  
                      <button  
                        type="button"  
                        onClick={() => setShowPass(!showPass)}  
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"  
                      >  
                        {showPass ? (  
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>  
                        ) : (  
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>  
                        )}  
                      </button>  
                    </div>  
                    <div className="text-right mt-1.5">  
                      <button  
                        type="button"  
                        className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0"  
                        onClick={(e) => {
                          e.preventDefault();
                          setRecoveryEmail(email); 
                          setRecoverySent(false);
                          setIsRecovering(true);
                        }}  
                      >  
                        ¿Olvidaste tu contraseña?  
                      </button>  
                    </div>  
                  </div>  
                </div>  
          
                <button  
                  type="button"
                  className="btn-primary w-full mt-5 flex items-center justify-center gap-2"  
                  onClick={handleLogin}  
                  disabled={loading || !email || !password}  
                >  
                  {loading ? "Iniciando sesión..." : "Ingresar"}  
                </button>  
              </>  
            ) : (  
              <>  
                <h2 className="text-lg font-extrabold text-slate-800 mb-1">Recuperar contraseña</h2>  
                <p className="text-xs text-slate-400 font-medium mb-5">  
                  Ingresa tu correo institucional y te enviaremos las instrucciones.  
                </p>  

                {!recoverySent ? (  
                  <form onSubmit={handlePasswordRecovery} className="flex flex-col gap-4">  
                    <div>  
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">  
                        Correo institucional  
                      </label>  
                      <input  
                        className="input-field"  
                        type="email"  
                        placeholder="usuario@tesoem.edu.mx"  
                        value={recoveryEmail}  
                        onChange={(e) => setRecoveryEmail(e.target.value)}  
                        required  
                      />  
                    </div>  

                    <button  
                      type="submit"  
                      className="btn-primary w-full mt-1 flex items-center justify-center gap-2"  
                      disabled={loading}  
                    >  
                      {loading ? "Enviando..." : "Enviar instrucciones"}  
                    </button>  
                  </form>  
                ) : (  
                  <div className="text-center py-2">  
                    <p className="text-xs text-slate-600 font-medium mb-4">  
                      Si el correo <strong>{recoveryEmail}</strong> está registrado, recibirás un enlace con las instrucciones para restablecer tu contraseña.  
                    </p>  
                  </div>  
                )}  

                <div className="text-center mt-5">  
                  <button  
                    type="button"
                    className="text-xs text-slate-500 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0"  
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRecovering(false);
                    }}  
                  >  
                    ← Volver al inicio de sesión  
                  </button>  
                </div>  
              </>  
            )}  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}