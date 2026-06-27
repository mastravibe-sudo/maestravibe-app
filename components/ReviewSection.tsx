// components/ReviewSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  customer_name: string;
  stars: number;
  body: string;
  photo_url?: string;
  verified: boolean;
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
}

function StarDisplay({ stars, size = 'sm' }: { stars: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sz} ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <svg className={`w-8 h-8 ${s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    stars: 0,
    body: '',
    photo_url: '',
  });

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}&page=${p}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
    } catch {}
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchReviews(page); }, [fetchReviews, page]);

  const avgStars = reviews.length
    ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length
    : 0;

  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.stars === star).length / reviews.length) * 100) : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.stars === 0) { setSubmitError('Please select a star rating.'); return; }
    if (!form.customer_name.trim()) { setSubmitError('Please enter your name.'); return; }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product_id: productId }),
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

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Customer Reviews</h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-10 bg-gray-50 rounded-2xl p-6">
          <div className="text-center shrink-0">
            <p className="text-6xl font-black text-gray-900">{avgStars.toFixed(1)}</p>
            <StarDisplay stars={Math.round(avgStars)} size="lg" />
            <p className="text-sm text-gray-500 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1">
            {histogram.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review button */}
      {!showForm && !submitDone && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          ✍️ Write a Review
        </button>
      )}

      {submitDone && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm font-medium">
          ✅ Thank you! Your review has been submitted and will appear after approval.
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-10 bg-white border-2 border-violet-100 rounded-2xl p-6">
          <h3 className="text-lg font-black mb-5">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
              <StarPicker value={form.stars} onChange={(v) => setForm((p) => ({ ...p, stars: v }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (optional)</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm((p) => ({ ...p, customer_email: e.target.value }))}
                  placeholder="For verified badge"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Review</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                placeholder="Tell others what you think about this product..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition resize-none"
              />
            </div>
            {submitError && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{submitError}</div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
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
            <div key={review.id} className="border border-gray-100 rounded-2xl p-5 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-800">{review.customer_name}</p>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarDisplay stars={review.stars} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {review.body && <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>}
              {review.photo_url && (
                <img src={review.photo_url} alt="Review photo" className="mt-3 rounded-xl max-h-40 object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-violet-400 transition"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-violet-400 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}