# Sistema de Cursos Online - Front-end (React + Vite + TypeScript)

Front-end que consome a API REST de **Cursos Online** (Node.js, Express,
Sequelize, PostgreSQL). Permite gerenciar **Categorias** (cada uma com uma
duração em meses) e **Matrículas** (aluno + data de início + categoria), onde a
**data de término do acesso é calculada automaticamente** a partir da duração da
categoria.

Stack: **Vite + React + TypeScript**, **axios**, **react-router-dom** e
**CSS Modules** (sem Bootstrap, sem Create React App).

## Pré-requisitos

- Node.js 18+ e npm
- A API da etapa anterior rodando em `http://localhost:3000`

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

> O Vite faz proxy de `/api` → `http://localhost:3000` (ver `vite.config.ts`),
> então a API precisa estar de pé na porta 3000. Para apontar para outra URL,
> crie um arquivo `.env` com `VITE_API_URL=http://seu-host:porta`.

Build de produção:

```bash
npm run build
npm run preview
```

## Integração com a API (todos os métodos usados)

| Recurso    | Método | Rota               | Onde é usado no front-end                         |
| ---------- | ------ | ------------------ | ------------------------------------------------- |
| Categorias | GET    | `/categories`      | Lista, Painel, dropdown da matrícula              |
| Categorias | GET    | `/categories/:id`  | Detalhe da categoria, pré-preenchimento da edição |
| Categorias | POST   | `/categories`      | Cadastro de categoria                             |
| Categorias | PUT    | `/categories/:id`  | Edição de categoria                               |
| Categorias | DELETE | `/categories/:id`  | Exclusão (lista e detalhe)                        |
| Matrículas | GET    | `/enrollments`     | Lista, Painel, alunos por categoria               |
| Matrículas | GET    | `/enrollments/:id` | Detalhe da matrícula, pré-preenchimento da edição |
| Matrículas | POST   | `/enrollments`     | Cadastro (API calcula `endDate`)                  |
| Matrículas | PUT    | `/enrollments/:id` | Edição (`endDate` recalculado no cliente)         |
| Matrículas | DELETE | `/enrollments/:id` | Exclusão (lista e detalhe)                        |

## Rotas da aplicação

- `/` - Painel (visão geral)
- `/categorias` - listagem · `/categorias/nova` - cadastro
- `/categorias/:id` - detalhe · `/categorias/:id/editar` - edição
- `/matriculas` - listagem · `/matriculas/nova` - cadastro
- `/matriculas/:id` - detalhe · `/matriculas/:id/editar` - edição

## Estrutura

```
src/
├── api/            axios + serviços (categories.ts, enrollments.ts)
├── components/     Layout, Toast, ConfirmDialog, StateBlock, PageHeader (+ CSS Modules)
├── hooks/          dates.ts (regra de negócio do término + formatação pt-BR)
├── pages/          home / categories / enrollments (cada uma com .module.css)
├── types/          tipos do domínio (Category, Enrollment, payloads)
├── styles/         global.css (design tokens)
├── App.tsx         roteamento
└── main.tsx        entrada (BrowserRouter + ToastProvider)
```

## Notas de implementação

- **Hooks**: `useState`/`useEffect` para dados, carregamento e erros;
  `useMemo` para o cálculo da prévia do término; `useRef`/contexto para os
  toasts; `useParams`/`useNavigate` para navegação.
- **Feedback**: sistema de notificações próprio (sucesso/erro) e diálogo de
  confirmação para exclusões.
- **Regra de negócio**: na criação, a API calcula `endDate`. Na edição, o PUT da
  API não recalcula, então o front-end recalcula com a mesma regra
  (`início + duração em meses`) e envia o valor, mantendo a consistência.

```

```
