import { createClient } from 'npm:@supabase/supabase-js@2';

interface Profile {
  expo_push_token: string | null;
  role: 'admin' | 'user';
  notifications_enabled: boolean;
  sales_notifications: boolean;
}

interface SaleRecord {
  id: string;
  total: number;
  user_id: string;
  status: 'paid' | 'pending';
  customer_name: string | null;
  [key: string]: unknown;
}

interface WebhookPayload {
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: SaleRecord;
  old_record: SaleRecord | null;
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

    // 3. Define a mensagem apenas para Vendas
    if (table !== 'sales') {
      return new Response(
        JSON.stringify({ message: 'Evento ignorado (apenas tabela sales)' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let messageTitle = '';
    let messageBody = '';
    const valorVenda = record.total || 0;
    const valorFormatado = Number(valorVenda).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (type === 'INSERT') {
      const isFiado = record.status === 'pending';
      const customerName = record.customer_name;
      let sellerName = 'Vendedor';

      try {
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('email, pix_name')
          .eq('id', record.user_id)
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
      // Notifica quando uma venda pendente (fiada) é paga
      if (old_record.status === 'pending' && record.status === 'paid') {
        const customerName = record.customer_name || 'Cliente';
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

    // 4. Busca os Perfis de Administradores com notificações ativadas
    // Filtramos para não enviar para o próprio vendedor (user_id do record)
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('role', 'admin')
      .eq('notifications_enabled', true)
      .eq('sales_notifications', true)
      .not('expo_push_token', 'is', null)
      .neq('id', record.user_id); // NÃO enviar para quem fez a venda

    if (error) throw error;

    if (!admins || admins.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'Nenhum admin (exceto o vendedor) com token encontrado'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Filtra apenas as strings dos tokens (removendo nulls por segurança)
    const expoTokens: string[] = admins
      .map((u: Partial<Profile>) => u.expo_push_token)
      .filter((t): t is string => !!t);

    // 5. Envia as notificações em lote para a API do Expo
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
        data: { table, recordId: record.id }
      })
    });

    const result = await expoResponse.json();
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
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
