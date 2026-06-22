import { createClient } from 'npm:@supabase/supabase-js@2';

interface Profile {
  expo_push_token: string | null;
  role: 'admin' | 'user';
  notifications_enabled: boolean;
  sales_notifications: boolean;
  products_notifications: boolean;
}

interface SaleRecord {
  id: string;
  total: number;
  user_id: string;
  status: 'paid' | 'pending';
  customer_name: string | null;
  [key: string]: unknown;
}

interface ProductRecord {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface WebhookPayload {
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
}

async function sendPushNotifications(
  supabase: ReturnType<typeof createClient>,
  filters: {
    notificationField: 'sales_notifications' | 'products_notifications';
    excludeUserId?: string;
  },
  messageTitle: string,
  messageBody: string,
  data: Record<string, unknown>
): Promise<Response> {
  const query = supabase
    .from('profiles')
    .select(`expo_push_token, ${filters.notificationField}`)
    .eq('role', 'admin')
    .eq('notifications_enabled', true)
    .not('expo_push_token', 'is', null);

  if (filters.excludeUserId) {
    query.neq('id', filters.excludeUserId);
  }

  const { data: admins, error } = await query;

  if (error) throw error;

  if (!admins || admins.length === 0) {
    return new Response(
      JSON.stringify({
        message: 'Nenhum admin com token encontrado'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Filtra apenas admins que não desabilitaram explicitamente (null/undefined = ativado)
  const eligibleAdmins = admins.filter(
    (a: Record<string, unknown>) => a[filters.notificationField] !== false
  );

  const expoTokens: string[] = eligibleAdmins
    .map((u: Partial<Profile>) => u.expo_push_token)
    .filter((t): t is string => !!t);

  const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      to: expoTokens,
      title: messageTitle,
      body: messageBody,
      sound: 'default',
      data
    })
  });

  const result = await expoResponse.json();
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req: Request) => {
  try {
    // 1. Recebe o payload do Webhook do Banco de Dados
    const payload: WebhookPayload = await req.json();
    const { table, type, record, old_record } = payload;

    // 2. Inicializa o cliente do Supabase interno
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Processa eventos da tabela de vendas
    if (table === 'sales') {
      let messageTitle = '';
      let messageBody = '';
      const saleRecord = record as SaleRecord;
      const valorVenda = saleRecord.total || 0;
      const valorFormatado = Number(valorVenda).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (type === 'INSERT') {
        const isFiado = saleRecord.status === 'pending';
        const customerName = saleRecord.customer_name;
        let sellerName = 'Vendedor';

        try {
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('email, pix_name')
            .eq('id', saleRecord.user_id)
            .single();

          if (sellerProfile) {
            sellerName =
              sellerProfile.pix_name ||
              sellerProfile.email.split('@')[0] ||
              'Vendedor';
          }
        } catch (err) {
          console.error('Erro ao buscar perfil do vendedor:', err);
        }

        const statusEmoji = isFiado ? '📝' : '💰';
        const statusText = isFiado ? 'Venda Fiada' : 'Nova Venda';
        messageTitle = `${statusEmoji} ${statusText}: R$ ${valorFormatado}`;

        messageBody = `Vendido por: ${sellerName}`;
        if (customerName) {
          messageBody += ` para ${customerName}`;
        }
      } else if (type === 'UPDATE' && old_record) {
        const oldSale = old_record as SaleRecord;
        // Notifica quando uma venda pendente (fiada) é paga
        if (oldSale.status === 'pending' && saleRecord.status === 'paid') {
          const customerName = saleRecord.customer_name || 'Cliente';
          messageTitle = `✅ Venda Paga: R$ ${valorFormatado}`;
          messageBody = `A venda de ${customerName} foi confirmada como paga.`;
        } else {
          return new Response(
            JSON.stringify({
              message: 'Update ignorado (não é mudança de status relevante)'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({
            message: 'Evento ignorado (não é INSERT nem UPDATE relevante)'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return await sendPushNotifications(
        supabase,
        {
          notificationField: 'sales_notifications',
          excludeUserId: saleRecord.user_id
        },
        messageTitle,
        messageBody,
        { table, recordId: saleRecord.id }
      );
    }

    // 4. Processa eventos da tabela de produtos
    if (table === 'products') {
      const productRecord = record as ProductRecord;
      const productName = productRecord.name || 'Produto';
      const oldProduct = old_record as ProductRecord | null;

      let messageTitle = '';
      let messageBody = '';

      if (type === 'INSERT') {
        messageTitle = '🆕 Novo Produto Adicionado!';
        messageBody = `${productName} foi adicionado ao estoque.`;
      } else if (type === 'UPDATE') {
        messageTitle = '✏️ Produto Editado!';
        messageBody = `${productName} foi atualizado no estoque.`;
      } else if (type === 'DELETE') {
        const deletedName = oldProduct?.name || productName;
        messageTitle = '🗑️ Produto Excluído!';
        messageBody = `${deletedName} foi removido do estoque.`;
      } else {
        return new Response(
          JSON.stringify({ message: 'Tipo de evento ignorado' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return await sendPushNotifications(
        supabase,
        { notificationField: 'products_notifications' },
        messageTitle,
        messageBody,
        { table, recordId: productRecord.id }
      );
    }

    // 5. Qualquer outra tabela é ignorada
    return new Response(
      JSON.stringify({
        message: 'Evento ignorado (apenas tabelas sales e products)'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Erro na Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
