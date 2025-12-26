# Configuração do Banco de Dados - CobraCerto

## Índice
1. [Opções de Banco de Dados](#opções-de-banco-de-dados)
2. [Setup MySQL/MariaDB Local](#setup-mysqlmariadb-local)
3. [Setup MySQL na Hostinger](#setup-mysql-na-hostinger)
4. [Setup PostgreSQL (Docker)](#setup-postgresql-docker)
5. [Configurar Prisma](#configurar-prisma)
6. [Popular Banco com Dados Demo](#popular-banco-com-dados-demo)
7. [Troubleshooting](#troubleshooting)

---

## Opções de Banco de Dados

O CobraCerto suporta **MySQL/MariaDB** (recomendado para Hostinger) ou **PostgreSQL** (recomendado para VPS/Docker).

### MySQL/MariaDB
✅ Recomendado para Hostinger
✅ Menor consumo de recursos
✅ Amplamente suportado

### PostgreSQL
✅ Recomendado para VPS/Docker
✅ Mais recursos avançados
✅ Melhor performance em queries complexas

---

## Setup MySQL/MariaDB Local

### Windows

#### Opção 1: XAMPP (Mais Fácil)

1. **Baixar e Instalar XAMPP**
   - Acesse: https://www.apachefriends.org/
   - Baixe a versão mais recente
   - Instale (aceite as configurações padrão)

2. **Iniciar MySQL**
   - Abra o XAMPP Control Panel
   - Clique em "Start" ao lado de "MySQL"
   - Aguarde até ficar verde

3. **Criar Banco de Dados**
   - Abra o navegador: http://localhost/phpmyadmin
   - Clique em "Novo" (ou "New")
   - Nome do banco: `cobracerto`
   - Collation: `utf8mb4_unicode_ci`
   - Clique em "Criar"

4. **Configurar .env**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/cobracerto"
   ```

   **Nota:** A senha padrão do XAMPP é vazia. Se você definiu uma senha:
   ```env
   DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/cobracerto"
   ```

#### Opção 2: MySQL Community Server

1. **Baixar MySQL**
   - Acesse: https://dev.mysql.com/downloads/mysql/
   - Baixe "MySQL Installer for Windows"

2. **Instalar**
   - Execute o instalador
   - Escolha "Developer Default"
   - **IMPORTANTE:** Anote a senha do root que você definir!

3. **Criar Banco via MySQL Workbench**
   - Abra MySQL Workbench (instalado junto)
   - Conecte com root
   - Execute:
   ```sql
   CREATE DATABASE cobracerto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Configurar .env**
   ```env
   DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/cobracerto"
   ```

### Linux

1. **Instalar MySQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server

   # Fedora/RHEL
   sudo dnf install mysql-server
   ```

2. **Iniciar Serviço**
   ```bash
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

3. **Configurar Segurança (Opcional mas Recomendado)**
   ```bash
   sudo mysql_secure_installation
   ```

4. **Criar Banco de Dados**
   ```bash
   sudo mysql
   ```

   No prompt do MySQL:
   ```sql
   CREATE DATABASE cobracerto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'cobracerto'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
   GRANT ALL PRIVILEGES ON cobracerto.* TO 'cobracerto'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Configurar .env**
   ```env
   DATABASE_URL="mysql://cobracerto:senha_forte_aqui@localhost:3306/cobracerto"
   ```

### macOS

1. **Instalar via Homebrew**
   ```bash
   brew install mysql
   ```

2. **Iniciar MySQL**
   ```bash
   brew services start mysql
   ```

3. **Criar Banco**
   ```bash
   mysql -u root
   ```

   ```sql
   CREATE DATABASE cobracerto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

4. **Configurar .env**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/cobracerto"
   ```

---

## Setup MySQL na Hostinger

### Passo 1: Criar Banco de Dados

1. **Acessar hPanel**
   - Faça login em: https://hpanel.hostinger.com
   - Vá para o site desejado

2. **Criar Database**
   - Menu lateral: **Databases** → **MySQL Databases**
   - Clique em **"Create New Database"**

3. **Preencher Informações**
   ```
   Database Name: cobracerto_db
   Username: cobracerto_user
   Password: [GERE UMA SENHA FORTE]
   ```

   **IMPORTANTE:** Anote estas informações!

4. **Anotar Hostname**
   - Na lista de databases, clique no database criado
   - Copie o **Hostname** (ex: `mysql.hostinger.com` ou um IP)

### Passo 2: Configurar Acesso Remoto (Para Desenvolvimento)

1. **Adicionar IP Remoto** (Opcional - apenas se quiser acessar de fora)
   - Na página do database, procure **"Remote MySQL"**
   - Adicione seu IP público
   - Salve

### Passo 3: Configurar .env

**Para ambiente de produção (no servidor):**
```env
DATABASE_URL="mysql://cobracerto_user:SUA_SENHA@mysql.hostinger.com:3306/cobracerto_db"
```

**Para desenvolvimento local (se liberou acesso remoto):**
```env
DATABASE_URL="mysql://cobracerto_user:SUA_SENHA@mysql.hostinger.com:3306/cobracerto_db?sslaccept=strict"
```

### Passo 4: Testar Conexão

```bash
# Via MySQL Workbench (Windows/Mac)
# Host: mysql.hostinger.com
# Port: 3306
# Username: cobracerto_user
# Password: [sua senha]

# Via terminal (Linux/Mac)
mysql -h mysql.hostinger.com -u cobracerto_user -p cobracerto_db
```

---

## Setup PostgreSQL (Docker)

### Usando Docker Compose

1. **Criar arquivo docker-compose.yml** (já existe no projeto)
   ```yaml
   version: '3.8'

   services:
     postgres:
       image: postgres:15-alpine
       environment:
         POSTGRES_DB: cobracerto
         POSTGRES_USER: cobracerto
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. **Configurar .env**
   ```env
   DB_PASSWORD=sua_senha_forte_aqui
   DATABASE_URL="postgresql://cobracerto:sua_senha_forte_aqui@localhost:5432/cobracerto"
   ```

3. **Atualizar schema.prisma**
   ```prisma
   datasource db {
     provider = "postgresql"  // Mudar de "mysql" para "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Iniciar PostgreSQL**
   ```bash
   docker-compose up -d postgres
   ```

5. **Verificar se está rodando**
   ```bash
   docker-compose ps
   ```

---

## Configurar Prisma

Após configurar o banco de dados e o `.env`, execute:

### 1. Instalar Dependências (se ainda não instalou)
```bash
npm install
```

### 2. Gerar Prisma Client
```bash
npx prisma generate
```

### 3. Criar Tabelas no Banco

**Opção A: Push direto (Desenvolvimento)**
```bash
npx prisma db push
```

**Opção B: Migrations (Recomendado para Produção)**
```bash
npx prisma migrate dev --name init
```

**Diferença:**
- `db push`: Sincroniza schema diretamente, mais rápido, sem histórico
- `migrate dev`: Cria arquivo de migração, com versionamento, recomendado

### 4. Verificar Estrutura

Abra o Prisma Studio para visualizar:
```bash
npx prisma studio
```

Acesse: http://localhost:5555

---

## Popular Banco com Dados Demo

### 1. Popular com Seed Script

```bash
npm run db:seed
```

Isso criará:
- ✅ 1 Tenant demo: "Empresa Demo Ltda"
- ✅ 2 Usuários:
  - **Admin**: admin@demo.com / senha: admin123
  - **Manager**: manager@demo.com / senha: admin123
- ✅ 5 Clientes de exemplo
- ✅ 10 Cobranças de exemplo (variando status)
- ✅ Regras de lembrete padrão
- ✅ 3 Tags de exemplo (VIP, Atacado, Novo)
- ✅ 2 Custom Fields de exemplo

### 2. Verificar Dados

**Via Prisma Studio:**
```bash
npx prisma studio
```

**Via SQL (MySQL):**
```bash
mysql -u root -p cobracerto
```
```sql
SELECT * FROM tenants;
SELECT * FROM users;
SELECT * FROM clients;
SELECT * FROM invoices;
```

**Via SQL (PostgreSQL):**
```bash
docker-compose exec postgres psql -U cobracerto -d cobracerto
```
```sql
SELECT * FROM tenants;
\q
```

---

## Troubleshooting

### Erro: "Can't connect to MySQL server"

**Causa:** MySQL não está rodando

**Solução:**
```bash
# Windows (XAMPP)
# Abra XAMPP Control Panel e inicie MySQL

# Linux
sudo systemctl start mysql

# macOS
brew services start mysql

# Docker
docker-compose up -d postgres
```

### Erro: "Access denied for user"

**Causa:** Usuário/senha incorretos

**Solução:**
1. Verifique o `.env`
2. Teste a conexão manualmente:
   ```bash
   mysql -u root -p
   ```
3. Se necessário, resete a senha:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
   FLUSH PRIVILEGES;
   ```

### Erro: "Unknown database 'cobracerto'"

**Causa:** Banco não foi criado

**Solução:**
```sql
CREATE DATABASE cobracerto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Erro: "Prisma Client did not initialize yet"

**Causa:** Prisma Client não foi gerado

**Solução:**
```bash
npx prisma generate
```

### Erro: "P1001: Can't reach database server"

**Causa:** Hostname/porta incorretos

**Solução:**
1. Verifique o `DATABASE_URL` no `.env`
2. Teste a conexão:
   ```bash
   # MySQL
   mysql -h SEU_HOST -P 3306 -u SEU_USER -p

   # PostgreSQL
   psql -h localhost -p 5432 -U cobracerto -d cobracerto
   ```

### Erro: "SSL connection error" (Hostinger)

**Causa:** Falta configuração SSL

**Solução:**
Adicione `?sslaccept=strict` na URL:
```env
DATABASE_URL="mysql://user:pass@mysql.hostinger.com:3306/db?sslaccept=strict"
```

### Erro na Migration: "Table already exists"

**Causa:** Tabela já existe de tentativa anterior

**Solução:**
```bash
# Resetar completamente (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Ou deletar manualmente as tabelas e tentar novamente
```

### Performance Lenta em Desenvolvimento

**Causa:** Conexões múltiplas em dev mode

**Solução:**
Adicione ao `lib/db.ts`:
```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Remove em produção
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Checklist Final

Antes de prosseguir, verifique:

- [ ] Banco de dados criado
- [ ] `.env` configurado com `DATABASE_URL` correto
- [ ] `npx prisma generate` executado com sucesso
- [ ] `npx prisma db push` ou `migrate dev` executado
- [ ] `npm run db:seed` executado (dados demo criados)
- [ ] `npx prisma studio` abre e mostra as tabelas
- [ ] Login funciona: admin@demo.com / admin123

---

## Comandos Úteis de Referência

```bash
# Ver status do banco
npx prisma studio

# Resetar banco (CUIDADO!)
npx prisma migrate reset

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Formatar schema.prisma
npx prisma format

# Validar schema.prisma
npx prisma validate

# Ver SQL que será executado
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

---

## Próximos Passos

Após configurar o banco:

1. ✅ Inicie o servidor: `npm run dev`
2. ✅ Acesse: http://localhost:3000
3. ✅ Faça login: admin@demo.com / admin123
4. ✅ Explore o dashboard e funcionalidades

---

**Precisa de ajuda?** Abra uma issue no GitHub ou consulte a [documentação do Prisma](https://www.prisma.io/docs).
