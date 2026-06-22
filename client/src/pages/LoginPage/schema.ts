import z from "zod";

export const schema = z.object({
    email: z.email('Некорректный email'),
    password: z.string().min(6, 'Минимум 6 символов')
})