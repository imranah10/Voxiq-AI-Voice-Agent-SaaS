import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const tokenKey = requiredRole === 'ADMIN' ? 'voxiq_admin_token' : 'voxiq_token';
    const userKey = requiredRole === 'ADMIN' ? 'voxiq_admin_user' : 'voxiq_user';

    const token = localStorage.getItem(tokenKey);
    const userString = localStorage.getItem(userKey);

    if (!token || !userString) {
        // Not logged in for this role
        return <Navigate to={requiredRole === 'ADMIN' ? '/hq-admin-secure' : '/auth'} replace />;
    }

    try {
        const user = JSON.parse(userString);

        // Check if the token's role matches the required role
        if (requiredRole && user.role !== requiredRole) {
            // Unlikely to happen anymore because keys are isolated,
            // but if they tamper with it, kick them back.
            return <Navigate to={requiredRole === 'ADMIN' ? '/hq-admin-secure' : '/auth'} replace />;
        }

    } catch (error) {
        // Invalid data in localStorage
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        return <Navigate to={requiredRole === 'ADMIN' ? '/hq-admin-secure' : '/auth'} replace />;
    }

    return children;
};

export default ProtectedRoute;
