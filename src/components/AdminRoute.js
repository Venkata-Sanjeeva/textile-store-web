import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    let role = null;
    try {
        const tokenData = sessionStorage.getItem('token');
        if (tokenData) {
            role = JSON.parse(tokenData).role;
        }
    } catch (e) {
        console.error("Token parsing error", e);
    }

    if (role !== 'ADMIN') {
        alert("Access Denied: Admins Only");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;