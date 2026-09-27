import { useState } from "react";
import LoginView from "./views/LoginView";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import SuperUserView from "./views/SuperUserView";

type Role = "login" | "student" | "tutor" | "superuser";

export default function App() {
  const [role, setRole] = useState<Role>("login");

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-white flex flex-col">
      {role === "login" && <LoginView onLogin={setRole} />}
      {role === "student" && <StudentView onBack={() => setRole("login")} />}
      {role === "tutor" && <TutorView onBack={() => setRole("login")} />}
      {role === "superuser" && <SuperUserView onBack={() => setRole("login")} />}
    </div>
  );
}