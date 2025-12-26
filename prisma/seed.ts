import { PrismaClient, UserRole, TenantPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { email: 'demo@cobracerto.com' },
    update: {},
    create: {
      name: 'Empresa Demo',
      email: 'demo@cobracerto.com',
      phone: '(11) 99999-9999',
      plan: TenantPlan.PRO,
      active: true,
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin Demo',
      role: UserRole.ADMIN,
      tenantId: tenant.id,
      active: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      email: 'manager@demo.com',
      password: hashedPassword,
      name: 'Gerente Demo',
      role: UserRole.MANAGER,
      tenantId: tenant.id,
      active: true,
    },
  });

  console.log('✅ Manager user created:', managerUser.email);

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 98888-7777',
      document: '123.456.789-00',
      tenantId: tenant.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '(11) 97777-6666',
      document: '987.654.321-00',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Clients created:', client1.name, client2.name);

  // Create sample invoices
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  await prisma.invoice.create({
    data: {
      clientId: client1.id,
      tenantId: tenant.id,
      amount: 150.00,
      dueDate: tomorrow,
      status: 'PENDING',
      description: 'Mensalidade Março 2024',
      recurrence: 'MONTHLY',
      nextRunAt: new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      clientId: client2.id,
      tenantId: tenant.id,
      amount: 250.00,
      dueDate: nextWeek,
      status: 'PENDING',
      description: 'Serviço de Consultoria',
      recurrence: 'NONE',
    },
  });

  await prisma.invoice.create({
    data: {
      clientId: client1.id,
      tenantId: tenant.id,
      amount: 150.00,
      dueDate: lastWeek,
      status: 'OVERDUE',
      description: 'Mensalidade Fevereiro 2024',
      recurrence: 'NONE',
    },
  });

  console.log('✅ Invoices created');

  // Create default reminder rules
  await prisma.reminderRule.create({
    data: {
      tenantId: tenant.id,
      name: '3 dias antes do vencimento',
      daysBefore: 3,
      active: true,
      emailSubject: 'Lembrete: Fatura vencendo em 3 dias',
      emailBody: `Olá,

Este é um lembrete de que sua fatura no valor de {{amount}} vencerá em 3 dias ({{dueDate}}).

Descrição: {{description}}

Por favor, efetue o pagamento para evitar atrasos.

Atenciosamente,
{{tenantName}}`,
    },
  });

  await prisma.reminderRule.create({
    data: {
      tenantId: tenant.id,
      name: 'No dia do vencimento',
      daysBefore: 0,
      active: true,
      emailSubject: 'Fatura vence hoje',
      emailBody: `Olá,

Sua fatura no valor de {{amount}} vence HOJE ({{dueDate}}).

Descrição: {{description}}

Por favor, efetue o pagamento o quanto antes.

Atenciosamente,
{{tenantName}}`,
    },
  });

  await prisma.reminderRule.create({
    data: {
      tenantId: tenant.id,
      name: '3 dias após vencimento',
      daysAfter: 3,
      active: true,
      emailSubject: 'URGENTE: Fatura em atraso',
      emailBody: `Olá,

Sua fatura no valor de {{amount}} está em atraso há 3 dias (vencimento: {{dueDate}}).

Descrição: {{description}}

Por favor, regularize sua situação o quanto antes para evitar suspensão dos serviços.

Atenciosamente,
{{tenantName}}`,
    },
  });

  console.log('✅ Reminder rules created');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Demo credentials:');
  console.log('   Admin: admin@demo.com / admin123');
  console.log('   Manager: manager@demo.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
