import type { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useGetMeQuery } from "../api/authApi/authApi";

export const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
    const { data, isLoading, isError } = useGetMeQuery();

    if (isLoading) {
        return <div>Загрузка...</div>
    }

    if (!data || isError) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}