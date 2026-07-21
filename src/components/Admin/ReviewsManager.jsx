// src/components/Admin/ReviewsManager.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This component manages user reviews – approve, reject, delete.
  2. It stores reviews in Firestore: /reviews/{id}
  3. Approved reviews appear on the frontend.
  4. It shows: user name, rating, comment, status, timestamp.
*/

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { useToast } from '../common/ToastContainer';
import './Admin.css';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const toast = useToast();

  useEffect(() => {
    const q = query(
      collection(firestore, 'reviews'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setReviews(items);
    });

    return unsubscribe;
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(firestore, 'reviews', id), {
        status: 'approved',
      });
      toast.success('Review approved!');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve.');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(firestore, 'reviews', id), {
        status: 'rejected',
      });
      toast.success('Review rejected.');
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'reviews', id));
      toast.success('Review deleted.');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete.');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="admin-section">
      <h2>⭐ Reviews Manager</h2>

      <div className="admin-filter">
        <label>Filter:</label>
        <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({reviews.length})
        </button>
        <button className={`admin-filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending ({reviews.filter(r => r.status === 'pending').length})
        </button>
        <button className={`admin-filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          Approved ({reviews.filter(r => r.status === 'approved').length})
        </button>
        <button className={`admin-filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          Rejected ({reviews.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      <div className="admin-list">
        {filteredReviews.length === 0 ? (
          <p className="admin-empty">No reviews</p>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="admin-list-item">
              <div className="admin-list-content">
                <p className="admin-list-text">
                  <strong>{review.userName || 'Anonymous'}</strong> – {renderStars(review.rating)}
                </p>
                <p className="admin-list-text">"{review.comment}"</p>
                <span className={`admin-badge ${
                  review.status === 'approved' ? 'admin-badge-active' :
                  review.status === 'rejected' ? 'admin-badge-inactive' :
                  'admin-badge-pending'
                }`}>
                  {review.status || 'pending'}
                </span>
              </div>
              <div className="admin-list-actions">
                {review.status !== 'approved' && (
                  <button className="admin-btn-sm admin-btn-approve" onClick={() => handleApprove(review.id)}>
                    ✅ Approve
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button className="admin-btn-sm admin-btn-reject" onClick={() => handleReject(review.id)}>
                    ❌ Reject
                  </button>
                )}
                <button className="admin-btn-sm admin-btn-delete" onClick={() => handleDelete(review.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;