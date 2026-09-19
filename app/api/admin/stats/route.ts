// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

const STORE_TIMEZONE = process.env.STORE_TIMEZONE ?? 'Asia/Karachi';

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function zonedParts(date: Date): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') };
}

function wallTimeToUtc(parts: ZonedParts): Date {
  const wallTime = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const rendered = zonedParts(new Date(wallTime));
  const renderedAsUtc = Date.UTC(rendered.year, rendered.month - 1, rendered.day, rendered.hour, rendered.minute, rendered.second);
  return new Date(wallTime - (renderedAsUtc - wallTime));
}

function monthStartUtc(year: number, month: number): Date {
  const normalized = new Date(Date.UTC(year, month - 1, 1));
  return wallTimeToUtc({ year: normalized.getUTCFullYear(), month: normalized.getUTCMonth() + 1, day: 1, hour: 0, minute: 0, second: 0 });
}

function addMonths(year: number, month: number, amount: number) {
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function getOrderMarket(order: { customer?: unknown }): 'pk' | 'us' {
  const customer = order.customer && typeof order.customer === 'object'
    ? order.customer as { country?: unknown; countryCode?: unknown }
    : {};
  const country = String(customer.countryCode ?? customer.country ?? '').trim().toUpperCase();
  return country === 'US' || country === 'USA' || country === 'UNITED STATES' ? 'us' : 'pk';
}

function ensureQuery<T extends { error: { message: string } | null }>(result: T): T {
  if (result.error) {
    const error = result.error as { message?: string; code?: string; details?: string; hint?: string };
    const description = [error.message, error.code, error.details, error.hint].filter(Boolean).join(' | ');
    console.error('[admin/stats] Supabase query failed:', error);
    throw new Error(description || 'Supabase query failed without details');
  }
  return result;
}

export async function GET(_req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const now = new Date();
    const current = zonedParts(now);
    const currentMonthStart = monthStartUtc(current.year, current.month);
    const nextMonth = addMonths(current.year, current.month, 1);
    const nextMonthStart = monthStartUtc(nextMonth.year, nextMonth.month);
    const historyStartMonth = addMonths(current.year, current.month, -11);
    const historyStart = monthStartUtc(historyStartMonth.year, historyStartMonth.month);
    const todayStart = wallTimeToUtc({ year: current.year, month: current.month, day: current.day, hour: 0, minute: 0, second: 0 });
    const thirtyDaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeResellersResult,
      pendingResellersResult,
      customerAccountsResult,
      totalProductsResult,
      totalOrdersResult,
      monthOrdersResult,
      subscribersResult,
      orderSummaryResult,
    ] = await Promise.all([
      supabase.from('accounts').select('id', { count: 'exact', head: true }).eq('role', 'reseller').eq('status', 'approved'),
      supabase.from('accounts').select('id', { count: 'exact', head: true }).eq('role', 'reseller').eq('status', 'pending'),
      supabase.from('accounts').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', currentMonthStart.toISOString()).lt('created_at', nextMonthStart.toISOString()),
      supabase.from('subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, total, status, customer, created_at'),
    ]);

    const results = [
      activeResellersResult, pendingResellersResult, customerAccountsResult, totalProductsResult,
      totalOrdersResult, monthOrdersResult, subscribersResult, orderSummaryResult,
    ];
    results.forEach(ensureQuery);

    if (!orderSummaryResult.data) throw new Error('Order summary was not returned');
    const orderSummary = orderSummaryResult.data;
    const totalOrders = totalOrdersResult.count;
    const monthOrders = monthOrdersResult.count;
    const activeResellers = activeResellersResult.count;
    const pendingResellers = pendingResellersResult.count;
    const customerAccounts = customerAccountsResult.count;
    const totalProducts = totalProductsResult.count;
    const subscribers = subscribersResult.count;
    let pkOrders = 0;
    let usOrders = 0;

    const totalRevenue = { pk: 0, us: 0 };
    const monthRevenue = { pk: 0, us: 0 };
    const monthlyHistory = Array.from({ length: 12 }, (_, index) => {
      const month = addMonths(current.year, current.month, index - 11);
      const start = monthStartUtc(month.year, month.month);
      const following = addMonths(month.year, month.month, 1);
      return {
        label: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: STORE_TIMEZONE }).format(start),
        start: start.getTime(),
        end: monthStartUtc(following.year, following.month).getTime(),
        orders: 0,
        pkRevenue: 0,
        usRevenue: 0,
      };
    });

    const statusBreakdown: Record<string, number> = {};
    for (const order of orderSummary) {
      const total = Number(order.total);
      if (!Number.isFinite(total)) throw new Error(`Invalid order total for order ${order.id}`);
      const market = getOrderMarket(order);

      const amount = market === 'pk' ? totalRevenue.pk : totalRevenue.us;
      if (market === 'pk') {
        pkOrders += 1;
        totalRevenue.pk = amount + total;
      }
      else totalRevenue.us = amount + total;

      const createdAt = new Date(order.created_at).getTime();
      const historyMonth = monthlyHistory.find(month => createdAt >= month.start && createdAt < month.end);
      if (historyMonth) {
        historyMonth.orders += 1;
        if (market === 'pk') historyMonth.pkRevenue += total;
        else historyMonth.usRevenue += total;
      }
      if (createdAt >= currentMonthStart.getTime() && createdAt < nextMonthStart.getTime()) {
        if (market === 'pk') monthRevenue.pk += total;
        else monthRevenue.us += total;
      }
      if (market === 'us') usOrders += 1;
      const status = order.status || 'unknown';
      statusBreakdown[status] = (statusBreakdown[status] ?? 0) + 1;
    }

    let visitors: { status: 'tracked'; today: number; last30Days: number } | { status: 'not_tracked'; reason: string };
    const [visitorsTodayResult, visitors30dResult] = await Promise.all([
      supabase.from('site_visits').select('visitor_id').gte('visited_at', todayStart.toISOString()).lt('visited_at', now.toISOString()),
      supabase.from('site_visits').select('visitor_id').gte('visited_at', thirtyDaysStart.toISOString()).lt('visited_at', now.toISOString()),
    ]);
    if (visitorsTodayResult.error || visitors30dResult.error) {
      const error = visitorsTodayResult.error ?? visitors30dResult.error;
      if (error?.code === '42P01' || error?.code === 'PGRST204' || error?.code === 'PGRST205') {
        visitors = { status: 'not_tracked', reason: 'site_visits table is not configured' };
      }
      else throw new Error(error?.message ?? 'Failed to load visitor metrics');
    } else {
      const todayVisitors = new Set((visitorsTodayResult.data ?? []).map(row => row.visitor_id).filter(Boolean));
      const last30DayVisitors = new Set((visitors30dResult.data ?? []).map(row => row.visitor_id).filter(Boolean));
      visitors = { status: 'tracked', today: todayVisitors.size, last30Days: last30DayVisitors.size };
    }

    const recentOrders = [...orderSummary]
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .slice(0, 10);

    return NextResponse.json({
      timezone: STORE_TIMEZONE,
      activeResellers,
      pendingResellers,
      customerAccounts,
      subscribers,
      visitors,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthOrders,
      monthRevenue,
      monthlyHistory: monthlyHistory.map(({ start, end, ...month }) => month),
      marketBreakdown: {
        pk: { orders: pkOrders, revenue: totalRevenue.pk },
        us: { orders: usOrders, revenue: totalRevenue.us },
      },
      recentOrders,
      statusBreakdown,
    });
  } catch (err: unknown) {
    console.error('[admin/stats] Failed to load stats:', err);
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Failed to load stats' }, { status: 500 });
  }
}