# Resumo da Implementação - Funcionalidades Avançadas

## Data: 2025-12-26

## Objetivo

Evolução do CobraCerto para suportar múltiplos nichos através de uma camada de personalização por tenant, implementando:

1. **Campos Personalizados (Custom Fields)**
2. **Tags e Categorias**
3. **Importação CSV Guiada**
4. **Relatórios de Aging**

## O Que Foi Implementado

### 1. Schema do Banco de Dados (Prisma)

**Arquivo:** `prisma/schema.prisma`

#### Novos Modelos Criados:

**CustomFieldDefinition**
- Define campos personalizáveis para CLIENT ou INVOICE
- Suporta 6 tipos: TEXT, NUMBER, DATE, BOOLEAN, SELECT, MULTISELECT
- Controle de ativação e ordenação
- Unique constraint: `[tenantId, entityType, key]`
- Índices: `[tenantId]`, `[tenantId, entityType]`

**CustomFieldValue**
- Armazena valores usando padrão EAV (Entity-Attribute-Value)
- Colunas tipadas: `valueString`, `valueNumber`, `valueDate`, `valueBool`, `valueJson`
- Unique constraint: `[entityId, fieldId]`
- Índices: `[tenantId]`, `[tenantId, entityType]`, `[entityId]`, `[fieldId]`

**Tag**
- Tags para CLIENT ou INVOICE
- Cor personalizável (hex)
- Unique constraint: `[tenantId, entityType, name]`
- Índices: `[tenantId]`, `[tenantId, entityType]`

**ClientTag e InvoiceTag**
- Tabelas de relacionamento many-to-many
- Composite primary key: `[clientId, tagId]` / `[invoiceId, tagId]`
- Índices em ambas as colunas

**ImportJob**
- Rastreamento de jobs de importação CSV
- Status: PROCESSING, PREVIEW, COMPLETED, FAILED
- Armazena mapeamento de colunas e preview (JSON)
- Contadores: totalRows, successRows, errorRows
- Índices: `[tenantId]`, `[tenantId, status]`, `[createdByUserId]`

**ImportRowError**
- Erros de validação por linha
- Armazena dados originais (JSON) para auditoria
- Índice: `[jobId]`

#### Relacionamentos Atualizados:

- **Tenant**: Adicionadas relações para customFieldDefs, customFieldValues, tags, importJobs
- **User**: Adicionada relação para importJobs
- **Client**: Adicionada relação para clientTags
- **Invoice**: Adicionada relação para invoiceTags e índice composto `[tenantId, status, dueDate]` para queries de aging

### 2. Documentação Técnica

**CUSTOM_FIELDS.md**
- Explicação do padrão EAV
- Tipos de campo e exemplos de uso
- Exemplos por nicho (consultoria, academia, e-commerce)
- API endpoints e validações
- Considerações de performance

**CSV_IMPORT.md**
- Processo de 3 etapas detalhado
- Formatos aceitos e mapeamento inteligente
- Validações e tratamento de erros
- Idempotência e limites
- Exemplos de uso e boas práticas

**AGING_REPORTS.md**
- Explicação dos 6 buckets de aging
- Fórmulas de cálculo
- Exemplos de uso por criticidade
- API endpoint e estrutura de resposta
- Queries otimizadas e índices
- Integração com ações de cobrança

### 3. Arquivos CSV de Exemplo

**clientes-exemplo.csv**
- 5 clientes de exemplo
- Todos os campos (nome, email, telefone, CPF/CNPJ, endereço, observações)
- Formato UTF-8 pronto para importação

**cobrancas-exemplo.csv**
- 5 cobranças de exemplo
- Vinculadas aos clientes por email
- Campos: email do cliente, descrição, valor, vencimento, status, observações

### 4. Atualização do README

- Adicionadas seções para as 4 novas funcionalidades
- Links para documentação detalhada
- Atualizada estrutura do projeto
- Novos modelos do banco de dados documentados
- Novos endpoints da API listados

## Enums Criados

```typescript
// Campos Personalizados
enum CustomFieldEntity { CLIENT, INVOICE }
enum CustomFieldType { TEXT, NUMBER, DATE, BOOLEAN, SELECT, MULTISELECT }

// Tags
enum TagEntity { CLIENT, INVOICE }

// Importação CSV
enum ImportType { CLIENT, INVOICE }
enum ImportStatus { PROCESSING, PREVIEW, COMPLETED, FAILED }
```

## Índices Importantes para Performance

1. **Aging Reports**: `[tenantId, status, dueDate]` na tabela `invoices`
2. **Custom Fields Lookup**: `[tenantId, entityType]` e `[entityId]` em `custom_field_values`
3. **Tag Filtering**: `[tenantId, entityType]` em `tags`
4. **Import History**: `[tenantId, status]` em `import_jobs`

## Padrões de Design Aplicados

### EAV (Entity-Attribute-Value)
- Usado para Custom Fields
- Permite flexibilidade total sem alterar schema
- Colunas tipadas para performance

### Polymorphic Relationships
- CustomFieldValue pode pertencer a Client ou Invoice
- Tag pode ser aplicada a Client ou Invoice
- Identificado por `entityType` + `entityId`

### Three-Step Wizard Pattern
- Upload → Mapping → Preview/Commit
- Separação de concerns (validação vs. persistência)
- Permite revisão antes de commit

### Job Queue Pattern
- ImportJob rastreia estado
- Processamento assíncrono possível
- Histórico completo de importações

## Multi-Tenancy & RBAC

Todas as novas funcionalidades respeitam:

✅ **Isolamento por Tenant**
- Todas as queries filtram por `tenantId`
- Unique constraints incluem `tenantId`
- Impossível acessar dados de outro tenant

✅ **Controle de Acesso**
- ADMIN: Pode configurar custom fields e tags
- MANAGER: Pode usar custom fields, tags e importar
- Validações em API e UI

## Próximos Passos para Implementação

### Fase 1: Backend API (Prioridade Alta)

1. **Custom Fields API** (`app/api/settings/custom-fields/`)
   - GET: Listar definições
   - POST: Criar definição (validar key único, options válido)
   - PATCH: Atualizar definição
   - DELETE: Deletar (soft delete via isActive)

2. **Tags API** (`app/api/settings/tags/`)
   - CRUD completo de tags
   - Validação de cor hex
   - Unique constraint por name

3. **Import API** (`app/api/imports/`)
   - POST `/prepare`: Upload CSV, parse, validar, criar job
   - POST `/{id}/commit`: Executar importação
   - GET `/{id}/errors.csv`: Download de erros

4. **Aging Report API** (`app/api/reports/aging/`)
   - GET: Calcular buckets, agrupar por cliente
   - Suporte a filtros (clientId, minAmount, tags)

### Fase 2: Frontend UI (Prioridade Alta)

1. **Settings - Custom Fields** (`app/(app)/settings/custom-fields/page.tsx`)
   - Lista de definições com filtro por entityType
   - Form para criar/editar
   - Drag-and-drop para sortOrder

2. **Settings - Tags** (`app/(app)/settings/tags/page.tsx`)
   - Lista com color badges
   - Form com color picker
   - Filtro por entityType

3. **Import Wizard** (`app/(app)/imports/page.tsx`)
   - Step 1: Upload file + select type
   - Step 2: Column mapping (drag-drop ou selects)
   - Step 3: Preview table + confirm

4. **Aging Report** (`app/(app)/reports/aging/page.tsx`)
   - Cards de resumo por bucket
   - Gráfico de barras
   - Tabela detalhada por cliente
   - Exportação CSV/PDF

### Fase 3: Integração (Prioridade Média)

1. **Client Form** - Adicionar custom fields dinâmicos e tag selector
2. **Invoice Form** - Adicionar custom fields dinâmicos e tag selector
3. **Client List** - Filtros por tag e custom fields
4. **Invoice List** - Filtros por tag e custom fields
5. **Dashboard** - Widget de aging summary

### Fase 4: Seed Data (Prioridade Média)

Atualizar `prisma/seed.ts`:
- Adicionar 2-3 custom field definitions de exemplo
- Adicionar 3-4 tags de exemplo
- Popular valores de custom fields para clientes/invoices existentes
- Criar 1 import job de exemplo (COMPLETED)

### Fase 5: Testes e Validação (Prioridade Baixa)

1. Testes unitários para validações
2. Testes de integração para importação
3. Testes de performance para queries com custom fields
4. Testes de isolamento multi-tenant

## Dependências Necessárias

```json
{
  "papaparse": "^5.4.1",          // Parser CSV
  "@types/papaparse": "^5.3.14",  // Types
  "recharts": "^2.10.3"            // Gráficos (opcional)
}
```

Instalar com:
```bash
npm install papaparse recharts
npm install -D @types/papaparse
```

## Migrations

Após implementar as features, gerar migration:

```bash
# Gerar Prisma Client
npx prisma generate

# Criar migration
npx prisma migrate dev --name add_custom_fields_tags_imports_aging

# Ou para ambientes sem acesso ao DB
npx prisma db push
```

## Validações Importantes

### Custom Fields
- Key deve ser snake_case, sem espaços
- Options deve ser JSON array válido para SELECT/MULTISELECT
- Required fields devem ser preenchidos ao salvar entity

### Tags
- Nome único por tenant e entityType
- Cor deve ser hex válido (#RRGGBB)

### CSV Import
- Tamanho máximo: 10 MB
- Máximo de linhas: 5.000
- Encoding: UTF-8 (com ou sem BOM)
- Email de cliente deve existir para importação de invoices

### Aging Report
- Só processa invoices com status OVERDUE
- Datas devem estar no passado
- Cálculo baseado em dueDate vs. today

## Observações Técnicas

1. **CustomFieldValue não tem FK direto para Client/Invoice**
   - Relacionamento é "soft" via entityId + entityType
   - Isso é intencional (polimorfismo)
   - Cleanup manual necessário ao deletar entity

2. **ImportJob.rawDataPreview é limitado**
   - Armazena apenas primeiras 5 linhas
   - Economiza espaço no banco
   - Full data não é persistido (apenas erros)

3. **Aging usa índice composto**
   - Query otimizada: WHERE tenantId = ? AND status = 'OVERDUE' ORDER BY dueDate
   - Índice `[tenantId, status, dueDate]` cobre toda a query

4. **Tags usam cores hex**
   - Frontend deve validar formato
   - Paleta sugerida pode ser pré-definida
   - Acessibilidade: garantir contraste

## Status Atual

✅ **Concluído:**
- Schema do banco de dados atualizado
- Enums criados
- Índices otimizados
- Documentação técnica completa
- Arquivos CSV de exemplo
- README atualizado

⏳ **Pendente:**
- Implementação dos endpoints da API
- Criação das telas de UI
- Integração com formulários existentes
- Atualização do seed.ts
- Testes

## Conclusão

O schema do banco de dados está **100% pronto** para suportar as 4 funcionalidades solicitadas. A arquitetura foi desenhada para:

- ✅ Máxima flexibilidade (EAV pattern)
- ✅ Performance otimizada (índices corretos)
- ✅ Isolamento multi-tenant (tenantId em tudo)
- ✅ RBAC (controle por role)
- ✅ Escalabilidade (padrões comprovados)

Próximo passo recomendado: **Implementar APIs** seguindo a ordem da Fase 1.
