# Campos Personalizados (Custom Fields)

## Visão Geral

O sistema de Campos Personalizados permite que cada tenant customize os dados de **Clientes** e **Cobranças** de acordo com suas necessidades específicas, sem alterar o código ou banco de dados.

## Tipos de Campo Suportados

- **TEXT**: Texto livre (ex: "Razão Social", "Nome Fantasia")
- **NUMBER**: Números (ex: "Número de Funcionários", "Limite de Crédito")
- **DATE**: Datas (ex: "Data de Fundação", "Vencimento do Contrato")
- **BOOLEAN**: Sim/Não (ex: "Cliente VIP", "Aceita Boleto")
- **SELECT**: Lista de opções (escolha única - ex: "Porte da Empresa")
- **MULTISELECT**: Lista de opções (múltipla escolha - ex: "Serviços Contratados")

## Arquitetura (EAV Pattern)

O sistema usa o padrão **Entity-Attribute-Value (EAV)** para máxima flexibilidade:

### CustomFieldDefinition
Define os campos disponíveis para cada tenant:
- `key`: Identificador único (ex: "company_size")
- `label`: Nome exibido (ex: "Tamanho da Empresa")
- `entityType`: CLIENT ou INVOICE
- `type`: Tipo do campo (TEXT, NUMBER, DATE, etc.)
- `required`: Se é obrigatório
- `options`: JSON com opções para SELECT/MULTISELECT
- `sortOrder`: Ordem de exibição

### CustomFieldValue
Armazena os valores reais de cada campo:
- `entityId`: ID do Cliente ou Cobrança
- `entityType`: CLIENT ou INVOICE
- `fieldId`: Referência ao CustomFieldDefinition
- Colunas tipadas: `valueString`, `valueNumber`, `valueDate`, `valueBool`, `valueJson`

## Controle de Acesso

- **ADMIN**: Pode criar, editar e excluir definições de campos personalizados
- **MANAGER**: Pode apenas preencher os campos nos formulários

## Exemplos de Uso

### 1. Consultoria de TI
**Campos para Clientes:**
- Tamanho da Empresa (SELECT): Pequena, Média, Grande
- Número de Funcionários (NUMBER)
- Tecnologias Usadas (MULTISELECT): Java, .NET, Python, React

**Campos para Cobranças:**
- Projeto (TEXT)
- Horas Trabalhadas (NUMBER)
- Data de Entrega (DATE)

### 2. Academia/Personal Trainer
**Campos para Clientes:**
- Objetivo (SELECT): Emagrecimento, Ganho de Massa, Condicionamento
- Peso Atual (NUMBER)
- Avaliação Física (DATE)
- Possui Restrição Médica (BOOLEAN)

**Campos para Cobranças:**
- Plano (SELECT): Mensal, Trimestral, Anual
- Sessões Incluídas (NUMBER)

### 3. E-commerce B2B
**Campos para Clientes:**
- Segmento (SELECT): Varejo, Atacado, Distribuidor
- Limite de Crédito (NUMBER)
- CNAE (TEXT)
- Aceita Faturamento Mensal (BOOLEAN)

## API Usage

### Criar Definição de Campo
```typescript
POST /api/settings/custom-fields

{
  "key": "company_size",
  "label": "Tamanho da Empresa",
  "entityType": "CLIENT",
  "type": "SELECT",
  "required": false,
  "options": ["Pequena (1-10)", "Média (11-50)", "Grande (50+)"],
  "sortOrder": 0
}
```

### Salvar Valor de Campo
```typescript
POST /api/clients/{clientId}/custom-fields

{
  "fieldId": "clxxx123",
  "value": "Média (11-50)"
}
```

### Buscar com Filtros
```typescript
GET /api/clients?customField[company_size]=Média (11-50)
```

## Validações

1. Campos `required: true` devem ser preenchidos
2. SELECT aceita apenas valores da lista de opções
3. MULTISELECT aceita array de valores da lista
4. NUMBER aceita apenas números válidos
5. DATE aceita apenas datas válidas (ISO 8601)
6. Chave (`key`) deve ser única por tenant e entityType

## Performance

- Índices criados em: `tenantId`, `entityType`, `entityId`, `fieldId`
- Query otimizada com JOIN para buscar valores junto com entidade
- Índice composto em `[tenantId, status, dueDate]` para relatórios de aging

## Limitações

- Máximo recomendado: 20 campos personalizados por entidade
- Não suporta validações complexas (regex, ranges específicos)
- Queries com múltiplos filtros de custom fields podem ser lentas em grandes volumes
