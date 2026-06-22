import type { FC } from "react";

import { useLogoutMutation } from "../../api/authApi/authApi";

export const FeedPage: FC = () => {
    const [logout] = useLogoutMutation();


    return <button onClick={() => logout()}>Выйти</button>
}