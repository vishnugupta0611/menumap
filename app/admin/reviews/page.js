"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    if (!user?.restaurantId) return;
    try {
      const res = await api.get(`/api/restaurants/id/${user.restaurantId}/reviews`);
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user?.restaurantId]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/api/restaurants/reviews/${id}`);
      loadReviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-primary font-bold animate-pulse">Loading reviews...</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex justify-between items-end">
        <div>
          <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Customer Reviews</h1>
        </div>
        {reviews.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface-variant">Avg Rating</p>
            <div className="flex items-center gap-1 text-2xl font-bold text-amber-500">
              {averageRating} <MaterialIcon name="star" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(review => (
          <div key={review._id} className="bg-white p-6 rounded-3xl border border-surface-container shadow-sm space-y-3 relative">
            <button onClick={() => handleDelete(review._id)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-error-container hover:text-error transition-colors text-on-surface-variant" title="Delete Review">
              <MaterialIcon name="delete" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {review.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm">{review.name}</h4>
                <div className="flex text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <MaterialIcon key={i} name={i < review.rating ? "star" : "star_border"} className="text-[16px]" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant italic">"{review.text}"</p>
            <p className="text-[10px] text-on-surface-variant/50 uppercase font-bold tracking-wider">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-outline-variant rounded-3xl text-on-surface-variant">
            <MaterialIcon name="reviews" className="text-4xl mb-2 opacity-50" />
            <p className="font-bold">No reviews yet</p>
            <p className="text-sm mt-1">Once customers start reviewing, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
