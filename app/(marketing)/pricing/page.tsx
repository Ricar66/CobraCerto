import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 49',
    period: '/mês',
    description: 'Ideal para freelancers e pequenos prestadores',
    features: [
      'Até 200 cobranças por mês',
      '1 usuário',
      'Lembretes automáticos por e-mail',
      'Exportação em CSV',
      'Suporte por e-mail',
    ],
    cta: 'Começar agora',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 149',
    period: '/mês',
    description: 'Para negócios em crescimento',
    features: [
      'Até 1.000 cobranças por mês',
      'Até 3 usuários',
      'Lembretes configuráveis',
      'Templates de e-mail personalizados',
      'Exportação em CSV',
      'Suporte prioritário',
      'Relatórios básicos',
    ],
    cta: 'Começar agora',
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'R$ 349',
    period: '/mês',
    description: 'Para empresas estabelecidas',
    features: [
      'Cobranças ilimitadas',
      'Usuários ilimitados',
      'Lembretes avançados configuráveis',
      'Múltiplos templates de e-mail',
      'Exportação em CSV e Excel',
      'Relatórios avançados e analytics',
      'Suporte prioritário com WhatsApp',
      'Integração com APIs de pagamento',
      'Webhook para automações',
    ],
    cta: 'Falar com vendas',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Link href="/login" className="text-2xl font-bold text-primary-600 mb-4 inline-block">
            CobraCerto
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Planos e Preços
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.highlighted ? 'ring-2 ring-primary-500 transform scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 -mr-1 -mt-1">
                  <div className="bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-gray-600">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-6 w-6 text-green-500"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/login"
                    className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${
                      plan.highlighted
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Todos os planos incluem:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Gestão multi-tenant segura</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Dashboard com indicadores</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Histórico completo de contatos</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Cobranças recorrentes</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Controle de inadimplência</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Atualizações gratuitas</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Dúvidas sobre qual plano escolher?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Fale com nosso time
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
