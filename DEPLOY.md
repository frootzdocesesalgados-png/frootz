# Deploy Profissional — Frootz - Doces & Salgados

## Arquitetura do Projeto

```
Repositório GitHub (monorepo)
├── Frontend React      → Netlify  (site estático)
└── API Node.js + DB   → Railway  (servidor + PostgreSQL)
```

O painel admin, CRUD de produtos/categorias e configurações dependem da API.
**Sem o Railway rodando, o site não funciona.**

---

## Passo 1 — Subir no GitHub

1. Acesse [github.com/new](https://github.com/new) e crie um repositório
   - Nome sugerido: `frootz`
   - Visibilidade: **Private** (recomendado)
   - **Não** marque "Add a README file"
   - Clique em **Create repository**

2. No Shell do Replit, execute:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/frootz.git
   git push -u origin main
   ```

3. Atualize a página do GitHub — todos os arquivos devem aparecer.

---

## Passo 2 — Deploy da API no Railway

A API (Node.js + Express + PostgreSQL) vai no Railway.

### 2.1 Criar o projeto

1. Acesse [railway.app](https://railway.app) → faça login com o GitHub
2. Clique em **New Project** → **Deploy from GitHub repo**
3. Selecione o repositório `frootz`
4. Railway vai detectar o `railway.toml` na raiz e usar as configurações corretas

### 2.2 Adicionar o banco de dados PostgreSQL

1. No painel do projeto Railway, clique em **+ New** → **Database** → **Add PostgreSQL**
2. Aguarde o PostgreSQL provisionar (30-60 segundos)
3. Clique no serviço PostgreSQL → aba **Variables**
4. Copie o valor de `DATABASE_URL`

### 2.3 Configurar variáveis de ambiente da API

Clique no serviço da API → aba **Variables** → adicione:

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Cole o valor copiado do PostgreSQL |
| `SESSION_SECRET` | Qualquer string longa e aleatória (ex: `frootz_prod_2024_abc123xyz`) |
| `ADMIN_USERNAME` | `admin` (ou o usuário que quiser) |
| `ADMIN_PASSWORD` | Uma senha segura (ex: `MinhaSenh@Forte2024`) |
| `FRONTEND_URL` | Deixe vazio por enquanto — preencha após o Passo 3 |

### 2.4 Executar as migrações do banco

Após o deploy da API, crie as tabelas:

1. No Railway, clique no serviço da API → aba **Settings** → **Deploy** → role até **Deploy Command**
2. Abra o terminal do Railway (aba **Shell**) e execute:
   ```bash
   pnpm --filter @workspace/db run push
   ```
   Ou pelo Replit Shell (com o DATABASE_URL de produção):
   ```bash
   DATABASE_URL="postgresql://..." pnpm --filter @workspace/db run push
   ```

### 2.5 Verificar que a API está funcionando

Abra no navegador:
```
https://SEU-PROJETO.up.railway.app/api/healthz
```
Deve retornar: `{"status":"ok"}`

---

## Passo 3 — Deploy do Frontend no Netlify

O frontend React vai no Netlify como site estático.

### 3.1 Criar o site

1. Acesse [app.netlify.com](https://app.netlify.com) → faça login com o GitHub
2. Clique em **Add new site** → **Import an existing project**
3. Escolha **GitHub** → autorize e selecione o repositório `frootz`
4. Netlify vai ler o `netlify.toml` da raiz automaticamente — as configurações já estão corretas:
   - **Base directory:** `.` (raiz do projeto)
   - **Build command:** `pnpm install --frozen-lockfile && pnpm --filter @workspace/frootz run build:netlify`
   - **Publish directory:** `artifacts/frootz/dist/public`

### 3.2 Configurar variáveis de ambiente do frontend

Em **Site Settings** → **Environment Variables** → **Add a variable**:

| Variável | Valor |
|----------|-------|
| `VITE_API_BASE_URL` | `https://SEU-PROJETO.up.railway.app` |

> A URL é a do Railway, **sem barra no final**, **sem `/api`**.

5. Clique em **Deploy site** — aguarde 2-3 minutos
6. Ao terminar, copie a URL do site (ex: `https://frootz-xpto.netlify.app`)

---

## Passo 4 — Conectar Frontend ↔ API (CORS)

1. Volte ao Railway → serviço da API → **Variables**
2. Adicione ou atualize:
   ```
   FRONTEND_URL = https://frootz-xpto.netlify.app
   ```
   > Use a URL real do seu site no Netlify, sem barra no final.
3. O Railway vai fazer redeploy automático

---

## Passo 5 — Domínio personalizado (opcional)

### No Netlify:
1. **Domain settings** → **Add custom domain** → `www.seudominio.com.br`
2. Configure o DNS conforme instruído (normalmente um CNAME apontando para o Netlify)

### No Railway (se quiser domínio próprio na API):
1. Serviço API → **Settings** → **Domains** → **Add domain**

### Atualizar FRONTEND_URL se usar domínio próprio:
```
FRONTEND_URL = https://www.seudominio.com.br
```

---

## Atualizando o Site

Todo `git push` aciona redeploy automático no Netlify e Railway:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

---

## Configurações Pós-Deploy

Acesse `https://seu-site.netlify.app/admin` com as credenciais configuradas no Railway:

| Área | Caminho |
|------|---------|
| Login admin | `/admin` |
| Dashboard | `/admin/dashboard` |
| Produtos | `/admin/products` |
| Categorias | `/admin/categories` |
| Configurações da loja | `/admin/settings` |

Em **Configurações da Loja**, preencha:
- Número do WhatsApp real
- Nome da loja
- URL da logo

---

## Variáveis de Ambiente — Referência Completa

### Railway (API Server)
| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | URL PostgreSQL (gerado pelo Railway) |
| `SESSION_SECRET` | ✅ | String aleatória longa para segurança da sessão |
| `NODE_ENV` | ✅ | `production` |
| `ADMIN_USERNAME` | ❌ | Padrão: `admin` |
| `ADMIN_PASSWORD` | ❌ | Padrão: `frootz2024` — **mude em produção!** |
| `FRONTEND_URL` | ✅ | URL do Netlify (ex: `https://frootz.netlify.app`) |
| `PORT` | ❌ | Definido automaticamente pelo Railway |

### Netlify (Frontend)
| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `VITE_API_BASE_URL` | ✅ | URL da API no Railway (sem barra no final) |

---

## Solução de Problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Site abre mas produtos não carregam | `VITE_API_BASE_URL` errada | Verifique a URL da API no Railway |
| Login admin não funciona | `FRONTEND_URL` não configurada | Adicione no Railway e redeploy |
| Tabelas não existem | Migrações não rodaram | Execute `pnpm --filter @workspace/db run push` |
| Build do Netlify falha | `NODE_VERSION` ou `PNPM_VERSION` erradas | Verifique o `netlify.toml` |
| API retorna 500 | `DATABASE_URL` errada | Confirme a variável no Railway |
