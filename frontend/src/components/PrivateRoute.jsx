import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const checkAdminAuth = () => {
    // Check local storage for auth flag
    return localStorage.getItem('kuki_admin_auth') === 'true';
};

const PrivateRoute = () => {
    const isAdmin = checkAdminAuth();
    return isAdmin ? <Outlet /> : <Navigate to="/admin" />; // Redirect to /admin which shows login card if not auth
};

export default PrivateRoute;
