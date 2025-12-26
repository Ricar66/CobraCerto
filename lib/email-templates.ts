/**
 * Templates de e-mail para lembretes de cobrança
 *
 * Placeholders disponíveis:
 * - {NOME_CLIENTE}: Nome do cliente
 * - {EMPRESA}: Nome da empresa/tenant
 * - {DESCRICAO}: Descrição da cobrança
 * - {VALOR}: Valor formatado (ex: R$ 149,90)
 * - {VENCIMENTO}: Data de vencimento formatada (ex: 10/01/2026)
 * - {DIAS}: Número de dias
 * - {LINK_PAGAMENTO}: URL do portal de pagamento
 * - {PIX_COPIA_COLA}: Código PIX (se disponível)
 * - {CONTATO}: Telefone/WhatsApp/E-mail de contato
 * - {ASSINATURA}: Assinatura (ex: "Equipe {EMPRESA}")
 */

export interface EmailTemplate {
  subject: string;
  subjectAlt?: string;
  body: string;
  type: 'PRE_DUE' | 'DUE_TODAY' | 'OVERDUE_L1' | 'OVERDUE_L2';
  description: string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  // 1) Lembrete pré-vencimento (ex.: 3 dias antes)
  PRE_DUE: {
    type: 'PRE_DUE',
    description: 'Lembrete enviado antes do vencimento',
    subject: 'Lembrete: {DESCRICAO} vence em {VENCIMENTO}',
    subjectAlt: '{NOME_CLIENTE}, sua cobrança vence em {DIAS} dias',
    body: `Olá, {NOME_CLIENTE}! Tudo bem?

Passando para lembrar que a cobrança {DESCRICAO} no valor de {VALOR} vence em {VENCIMENTO}.

Para pagar, é só acessar: {LINK_PAGAMENTO}

Se você já realizou o pagamento, por favor desconsidere esta mensagem.

Obrigado!
{ASSINATURA}
Contato: {CONTATO}`,
  },

  // 2) Lembrete no dia do vencimento
  DUE_TODAY: {
    type: 'DUE_TODAY',
    description: 'Lembrete enviado no dia do vencimento',
    subject: 'Vence hoje: {DESCRICAO} ({VALOR})',
    subjectAlt: '{NOME_CLIENTE}, lembrete do vencimento de hoje',
    body: `Olá, {NOME_CLIENTE}!

Este é um lembrete de que a cobrança {DESCRICAO} no valor de {VALOR} vence hoje ({VENCIMENTO}).

Pagamento por aqui: {LINK_PAGAMENTO}

Se precisar de ajuda ou tiver algum ajuste para fazer, é só responder este e-mail.

Atenciosamente,
{ASSINATURA}
Contato: {CONTATO}`,
  },

  // 3A) Atraso leve (ex.: 3 dias após) — tom bem cordial
  OVERDUE_L1: {
    type: 'OVERDUE_L1',
    description: 'Lembrete de atraso leve (3 dias)',
    subject: '{NOME_CLIENTE}, cobrança em aberto desde {VENCIMENTO}',
    subjectAlt: 'Lembrete: {DESCRICAO} em atraso',
    body: `Olá, {NOME_CLIENTE}! Tudo certo?

Notamos que a cobrança {DESCRICAO} no valor de {VALOR}, com vencimento em {VENCIMENTO}, ainda consta como em aberto.

Para regularizar, segue o link: {LINK_PAGAMENTO}

Se já pagou, por favor nos avise (ou desconsidere esta mensagem).
Se precisar negociar uma nova data, podemos ajudar.

Obrigado,
{ASSINATURA}
Contato: {CONTATO}`,
  },

  // 3B) Atraso maior (ex.: 7/15 dias) — tom firme, sem ser agressivo
  OVERDUE_L2: {
    type: 'OVERDUE_L2',
    description: 'Lembrete de atraso grave (7+ dias)',
    subject: 'Aviso: regularização pendente – {DESCRICAO}',
    subjectAlt: '{NOME_CLIENTE}, precisamos de um retorno sobre a cobrança',
    body: `Olá, {NOME_CLIENTE}.

A cobrança {DESCRICAO} (valor {VALOR}) venceu em {VENCIMENTO} e ainda está pendente em nosso sistema.

Link para pagamento: {LINK_PAGAMENTO}

Se houver qualquer impedimento, responda este e-mail informando uma previsão de pagamento ou solicitando renegociação. Assim conseguimos evitar novas notificações.

Atenciosamente,
{ASSINATURA}
Contato: {CONTATO}`,
  },
};

/**
 * Substitui os placeholders no template pelos valores reais
 */
export function renderTemplate(
  template: string,
  data: {
    nomeCliente: string;
    empresa: string;
    descricao: string;
    valor: string;
    vencimento: string;
    dias?: number;
    linkPagamento: string;
    pixCopiaCola?: string;
    contato: string;
    assinatura?: string;
  }
): string {
  let rendered = template;

  const replacements: Record<string, string> = {
    '{NOME_CLIENTE}': data.nomeCliente,
    '{EMPRESA}': data.empresa,
    '{DESCRICAO}': data.descricao,
    '{VALOR}': data.valor,
    '{VENCIMENTO}': data.vencimento,
    '{DIAS}': data.dias?.toString() || '',
    '{LINK_PAGAMENTO}': data.linkPagamento,
    '{PIX_COPIA_COLA}': data.pixCopiaCola || '',
    '{CONTATO}': data.contato,
    '{ASSINATURA}': data.assinatura || `Equipe ${data.empresa}`,
  };

  Object.entries(replacements).forEach(([placeholder, value]) => {
    rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
  });

  // Se tiver PIX Copia e Cola, adiciona ao final
  if (data.pixCopiaCola) {
    rendered += `\n\nPIX (copia e cola): ${data.pixCopiaCola}`;
  }

  return rendered;
}

/**
 * Retorna o template apropriado baseado nos dias de atraso
 */
export function getTemplateByDaysOverdue(daysOverdue: number): EmailTemplate {
  if (daysOverdue < 0) {
    // Antes do vencimento
    return emailTemplates.PRE_DUE;
  } else if (daysOverdue === 0) {
    // No dia do vencimento
    return emailTemplates.DUE_TODAY;
  } else if (daysOverdue <= 3) {
    // Atraso leve (1-3 dias)
    return emailTemplates.OVERDUE_L1;
  } else {
    // Atraso grave (4+ dias)
    return emailTemplates.OVERDUE_L2;
  }
}

/**
 * Exemplo de uso:
 *
 * const template = emailTemplates.PRE_DUE;
 * const subject = renderTemplate(template.subject, {
 *   nomeCliente: 'João Silva',
 *   empresa: 'CobraCerto',
 *   descricao: 'Mensalidade Março 2024',
 *   valor: 'R$ 150,00',
 *   vencimento: '10/03/2024',
 *   dias: 3,
 *   linkPagamento: 'https://cobracerto.com/pay/abc123',
 *   contato: '(11) 98765-4321',
 * });
 * const body = renderTemplate(template.body, { ... });
 */
