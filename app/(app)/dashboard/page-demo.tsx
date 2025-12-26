'use client';

import { format, addDays } from 'date-fns';
import Link from 'next/link';

// Dados mockados para demonstração
const mockInvoices = [
  {
    id: '1',
    amount: 150,
    dueDate: addDays(new Date(), 2).toISOString(),
    status: 'PENDING',
    description: 'Mensalidade Março 2024',
    client: { name: 'João Silva' },
  },
  {
    id: '2',
    amount: 250,
    dueDate: addDays(new Date(), 5).toISOString(),
    status: 'PENDING',
    description: 'Serviço de Consultoria',
    client: { name: 'Maria Santos' },
  },
  {
    id: '3',
    amount: 150,
    dueDate: addDays(new Date(), -7).toISOString(),
    status: 'OVERDUE',
    description: 'Mensalidade Fevereiro 2024',
    client: { name: 'João Silva' },
  },
  {
    id: '4',
    amount: 300,
    dueDate: new Date().toISOString(),
    status: 'PAID',
    description: 'Projeto Especial',
    client: { name: 'Carlos Oliveira' },
  },
];

export default function DashboardPage() {
  const today = new Date();
  const next7Days = addDays(today, 7);

  const stats = {
    totalReceivable: mockInvoices
      .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.amount, 0),
    overdue: mockInvoices.filter((inv) => inv.status === 'OVERDUE'),
    dueIn7Days: mockInvoices.filter((inv) => {
      const dueDate = new Date(inv.dueDate);
      return inv.status === 'PENDING' && dueDate <= next7Days && dueDate >= today;
    }),
    receivedThisMonth: mockInvoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Modo Demo:</strong> Visualizando com dados mockados. Configure o banco de dados para funcionalidade completa.
        </p>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total a Receber
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  R$ {stats.totalReceivable.toFixed(2)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Vencendo em 7 dias
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                  {stats.dueIn7Days.length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Atrasadas
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  {stats.overdue.length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Recebido no Mês
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  R$ {stats.receivedThisMonth.toFixed(2)}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Vencendo em 7 dias
            </h3>
            <div className="space-y-3">
              {stats.dueIn7Days.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma cobrança vencendo</p>
              ) : (
                stats.dueIn7Days.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="block hover:bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.client.name}
                        </p>
                        <p className="text-sm text-gray-500">{invoice.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          R$ {invoice.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Cobranças Atrasadas
            </h3>
            <div className="space-y-3">
              {stats.overdue.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma cobrança atrasada</p>
              ) : (
                stats.overdue.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="block hover:bg-gray-50 p-3 rounded border border-red-200 bg-red-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.client.name}
                        </p>
                        <p className="text-sm text-gray-500">{invoice.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">
                          R$ {invoice.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-red-500">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
