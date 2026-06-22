import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { schema } from "./schema";
import { useLoginMutation, useRegisterMutation } from "../../api/authApi/authApi";
import { useNavigate } from "react-router-dom";

export const LoginPage: FC = () => {
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false)
    const [login] = useLoginMutation()
    const [signUp] = useRegisterMutation()

    const submit = isRegister ? signUp : login;

    const {
        register,
        handleSubmit
    } = useForm({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (values: z.infer<typeof schema>) => {
       const response = await submit(values);


       if (response.data?.email === values.email) {
            navigate('/feed');
            return;
       }
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="email" { ...register('email') } />
                <input type="password" { ...register('password') } />
                <input type="submit" value={isRegister ? 'Регистрация' : 'Войти'} />
            </form>
            <button onClick={(() => setIsRegister((prev) => !prev))}>
                {isRegister ? 'Есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
            </button>
            <hr />
            <a href="/api/auth/yandex">Войти через Яндекс</a>
        </>
    )
}