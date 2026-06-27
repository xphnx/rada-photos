import { useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useResetPasswordMutation } from '../../api/authApi/authApi';

export const ResetPasswordPage: FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Ссылка недействительна');
      return;
    }
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Пароль обновлён — войдите с новым паролем');
      navigate('/login');
    } catch {
      toast.error('Ссылка недействительна или устарела');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-album-bg p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-album-line bg-album-card p-6">
        <h1 className="text-center font-display text-2xl text-album-ink">Новый пароль</h1>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите новый пароль"
          className="w-full rounded-xl border border-album-line bg-album-card px-4 py-3 text-album-ink outline-none transition focus:border-album-accent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-album-accent py-3 font-medium text-white transition hover:bg-album-accent/90 disabled:opacity-60"
        >
          {isLoading ? 'Сохраняем…' : 'Сохранить пароль'}
        </button>
      </form>
    </div>
  );
};
