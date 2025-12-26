# Importação CSV

## Visão Geral

O sistema oferece uma ferramenta de importação guiada em **3 etapas** para facilitar a migração de dados de outras ferramentas ou planilhas.

## Formatos Suportados

### Clientes
Campos aceitos:
- **Nome** (obrigatório)
- **Email** (obrigatório)
- **Telefone** (opcional)
- **CPF/CNPJ** (opcional)
- **Endereço** (opcional)
- **Observações** (opcional)

Exemplo: [clientes-exemplo.csv](./csv-examples/clientes-exemplo.csv)

### Cobranças
Campos aceitos:
- **Email do Cliente** (obrigatório - deve existir no sistema)
- **Descrição** (obrigatório)
- **Valor** (obrigatório - formato: 150.00 ou 150,00)
- **Vencimento** (obrigatório - formato: DD/MM/AAAA)
- **Status** (opcional - PENDING, PAID, OVERDUE, CANCELLED)
- **Observações** (opcional)

Exemplo: [cobrancas-exemplo.csv](./csv-examples/cobrancas-exemplo.csv)

## Processo de Importação (3 Etapas)

### Etapa 1: Upload do Arquivo
1. Selecione o tipo: Clientes ou Cobranças
2. Faça upload do arquivo CSV (UTF-8 com BOM recomendado)
3. Sistema valida formato e detecta colunas automaticamente

### Etapa 2: Mapeamento de Colunas
1. Sistema sugere mapeamento automático baseado em nomes das colunas
2. Usuário confirma ou ajusta o mapeamento
3. Visualização das primeiras 5 linhas para conferência

**Mapeamento Inteligente:**
- "Nome", "Name", "Cliente" → `name`
- "E-mail", "Email", "Mail" → `email`
- "Telefone", "Phone", "Celular", "Fone" → `phone`
- "CPF", "CNPJ", "Documento", "Document" → `document`
- "Valor", "Amount", "Preço" → `amount`
- "Vencimento", "Due Date", "Data" → `dueDate`

### Etapa 3: Preview e Confirmação
1. Sistema processa e valida todas as linhas
2. Exibe resumo:
   - Total de linhas
   - Linhas válidas (serão importadas)
   - Linhas com erro (detalhamento por linha)
3. Usuário revisa e confirma importação
4. Importação ocorre de forma transacional

## Validações

### Clientes
- Email deve ser válido e único por tenant
- Nome não pode estar vazio
- Telefone deve ter formato válido (se informado)
- CPF/CNPJ deve ter formato válido (se informado)

### Cobranças
- Email do Cliente deve existir no sistema
- Valor deve ser numérico positivo
- Vencimento deve ser data válida
- Status deve ser válido (PENDING, PAID, OVERDUE, CANCELLED)

## Tratamento de Erros

O sistema registra erros por linha na tabela `ImportRowError`:
- Número da linha com erro
- Mensagem descritiva do erro
- Dados originais da linha (JSON) para auditoria

**Comportamento:**
- Linhas com erro são **ignoradas**
- Linhas válidas são importadas normalmente
- Sistema permite baixar relatório de erros em CSV

## Idempotência

Para evitar duplicação:
- **Clientes**: Verifica email + tenantId antes de inserir
- **Cobranças**: Verifica clientId + description + dueDate + amount

Se registro já existe, sistema:
1. Registra como erro ("Cliente já cadastrado")
2. Não duplica o registro
3. Continua processando outras linhas

## Limites e Performance

- **Tamanho máximo**: 10 MB por arquivo
- **Linhas máximas**: 5.000 linhas por importação
- **Timeout**: 5 minutos por importação
- **Processamento**: Batch de 100 linhas por vez (transacional)

## Controle de Acesso

- **ADMIN**: Pode importar Clientes e Cobranças
- **MANAGER**: Pode importar Clientes e Cobranças
- Todos os registros importados ficam vinculados ao tenant do usuário logado

## Exemplos de Uso

### Importar Clientes de outro sistema
```csv
Nome,Email,Telefone,CPF/CNPJ
João Silva,joao@email.com,(11) 98765-4321,123.456.789-00
Maria Santos,maria@empresa.com.br,(21) 97654-3210,98.765.432/0001-00
```

### Importar Cobranças
```csv
Email do Cliente,Descrição,Valor,Vencimento,Status
joao@email.com,Mensalidade Janeiro,150.00,10/01/2026,PENDING
maria@empresa.com.br,Consultoria,2500.00,15/01/2026,PENDING
```

## API Endpoints

### Preparar Importação (Upload + Mapeamento)
```typescript
POST /api/imports/prepare
Content-Type: multipart/form-data

{
  "type": "CLIENT" | "INVOICE",
  "file": File,
  "columnMapping": {
    "Nome": "name",
    "Email": "email",
    ...
  }
}

Response:
{
  "jobId": "clxxx123",
  "totalRows": 100,
  "preview": [...first 5 rows...],
  "validationErrors": [...]
}
```

### Confirmar Importação
```typescript
POST /api/imports/{jobId}/commit

Response:
{
  "jobId": "clxxx123",
  "status": "COMPLETED",
  "totalRows": 100,
  "successRows": 95,
  "errorRows": 5,
  "errors": [
    {
      "rowNumber": 3,
      "message": "Email inválido",
      "rawData": {...}
    }
  ]
}
```

### Baixar Relatório de Erros
```typescript
GET /api/imports/{jobId}/errors.csv
```

## Boas Práticas

1. **Sempre faça backup** antes de importações grandes
2. **Teste com arquivo pequeno** (5-10 linhas) primeiro
3. **Revise o preview** cuidadosamente antes de confirmar
4. **Use UTF-8 com BOM** para evitar problemas com acentos
5. **Não use ponto-e-vírgula** como separador (use vírgula)
6. **Valores com vírgula devem estar entre aspas**: `"R$ 1.500,00"`
