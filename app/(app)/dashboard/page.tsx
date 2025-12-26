'use client';

import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import Link from 'next/link';

interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  description: string;
  client: {
    name: string;
  };
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const next7Days = addDays(today, 7);

  const stats = {
    totalReceivable: invoices
      .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + Number(inv.amount), 0),
    overdue: invoices.filter((inv) => inv.status === 'OVERDUE'),
    dueIn7Days: invoices.filter((inv) => {
      const dueDate = new Date(inv.dueDate);
      return inv.status === 'PENDING' && dueDate <= next7Days && dueDate >= today;
    }),
    receivedThisMonth: invoices
      .filter((inv) => {
        if (inv.status !== 'PAID') return false;
        const paidDate = new Date(inv.dueDate);
        return (
          paidDate.getMonth() === today.getMonth() &&
          paidDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, inv) => sum + Number(inv.amount), 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Total a Receber
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  R$ {stats.totalReceivable.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Vencendo em 7 dias
                </div>
                <div className="mt-1 text-3xl font-semibold text-yellow-600">
                  {stats.dueIn7Days.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Atrasadas
                </div>
                <div className="mt-1 text-3xl font-semibold text-red-600">
                  {stats.overdue.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Recebido no Mês
                </div>
                <div className="mt-1 text-3xl font-semibold text-green-600">
                  R$ {stats.receivedThisMonth.toFixed(2)}
                </div>
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
                stats.dueIn7Days.slice(0, 5).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
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
                          R$ {Number(invoice.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
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
                stats.overdue.slice(0, 5).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
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
                          R$ {Number(invoice.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-red-500">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
