import type { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useGetMeQuery } from "../api/authApi/authApi";

export const ProtectedRoute: FC = () => {
    const { data, isLoading, isError } = useGetMeQuery();

    if (isLoading) {
        return <div>Загрузка...</div>
    }

    if (!data || isError) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}