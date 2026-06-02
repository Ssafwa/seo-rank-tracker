import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import LoadingComponent from "./Loading"; 

export default function ProtectedRoute() {
    const { token, loading } = useApp();

    if (loading) {
        // Render the component you imported to cleanly resolve the unused variable warning
        return <LoadingComponent />; 
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}