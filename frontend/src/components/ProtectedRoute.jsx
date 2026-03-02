import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('voxiq_token');
    const userString = localStorage.getItem('voxiq_user');

    if (!token || !userString) {
        // Not logged in
        return <Navigate to="/auth" replace />;
    }

    try {
        const user = JSON.parse(userString);

        // Check role requirements if specified
        if (requiredRole && user.role !== requiredRole) {
            if (requiredRole === 'ADMIN') {
                return <Navigate to="/dashboard" replace />;
            } else if (requiredRole === 'CLIENT') {
                return <Navigate to="/admin" replace />;
            }
        }
    } catch (error) {
        // Invalid data in localStorage
        localStorage.removeItem('voxiq_token');
        localStorage.removeItem('voxiq_user');
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
