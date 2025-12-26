# CobraCerto

Sistema SaaS de Cobrança e Inadimplência para pequenos negócios (prestadores, clínicas, estúdios, assistências, oficinas etc.).

## Funcionalidades MVP

### Gestão Multi-Tenant
- Cadastro de empresas (tenants) com planos diferenciados
- Sistema de autenticação seguro com NextAuth
- Controle de acesso baseado em papéis (RBAC):
  - **ADMIN**: Acesso total ao tenant, gerenciamento de usuários e configurações
  - **MANAGER**: CRUD de clientes e faturas, sem acesso a usuários e planos

### Cadastro de Clientes
- Gerenciamento completo de clientes do tenant
- Campos: nome, email, telefone, CPF/CNPJ, endereço, observações
- Busca e filtros
- Visualização de histórico de cobranças

### Cobranças/Faturas
- Criação de cobranças com valor, vencimento, descrição
- Status: PENDENTE, PAGA, ATRASADA, CANCELADA
- Recorrência configurável (semanal, mensal, anual)
- Geração automática de próximas faturas
- Marcar como paga
- Renegociação (atualizar vencimento)
- Exportação CSV

### Dashboard
- Total a receber
- Cobranças vencendo em 7 dias
- Cobranças atrasadas
- Valor recebido no mês
- Listas rápidas de ações necessárias

### Lembretes Automáticos
- Sistema de lembretes por e-mail configurável por tenant
- Padrão: 3 dias antes, no dia, 3/7/15 dias após vencimento
- Templates de e-mail personalizáveis
- Fila de envio com retry automático
- Histórico completo de contatos registrado

### Campos Personalizados
- Sistema EAV flexível para customizar Clientes e Cobranças
- 6 tipos de campo: TEXT, NUMBER, DATE, BOOLEAN, SELECT, MULTISELECT
- Configuração por ADMIN, uso por MANAGER
- Adapta-se a qualquer nicho: consultoria, academia, e-commerce, etc.
- [📖 Documentação completa](./docs/CUSTOM_FIELDS.md)

### Tags e Categorias
- Sistema de etiquetagem para Clientes e Cobranças
- Cores personalizáveis para organização visual
- Filtros rápidos por tag
- Multi-tenant com controle de acesso

### Importação CSV Guiada
- Wizard em 3 etapas: Upload → Mapeamento → Preview
- Mapeamento inteligente de colunas
- Validação completa com relatório de erros
- Suporte para Clientes e Cobranças
- Idempotência para evitar duplicação
- [📖 Documentação completa](./docs/CSV_IMPORT.md)
- [📁 Exemplos CSV](./docs/csv-examples/)

### Relatórios de Aging
- Análise de envelhecimento de contas a receber
- 6 buckets padrão: 0-7, 8-15, 16-30, 31-60, 61-90, 90+ dias
- Visão por cliente e agregada
- Gráficos e exportação (CSV/PDF)
- Ideal para gestão de cobrança e projeção de fluxo de caixa
- [📖 Documentação completa](./docs/AGING_REPORTS.md)

### Planos do SaaS
- **Starter**: Até 200 cobranças/mês, 1 usuário, lembretes básicos
- **Pro**: Até 1.000 cobranças/mês, até 3 usuários, regras configuráveis
- **Business**: Ilimitado, usuários ilimitados, múltiplos templates, relatórios

## Stack Técnica

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: TailwindCSS
- **ORM**: Prisma
- **Banco de Dados**: MySQL/MariaDB (Hostinger) ou PostgreSQL (VPS)
- **Autenticação**: NextAuth (Auth.js) com JWT
- **E-mail**: SMTP com NodeMailer
- **Jobs**: Endpoint protegido + Cron

## Estrutura do Projeto

```
CobraCerto/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── imports/          # CSV Import wizard
│   │   ├── reports/          # Aging and other reports
│   │   └── settings/
│   │       ├── custom-fields/  # Custom field definitions
│   │       └── tags/           # Tag management
│   ├── (marketing)/
│   │   └── pricing/
│   ├── api/
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── imports/          # Import API endpoints
│   │   ├── reports/          # Report API endpoints
│   │   ├── settings/         # Settings API endpoints
│   │   └── jobs/
│   ├── globals.css
│   └── layout.tsx
├── components/
├── docs/
│   ├── csv-examples/         # Example CSV files
│   ├── CUSTOM_FIELDS.md      # Custom fields documentation
│   ├── CSV_IMPORT.md         # CSV import documentation
│   └── AGING_REPORTS.md      # Aging reports documentation
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── email.ts
│   ├── email-templates.ts    # Email templates for reminders
│   ├── rbac.ts
│   └── tenant.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Setup Local

### Pré-requisitos

- Node.js 18+ instalado
- MySQL/MariaDB ou PostgreSQL
- Conta de e-mail SMTP (Hostinger, Gmail, etc.)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd CobraCerto
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="mysql://user:password@localhost:3306/cobracerto"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-secreta-forte-aqui"
JOB_TOKEN="seu-token-secreto-para-jobs"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="noreply@seudominio.com"
SMTP_PASS="sua-senha-smtp"
SMTP_FROM="CobraCerto <noreply@seudominio.com>"
```

Para gerar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. **Configure o banco de dados**

**📖 [Guia Completo de Configuração do Banco](./docs/DATABASE_SETUP.md)**

Opções rápidas:

**MySQL Local (XAMPP):**
```env
DATABASE_URL="mysql://root:@localhost:3306/cobracerto"
```

**MySQL Hostinger:**
```env
DATABASE_URL="mysql://cobracerto_user:SENHA@mysql.hostinger.com:3306/cobracerto_db"
```

**PostgreSQL (Docker):**
```env
DATABASE_URL="postgresql://cobracerto:SENHA@localhost:5432/cobracerto"
```

Após configurar o `.env`, execute:

```bash
# Gerar o Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Ou criar migrations (recomendado para produção)
npx prisma migrate dev --name init
```

5. **Popule o banco com dados de demonstração**
```bash
npm run db:seed
```

Isso criará:
- 1 tenant demo
- 2 usuários: admin@demo.com e manager@demo.com (senha: admin123)
- 2 clientes de exemplo
- 3 faturas de exemplo
- Regras de lembrete padrão

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse: http://localhost:3000

7. **Faça login**
- Email: `admin@demo.com`
- Senha: `admin123`

## Deploy na Hostinger

### Opção A: Hostinger Web/Cloud (Node.js Web App)

A Hostinger oferece hospedagem Node.js em alguns planos. Siga este guia:

#### 1. Criar Banco de Dados MariaDB

1. Entre no hPanel da Hostinger
2. Vá em **Databases** > **MySQL Databases**
3. Crie um novo banco:
   - Nome: `cobracerto`
   - Usuário: `cobracerto_user`
   - Senha: (anote a senha)
4. Anote o hostname do banco (ex: `mysql.hostinger.com` ou IP)

#### 2. Configurar Node.js App

1. No hPanel, vá em **Websites** > **Node.js**
2. Crie uma nova aplicação Node.js:
   - Versão do Node: 20.x
   - Modo: Production
   - Porta: 3000
   - Entry point: `npm start`

#### 3. Fazer Upload do Código

Você pode usar FTP ou Git:

**Via FTP:**
```bash
# Build localmente primeiro
npm run build

# Faça upload via FTP de todos os arquivos, exceto:
# - node_modules (será instalado no servidor)
# - .next (será gerado no build)
# - .env (configure no painel)
```

**Via Git (recomendado):**
```bash
# Configure Git no hPanel e faça push
git push hostinger main
```

#### 4. Configurar Variáveis de Ambiente

No painel Node.js da Hostinger, adicione:

```
DATABASE_URL=mysql://cobracerto_user:SENHA@mysql.hostinger.com:3306/cobracerto
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua-chave-secreta
JOB_TOKEN=seu-token-job
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@seudominio.com
SMTP_PASS=senha-email
SMTP_FROM=CobraCerto <noreply@seudominio.com>
NODE_ENV=production
```

#### 5. Instalar Dependências e Build

Via SSH da Hostinger:
```bash
cd ~/htdocs/cobracerto
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
```

#### 6. Iniciar Aplicação

```bash
npm start
```

A aplicação estará rodando em `https://seudominio.com`

#### 7. Configurar Cron Job para Lembretes

No hPanel, vá em **Advanced** > **Cron Jobs**:

- **Comando:**
```bash
curl -X POST https://seudominio.com/api/jobs/run-reminders -H "Authorization: Bearer SEU_JOB_TOKEN"
```

- **Frequência**: A cada 1 hora (ou conforme necessário)
- **Exemplo cron**: `0 * * * *` (a cada hora)

### Opção B: Hostinger VPS (Docker)

Para maior controle, use um VPS com Docker:

#### 1. Conectar ao VPS via SSH

```bash
ssh root@seu-vps-ip
```

#### 2. Instalar Docker e Docker Compose

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y
```

#### 3. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd CobraCerto
```

#### 4. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

**IMPORTANTE**: No `.env`, use PostgreSQL ao invés de MySQL:

```env
DATABASE_URL="postgresql://cobracerto:changeme123@postgres:5432/cobracerto"
DB_PASSWORD=sua-senha-postgres-segura
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua-chave-secreta
JOB_TOKEN=seu-token-job
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@seudominio.com
SMTP_PASS=senha-email
SMTP_FROM=CobraCerto <noreply@seudominio.com>
```

#### 5. Atualizar schema.prisma para PostgreSQL

Edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Mude de "mysql" para "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 6. Build e Iniciar com Docker

```bash
# Build das imagens
docker-compose build

# Iniciar os containers
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

#### 7. Executar Migrations e Seed

```bash
# Entrar no container
docker-compose exec app sh

# Gerar Prisma Client
npx prisma generate

# Criar tabelas
npx prisma db push

# Popular dados
npx prisma db seed

# Sair
exit
```

#### 8. Configurar Nginx como Reverse Proxy

```bash
apt install nginx -y

# Criar configuração
nano /etc/nginx/sites-available/cobracerto
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:
```bash
ln -s /etc/nginx/sites-available/cobracerto /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 9. Configurar SSL com Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d seudominio.com
```

#### 10. Configurar Cron para Lembretes

```bash
crontab -e
```

Adicione:
```
0 * * * * curl -X POST https://seudominio.com/api/jobs/run-reminders -H "Authorization: Bearer SEU_JOB_TOKEN"
```

#### 11. Gerenciar com Portainer (Opcional)

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data portainer/portainer-ce
```

Acesse: `http://seu-vps-ip:9000`

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev                  # Iniciar servidor dev
npm run build                # Build para produção
npm start                    # Iniciar em produção

# Prisma
npx prisma studio            # Visualizar banco de dados
npx prisma generate          # Gerar Prisma Client
npx prisma db push           # Atualizar schema sem migrations
npx prisma migrate dev       # Criar migration
npm run db:seed              # Popular banco com dados demo

# Docker
docker-compose up -d         # Iniciar containers
docker-compose down          # Parar containers
docker-compose logs -f app   # Ver logs da aplicação
docker-compose restart app   # Reiniciar app
```

## Segurança

### Checklist Implementado

✅ **Autenticação segura**
- Hashing de senhas com bcrypt (10 rounds)
- JWT tokens para sessões
- NextAuth com proteção CSRF

✅ **Validação de entrada**
- Zod para validação de schemas
- Sanitização automática de inputs

✅ **Proteção Multi-Tenant**
- Isolamento total de dados por tenant
- Validação de acesso em todas as queries
- Middleware protegendo rotas

✅ **RBAC (Role-Based Access Control)**
- Permissões granulares por role
- Validação em API e UI

✅ **Rate Limiting**
- Implementado no NextAuth para login
- Proteção contra força bruta

✅ **Variáveis de ambiente**
- Secrets não commitados no Git
- `.env.example` para referência

### Recomendações Adicionais

Para produção, considere:
- [ ] Implementar rate limiting global (ex: express-rate-limit)
- [ ] Adicionar logs de auditoria
- [ ] Configurar CORS adequadamente
- [ ] Habilitar HTTPS obrigatório
- [ ] Backups automáticos do banco
- [ ] Monitoramento (Sentry, LogRocket)
- [ ] WAF (Web Application Firewall)

## Estrutura do Banco de Dados

### Modelos Principais

- **Tenant**: Empresas que usam o SaaS
- **User**: Usuários de cada tenant (ADMIN/MANAGER)
- **Client**: Clientes finais do tenant
- **Invoice**: Cobranças/Faturas
- **InvoiceEvent**: Histórico de eventos das faturas
- **ReminderRule**: Regras de lembrete configuráveis
- **EmailOutbox**: Fila de e-mails para envio
- **CustomFieldDefinition**: Definição de campos personalizados
- **CustomFieldValue**: Valores dos campos personalizados (EAV)
- **Tag**: Tags/categorias para organização
- **ClientTag / InvoiceTag**: Relacionamentos de tags
- **ImportJob**: Jobs de importação CSV
- **ImportRowError**: Erros de importação por linha

## API Endpoints

### Autenticação
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/[id]` - Buscar cliente
- `PATCH /api/clients/[id]` - Atualizar cliente
- `DELETE /api/clients/[id]` - Deletar cliente (soft delete)

### Faturas
- `GET /api/invoices` - Listar faturas
- `POST /api/invoices` - Criar fatura
- `GET /api/invoices/[id]` - Buscar fatura
- `PATCH /api/invoices/[id]` - Atualizar fatura
- `POST /api/invoices/[id]/mark-paid` - Marcar como paga
- `GET /api/invoices/export` - Exportar CSV

### Configurações (Settings)
- `GET /api/settings/custom-fields` - Listar definições de campos personalizados
- `POST /api/settings/custom-fields` - Criar campo personalizado (ADMIN only)
- `PATCH /api/settings/custom-fields/[id]` - Atualizar campo (ADMIN only)
- `DELETE /api/settings/custom-fields/[id]` - Deletar campo (ADMIN only)
- `GET /api/settings/tags` - Listar tags
- `POST /api/settings/tags` - Criar tag
- `PATCH /api/settings/tags/[id]` - Atualizar tag
- `DELETE /api/settings/tags/[id]` - Deletar tag

### Importações
- `POST /api/imports/prepare` - Upload e mapeamento de CSV
- `POST /api/imports/[id]/commit` - Confirmar importação
- `GET /api/imports/[id]/errors.csv` - Baixar relatório de erros

### Relatórios
- `GET /api/reports/aging` - Relatório de aging (envelhecimento)

### Jobs
- `POST /api/jobs/run-reminders` - Executar job de lembretes (protegido por JOB_TOKEN)

## Evolução Futura

Funcionalidades planejadas (não no MVP):

- [ ] Integração com gateways de pagamento (Stripe, Mercado Pago)
- [ ] Portal do cliente (visualizar boletos)
- [ ] WhatsApp para lembretes
- [ ] Relatórios avançados e dashboards
- [ ] Notas fiscais eletrônicas
- [ ] App mobile
- [ ] Webhooks para integrações
- [ ] Multi-moeda
- [ ] Temas personalizáveis

## Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato: suporte@cobracerto.com

## Licença

Proprietário - Todos os direitos reservados

---

**CobraCerto** - Simplifique sua cobrança, elimine a inadimplência.
