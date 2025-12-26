'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  description: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
}

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paga', className: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Atrasada', className: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      const url = filter ? `/api/invoices?status=${filter}` : '/api/invoices';
      const res = await fetch(url);
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/invoices/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faturas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting invoices:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Cobranças</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Exportar CSV
          </button>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Nova Cobrança
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'PENDING'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('OVERDUE')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'OVERDUE'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Atrasadas
            </button>
            <button
              onClick={() => setFilter('PAID')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'PAID'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagas
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : invoices.length === 0 ? (
            <p className="text-gray-500">Nenhuma cobrança encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.client.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {Number(invoice.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusMap[invoice.status].className
                          }`}
                        >
                          {statusMap[invoice.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {invoice.status === 'PENDING' && (
                            <button
                              onClick={() => handleMarkPaid(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Marcar paga
                            </button>
                          )}
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Detalhes
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
