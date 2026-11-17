import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { exigirLogin, SEGREDO, usuarioDe } from "./autenticacao";
import { banco } from "./banco";

const app = express();
app.use(express.json());

// Tipos e constantes de status
type Status = "pendente" | "em_andamento" | "concluida";
const STATUS: Status[] = ["pendente", "em_andamento", "concluida"];

// O SELECT que as rotas de tarefas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
const SELECT_TAREFAS = `
    SELECT t.id, t.titulo, t.descricao, t.prioridade, t.status,
    DATE_FORMAT(t.prazo, '%Y-%m-%d') AS prazo,
    t.criada_em AS criadaEm,
    (SELECT GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ',')
     FROM tarefa_tag tt
     JOIN tags g ON g.id = tt.tag_id
     WHERE tt.tarefa_id = t.id) AS tags
    FROM tarefas t
`;

// O banco devolve as tags como "estudo,ts" (ou null): viram um array
function paraTarefa(linha: RowDataPacket): RowDataPacket {
    return { ...linha, tags: linha.tags ? String(linha.tags).split(",") : [] };
}

// ---------- USUÁRIOS (Aula 5) ----------
app.post("/api/usuarios", async (req, res) => {
    const { nome, email, senha } = req.body as { nome?: string; email?: string; senha?: string };
    if (!nome?.trim() || !email?.includes("@") || !senha || senha.length < 6) {
        res.status(400).json({
            erro: "Preencha nome, e-mail válido e senha de 6 caracteres ou mais.",
        });
        return;
    }

    const hash = await bcrypt.hash(senha, 10); // a senha nunca vai para o banco
    try {
        const [resultado] = await banco.execute<ResultSetHeader>(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
            [nome.trim(), email.trim().toLowerCase(), hash]
        );
        res.status(201).json({ id: resultado.insertId });
    } catch (erro) {
        // quem descobre o e-mail repetido é o UNIQUE do banco
        if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
            res.status(409).json({ erro: "Este e-mail já está cadastrado." });
            return;
        }
        throw erro;
    }
});

app.post("/api/login", async (req, res) => {
    const { email, senha } = req.body as { email?: string; senha?: string };
    const [linhas] = await banco.execute<RowDataPacket[]>(
        "SELECT id, nome, senha_hash FROM usuarios WHERE email = ?",
        [email?.trim().toLowerCase() ?? ""]
    );

    const usuario = linhas[0];
    if (!usuario || !senha || !(await bcrypt.compare(senha, usuario.senha_hash))) {
        // a mesma mensagem nos dois casos: não contamos qual dos dois errou
        res.status(401).json({ erro: "E-mail ou senha inválidos." });
        return;
    }

    const token = jwt.sign({ id: usuario.id }, SEGREDO, { expiresIn: "8h" });
    res.json({ token, nome: usuario.nome });
});

// ---------- TAREFAS ----------
// Filtros opcionais na URL: /api/tarefas?status=pendente&busca=rev
app.get("/api/tarefas", exigirLogin, async (req, res) => {
    let sql = `${SELECT_TAREFAS} WHERE t.usuario_id = ?`;
    const valores: (string | number)[] = [usuarioDe(res)];
    const { status, busca } = req.query;

    if (typeof status === "string" && STATUS.includes(status as Status)) {
        sql += " AND t.status = ?"; // o filter, no banco
        valores.push(status);
    }
    if (typeof busca === "string" && busca.trim() !== "") {
        sql += " AND t.titulo LIKE ?"; // o includes, no banco
        valores.push(`%${busca.trim()}%`);
    }

    sql += " ORDER BY FIELD(t.prioridade, 'alta', 'media', 'baixa'), t.titulo"; // o sort
    const [linhas] = await banco.execute<RowDataPacket[]>(sql, valores);
    res.json(linhas.map(paraTarefa));
});

// Uma tarefa específica do usuário logado
app.get("/api/tarefas/:id", exigirLogin, async (req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_TAREFAS} WHERE t.id = ? AND t.usuario_id = ?`,
        [Number(req.params.id), usuarioDe(res)]
    );

    if (linhas.length === 0) {
        res.status(404).json({ erro: `Tarefa #${req.params.id} não encontrada.` });
        return;
    }
    res.json(paraTarefa(linhas[0]));
});

// ---------- O PAINEL: o GROUP BY faz o que o reduce fazia no front ----------
app.get("/api/estatisticas", exigirLogin, async (_req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `SELECT status, COUNT(*) AS quantidade
         FROM tarefas
         WHERE usuario_id = ?
         GROUP BY status`,
        [usuarioDe(res)]
    );

    // começa com zeros: o GROUP BY não devolve linha para status sem tarefa
    const contagem: Record<Status, number> = { pendente: 0, em_andamento: 0, concluida: 0 };
    for (const linha of linhas) {
        contagem[linha.status as Status] = Number(linha.quantidade);
    }
    res.json(contagem);
});

app.listen(3000, () => console.log("API do TaskFlow em http://localhost:3000"));