// components/OrderTimeline.tsx
'use client';

import { CheckCircle2, ClipboardList, Package, PackageCheck, Truck, XCircle } from 'lucide-react';
import { STAGES, STAGE_LABEL, type Stage } from '@/lib/order-status';

export type TimelineEvent = { status: string; note?: string | null; actor?: string | null; created_at: string };

const ICON = { placed: ClipboardList, accepted: CheckCircle2, packed: Package, shipped: Truck, delivered: PackageCheck } as const;

export default function OrderTimeline({ stage, events = [] }: { stage: Stage; events?: TimelineEvent[] }) {
  const cancelled = stage === 'cancelled';
  const idx = cancelled ? -1 : STAGES.indexOf(stage as (typeof STAGES)[number]);
  const pct = cancelled ? 0 : (idx / (STAGES.length - 1)) * 100;

  return (
    <div className="space-y-5">
      {cancelled ? (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm font-semibold">
          <XCircle className="w-5 h-5" aria-hidden="true" /> This order was cancelled.
        </div>
      ) : (
        <>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ol className="grid grid-cols-5 gap-1 sm:gap-2">
            {STAGES.map((s, i) => {
              const Icon = ICON[s];
              const done = i <= idx;
              return (
                <li key={s} className="flex flex-col items-center text-center gap-1.5">
                  <span className={`grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-full ${done ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </span>
                  <span className={`text-[10px] leading-tight sm:text-xs ${done ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{STAGE_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {events.length > 0 && (
        <ul className="space-y-3 border-l-2 border-gray-200 pl-4">
          {[...events].reverse().map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-900 capitalize">{(STAGE_LABEL as Record<string, string>)[e.status] ?? e.status.replace(/_/g, ' ')}</p>
              {e.note && <p className="text-sm text-gray-600">{e.note}</p>}
              <p className="text-xs text-gray-500">{new Date(e.created_at).toLocaleString()}{e.actor && e.actor !== 'system' ? ` \u00b7 ${e.actor}` : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}