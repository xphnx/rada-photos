import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { schema } from "./schema";
import { useLoginMutation, useRegisterMutation } from "../../api/authApi/authApi";

export const LoginPage: FC = () => {
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false);

    const [login] = useLoginMutation()
    const [signUp] = useRegisterMutation()

    const submit = isRegister ? signUp : login;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
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
    <div className="flex min-h-screen items-center justify-center bg-album-bg p-4">
      <div className="flex min-h-200 w-full max-w-350 overflow-hidden rounded-3xl bg-album-card shadow-xl">
        <div className="relative hidden w-1/2 lg:block">
          <img
            src="/login.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-0 p-10 text-white">
            <h2 className="font-display text-4xl leading-tight">
              Наши моменты — в одном альбоме
            </h2>
            <p className="mt-3 max-w-sm text-white/80">
              RadaPhoto собирает фотографии семьи в одном тёплом месте.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-14">
          <div className="mb-8 flex items-center justify-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-album-accent text-white">
              📷
            </span>
            <span className="text-lg font-semibold text-album-ink">
              RadaPhoto
            </span>
          </div>

          <h1 className="text-center font-display text-3xl text-album-ink">
            {isRegister ? 'Создайте аккаунт' : 'С возвращением'}
          </h1>
          <p className="mt-1 text-center text-sm text-album-muted">
            {isRegister
              ? 'Введите данные для регистрации'
              : 'Введите данные для входа'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-album-ink">
                Электронная почта
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className='w-full rounded-xl border border-album-line bg-album-card px-4 py-3 text-album-ink placeholder:text-album-muted/60 outline-none transition focus:border-album-accent focus:ring-2 focus:ring-album-accent/30'
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-album-ink">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  {...register('password')}
                  className='w-full rounded-xl border border-album-line bg-album-card px-4 py-3 text-album-ink placeholder:text-album-muted/60 outline-none transition focus:border-album-accent focus:ring-2 focus:ring-album-accent/30'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 grid place-items-center text-album-muted hover:text-album-ink"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-album-muted">
                <input type="checkbox" className="accent-album-accent" />
                Запомнить меня
              </label>
              <span className="cursor-pointer text-album-accent">
                Забыли пароль?
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-album-accent py-3 font-medium text-white transition hover:bg-album-accent/90 disabled:opacity-60"
            >
              {isSubmitting
                ? 'Подождите…'
                : isRegister
                  ? 'Зарегистрироваться'
                  : 'Войти'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-album-muted">
            <span className="h-px flex-1 bg-album-line" />
            <span className="text-xs">или</span>
            <span className="h-px flex-1 bg-album-line" />
          </div>

          <a
            href="/api/auth/yandex"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-album-line bg-album-card py-3 text-album-ink transition hover:bg-album-bg"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
              Я
            </span>
            Войти через Яндекс
          </a>

          <p className="mt-6 text-center text-sm text-album-muted">
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button
              onClick={() => setIsRegister((p) => !p)}
              className="font-medium text-album-accent"
            >
              {isRegister ? 'Войти' : 'Регистрация'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}