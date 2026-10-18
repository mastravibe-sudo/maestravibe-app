// components/ReviewSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, Loader2, PenLine, Star } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  stars: number;
  body: string;
  photo_url?: string;
  verified: boolean;
  created_at: string;
}

type Summary = { avg: number; count: number; dist: Record<string, number> };

function StarDisplay({ stars, size = 'sm' }: { stars: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} aria-hidden="true" />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`w-8 h-8 ${s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderContact, setOrderContact] = useState('');

  const [form, setForm] = useState({ customer_name: '', customer_email: '', stars: 0, body: '', photo_url: '' });

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}&page=${p}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
    } catch {}
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchReviews(page); }, [fetchReviews, page]);

  // Opened from the order tracking page (?reviewOrder=ID): open the form for a Verified Purchase review
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get('reviewOrder');
    if (o) {
      setOrderId(o.slice(0, 64));
      setShowForm(true);
      setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 400);
    }
  }, []);

  // REAL numbers for ALL approved reviews (not just the 10 on this page)
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews/summary?ids=${encodeURIComponent(productId)}&dist=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setSummary(d?.[productId] ?? { avg: 0, count: 0, dist: {} }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [productId]);

  const count = summary?.count ?? 0;
  const avg = summary?.avg ?? 0;
  const histogram = [5, 4, 3, 2, 1].map((star) => {
    const c = summary?.dist?.[String(star)] ?? 0;
    return { star, count: c, pct: count ? Math.round((c / count) * 100) : 0 };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.stars === 0) { setSubmitError('Please select a star rating.'); return; }
    if (!form.customer_name.trim()) { setSubmitError('Please enter your name.'); return; }
    if (orderId && !orderContact.trim()) { setSubmitError('Enter the email or phone number used on your order.'); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product_id: productId, order_id: orderId || undefined, order_contact: orderContact || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitDone(true);
      setShowForm(false);
      setForm({ customer_name: '', customer_email: '', stars: 0, body: '', photo_url: '' });
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = 'w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm min-h-11 focus:outline-none focus:border-violet-500 transition';

  return (
    <div id="reviews" className="border-t border-gray-100 pt-8 sm:pt-10">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Customer Reviews</h2>

      {count > 0 && (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 bg-gray-50 rounded-2xl p-4 sm:p-6">
          <div className="text-center shrink-0">
            <p className="text-5xl sm:text-6xl font-black text-gray-900">{avg.toFixed(1)}</p>
            <div className="flex justify-center"><StarDisplay stars={Math.round(avg)} size="lg" /></div>
            <p className="text-sm text-gray-500 mt-1">{count} review{count !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1">
            {histogram.map(({ star, count: c, pct }) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showForm && !submitDone && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 min-h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" /> Write a Review
        </button>
      )}

      {submitDone && (
        <div className="mb-8 flex items-start gap-2 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm font-medium" role="status">
          <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          Thank you! Your review has been submitted and will appear after approval.
        </div>
      )}

      {showForm && (
        <div className="mb-10 bg-white border-2 border-violet-100 rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg font-black mb-5">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</span>
              <StarPicker value={form.stars} onChange={(v) => setForm((p) => ({ ...p, stars: v }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rv-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                <input id="rv-name" type="text" value={form.customer_name} onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))} placeholder="Your name" className={field} />
              </div>
              <div>
                <label htmlFor="rv-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email (optional)</label>
                <input id="rv-email" type="email" value={form.customer_email} onChange={(e) => setForm((p) => ({ ...p, customer_email: e.target.value }))} placeholder="For verified badge" className={field} />
              </div>
            </div>
            {orderId && (
              <div>
                <label htmlFor="rv-contact" className="block text-sm font-semibold text-gray-700 mb-1.5">Email or phone used on your order *</label>
                <input id="rv-contact" type="text" value={orderContact} onChange={(e) => setOrderContact(e.target.value)} placeholder="Needed for the Verified Purchase badge" className={field} />
              </div>
            )}
            <div>
              <label htmlFor="rv-body" className="block text-sm font-semibold text-gray-700 mb-1.5">Your Review</label>
              <textarea id="rv-body" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Tell others what you think about this product..." rows={4} className={`${field} resize-none`} />
            </div>
            {submitError && <div role="alert" className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{submitError}</div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 min-h-11 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 bg-violet-600 text-white py-3 min-h-11 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="font-semibold">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-2xl p-4 sm:p-5 bg-white">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{review.customer_name}</p>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarDisplay stars={review.stars} />
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {review.body && <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>}
              {review.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.photo_url} alt="Review photo" className="mt-3 rounded-xl max-h-40 object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page"
            className="inline-flex items-center gap-1 px-4 py-2 min-h-10 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-violet-400 transition">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Prev
          </button>
          <span className="px-2 text-sm text-gray-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 10)} aria-label="Next page"
            className="inline-flex items-center gap-1 px-4 py-2 min-h-10 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-violet-400 transition">
            Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}