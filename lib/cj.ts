import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function fetchNewToken() {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  if (!data.result) throw new Error(data.message || 'Failed to get CJ access token');
  return data.data;
}

async function refreshToken(refreshTokenValue: string) {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
  const data = await res.json();
  if (!data.result) throw new Error(data.message || 'Failed to refresh CJ token');
  return data.data;
}

export async function getCJAccessToken(): Promise<string> {
  const supabase = getSupabase();
  const { data: row } = await supabase.from('cj_tokens').select('*').eq('id', 1).single();

  const now = new Date();

  // Access token still valid
  if (row?.access_token && row.access_expiry && new Date(row.access_expiry) > now) {
    return row.access_token;
  }

  // Access token expired but refresh token still valid
  if (row?.refresh_token && row.refresh_expiry && new Date(row.refresh_expiry) > now) {
    const fresh = await refreshToken(row.refresh_token);
    await supabase.from('cj_tokens').update({
      access_token: fresh.accessToken,
      refresh_token: fresh.refreshToken,
      access_expiry: fresh.accessTokenExpiryDate,
      refresh_expiry: fresh.refreshTokenExpiryDate,
    }).eq('id', 1);
    return fresh.accessToken;
  }

  // Both expired or first time — get brand new token
  const fresh = await fetchNewToken();
  await supabase.from('cj_tokens').upsert({
    id: 1,
    access_token: fresh.accessToken,
    refresh_token: fresh.refreshToken,
    access_expiry: fresh.accessTokenExpiryDate,
    refresh_expiry: fresh.refreshTokenExpiryDate,
  });
  return fresh.accessToken;
}
type CJOrderProduct = { vid: string; quantity: number; storeLineItemId: string };

export async function createCJOrder(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  zip?: string;
  countryCode: string;
  products: CJOrderProduct[];
}) {
  const token = await getCJAccessToken();

  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
    method: 'POST',
    headers: {
      'CJ-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderNumber: params.orderNumber,
      shippingCountryCode: params.countryCode,
      shippingProvince: params.province || '',
      shippingCity: params.city,
      shippingPhone: params.phone,
      shippingCustomerName: params.customerName,
      shippingAddress: params.address,
      shippingZip: params.zip || '',
      remark: `Order from MaestraVibe #${params.orderNumber}`,
      platform: 'other',
      fromCountryCode: 'CN',
      orderFlow: 1,
      products: params.products,
    }),
  });

  const data = await res.json();
  if (!data.result) throw new Error(data.message || 'Failed to create CJ order');
  return data.data;
}