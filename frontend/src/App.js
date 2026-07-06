import { Routes, Route } from "react-router-dom";



import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import Interview from "./pages/Interview";
import CaseDetails from "./pages/CaseDetails";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ NEW
import Cases from "./pages/Cases";
import BulkImport from "./pages/BulkImport";
import Investigators from "./pages/Investigators";
import ForgotPassword from "./pages/ForgotPassword";


import DocumentAnalysis from "./pages/DocumentAnalysis";
import StatementAnalysis from "./pages/StatementAnalysis";


export default function App() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ✅ SAFE ROLE-BASED DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Dashboard />
        }
      />
      <Route
  path="/cases"
  element={<Cases />}
/>
<Route
  path="/bulk-import"
  element={<BulkImport />}
/>
<Route
  path="/investigators"
  element={<Investigators />}
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>


      {/* ✅ KEEP EVERYTHING ELSE SAME */}
      <Route path="/new-case" element={<NewCase />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/case/:id" element={<CaseDetails />} />

      <Route
        path="/case/:id/document-analysis"
        element={<DocumentAnalysis />}
      />
      <Route
        path="/case/:id/statement-analysis"
        element={<StatementAnalysis />}
      />
    </Routes>
  );
}