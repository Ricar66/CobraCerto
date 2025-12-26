# Relatórios de Aging (Envelhecimento de Contas)

## Visão Geral

O **Relatório de Aging** é uma ferramenta fundamental para gestão financeira que categoriza cobranças em aberto por faixas de dias em atraso, permitindo identificar rapidamente a saúde do contas a receber.

## Buckets (Faixas de Aging)

O sistema agrupa cobranças atrasadas em **6 buckets padrão**:

| Bucket | Descrição | Dias de Atraso | Criticidade |
|--------|-----------|----------------|-------------|
| **0-7** | Atraso recente | 1 a 7 dias | 🟡 Baixa |
| **8-15** | Atraso leve | 8 a 15 dias | 🟠 Média |
| **16-30** | Atraso moderado | 16 a 30 dias | 🟠 Média-Alta |
| **31-60** | Atraso grave | 31 a 60 dias | 🔴 Alta |
| **61-90** | Atraso crítico | 61 a 90 dias | 🔴 Crítica |
| **90+** | Inadimplência | Mais de 90 dias | ⚫ Inadimplente |

## Cálculo

Para cada cobrança com `status = 'OVERDUE'`:

```typescript
const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

if (daysOverdue >= 1 && daysOverdue <= 7) bucket = "0-7";
else if (daysOverdue >= 8 && daysOverdue <= 15) bucket = "8-15";
else if (daysOverdue >= 16 && daysOverdue <= 30) bucket = "16-30";
else if (daysOverdue >= 31 && daysOverdue <= 60) bucket = "31-60";
else if (daysOverdue >= 61 && daysOverdue <= 90) bucket = "61-90";
else if (daysOverdue > 90) bucket = "90+";
```

## Informações Exibidas

### Resumo por Bucket
- **Quantidade**: Número de cobranças no bucket
- **Valor Total**: Soma dos valores em atraso
- **% do Total**: Percentual do total a receber
- **Ticket Médio**: Valor médio das cobranças

### Detalhamento por Cliente
- Nome do cliente
- Número de cobranças atrasadas
- Valor total em atraso
- Maior atraso (em dias)
- Lista de cobranças por bucket

## Exemplos de Uso

### 1. Gestão de Cobrança
Priorize ações baseadas nos buckets:
- **0-7 dias**: Lembrete cordial por email
- **8-15 dias**: Ligação telefônica
- **16-30 dias**: Negociação de nova data
- **31-60 dias**: Negociação com desconto/parcelamento
- **61-90 dias**: Cobrança formal (carta registrada)
- **90+ dias**: Ação judicial ou baixa contábil

### 2. Análise de Risco
Identifique clientes problemáticos:
- Clientes com múltiplas cobranças em buckets altos
- Concentração de valor em buckets críticos
- Padrões de atraso recorrentes

### 3. Projeção de Fluxo de Caixa
Estime probabilidade de recebimento:
- **0-7 dias**: 95% de chance de receber
- **8-15 dias**: 85% de chance
- **16-30 dias**: 70% de chance
- **31-60 dias**: 50% de chance
- **61-90 dias**: 30% de chance
- **90+ dias**: 10% de chance (provisão para perdas)

## Filtros Disponíveis

- **Por Cliente**: Visualizar aging de cliente específico
- **Por Tag**: Aging de clientes com tag específica (ex: "VIP", "Atacado")
- **Por Período**: Cobranças vencidas entre datas específicas
- **Por Valor Mínimo**: Excluir cobranças pequenas da análise

## API Endpoint

### Obter Relatório de Aging
```typescript
GET /api/reports/aging?clientId={id}&minAmount=100

Response:
{
  "summary": {
    "totalOverdue": 25000.00,
    "totalCount": 45,
    "buckets": [
      {
        "range": "0-7",
        "count": 12,
        "total": 3500.00,
        "percentage": 14.0,
        "avgTicket": 291.67
      },
      {
        "range": "8-15",
        "count": 8,
        "total": 2400.00,
        "percentage": 9.6,
        "avgTicket": 300.00
      },
      // ... outros buckets
    ]
  },
  "byClient": [
    {
      "clientId": "clxxx123",
      "clientName": "João Silva",
      "totalOverdue": 1500.00,
      "invoiceCount": 3,
      "maxDaysOverdue": 45,
      "buckets": {
        "0-7": { count: 1, total: 500.00 },
        "31-60": { count: 2, total: 1000.00 }
      }
    }
  ]
}
```

## Visualização (UI)

### Cards de Resumo
```
┌─────────────────────────────────────────────┐
│  0-7 dias                            🟡 Baixa│
│  12 cobranças                   R$ 3.500,00  │
│  14% do total               Ticket: R$ 291,67│
└─────────────────────────────────────────────┘
```

### Gráfico de Barras
- Eixo X: Buckets (0-7, 8-15, ..., 90+)
- Eixo Y: Valor total por bucket
- Cores indicativas de criticidade

### Tabela Detalhada
| Cliente | 0-7 | 8-15 | 16-30 | 31-60 | 61-90 | 90+ | Total |
|---------|-----|------|-------|-------|-------|-----|-------|
| João Silva | R$ 500 | - | - | R$ 1.000 | - | - | R$ 1.500 |

## Performance

### Índices Otimizados
```sql
CREATE INDEX idx_invoices_aging
ON invoices(tenantId, status, dueDate);
```

### Query Otimizada
```sql
SELECT
  CASE
    WHEN DATEDIFF(NOW(), dueDate) BETWEEN 1 AND 7 THEN '0-7'
    WHEN DATEDIFF(NOW(), dueDate) BETWEEN 8 AND 15 THEN '8-15'
    -- ...
  END as bucket,
  COUNT(*) as count,
  SUM(amount) as total
FROM invoices
WHERE tenantId = ? AND status = 'OVERDUE'
GROUP BY bucket;
```

## Exportação

### CSV
```csv
Bucket,Quantidade,Valor Total,Percentual,Ticket Médio
0-7,12,3500.00,14.0%,291.67
8-15,8,2400.00,9.6%,300.00
...
```

### PDF
- Cabeçalho com logo e dados do tenant
- Tabelas formatadas
- Gráficos coloridos
- Rodapé com data de geração

## Alertas Automáticos

Configure alertas quando:
- Bucket 90+ ultrapassar 10% do total
- Bucket 61-90 ultrapassar 20% do total
- Cliente específico acumular mais de R$ X em atraso
- Total a receber em atraso superar meta estabelecida

## Boas Práticas

1. **Revise semanalmente** os buckets 31-60 e superiores
2. **Configure lembretes automáticos** para cada bucket
3. **Estabeleça metas** de redução por bucket
4. **Monitore tendências** (crescimento/redução mês a mês)
5. **Use tags** para segmentar análise (ex: "Governo" vs "Privado")
6. **Combine com Custom Fields** para análises avançadas (ex: aging por segmento)

## Integração com Ações

A partir do relatório, permita ações rápidas:
- **Enviar lembrete**: Email para todos do bucket selecionado
- **Marcar para follow-up**: Criar tarefa de cobrança
- **Negociar**: Abrir tela de renegociação em lote
- **Exportar**: Baixar lista para CRM externo
