import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import './ApprovedReviews.css';

const ApprovedReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const reviewsQuery = query(
      collection(firestore, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(reviewsQuery, (snapshot) => {
      setReviews(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error('Error loading approved reviews:', error);
    });
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="approved-reviews" aria-labelledby="approved-reviews-title">
      <h2 id="approved-reviews-title">What people are saying</h2>
      <div className="approved-reviews-list">
        {reviews.map((review) => (
          <article key={review.id} className="approved-review">
            <div className="approved-review-rating" aria-label={`${review.rating} out of 5 stars`}>
              {'*'.repeat(Math.max(0, Math.min(5, Math.round(review.rating || 0))))}
            </div>
            <p>{review.comment}</p>
            <strong>{review.userName || 'SynCorrazon user'}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ApprovedReviews;
