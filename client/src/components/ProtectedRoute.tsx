import type { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useGetMeQuery } from "../api/authApi/authApi";
import { Spinner } from "./Spinner";

export const ProtectedRoute: FC = () => {
    const { data, isLoading, isError } = useGetMeQuery();

    if (isLoading) {
        return (
            <div className="grid min-h-screen place-items-center">
                <Spinner size={32} className="text-album-accent" />
            </div>
        );
    }


    if (!data || isError) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}