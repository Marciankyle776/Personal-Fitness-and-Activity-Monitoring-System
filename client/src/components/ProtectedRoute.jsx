import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FullScreenSpinner = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
  </div>
);

// Private pages: redirect to /login when there is no session.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

// Login/register pages: signed-in users go straight to the dashboard.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
