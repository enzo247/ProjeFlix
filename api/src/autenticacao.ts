import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const SEGREDO = process.env.JWT_SEGREDO ?? "troque-este-segredo";
// Middleware: roda antes da rota e só deixa passar quem tem token válido
export function exigirLogin(req: Request, res: Response, next: NextFunction): void {
const cabecalho = req.headers.authorization;
const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : undefined;
if (!token) {
res.status(401).json({ erro: "Faça login para continuar." });
return;
}
try {
const dados = jwt.verify(token, SEGREDO) as { id: number };
res.locals.usuarioId = dados.id; // a rota lê o dono daqui
next();
} catch {
res.status(401).json({ erro: "Sua sessão expirou. Entre de novo." });
}
}
// Quem está logado nesta requisição
export function usuarioDe(res: Response): number {
return res.locals.usuarioId as number;
}