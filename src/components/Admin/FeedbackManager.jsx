import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { useToast } from '../common/ToastContainer';
import './Admin.css';

const FeedbackManager = () => {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    const feedbackQuery = query(
      collection(firestore, 'feedback'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(feedbackQuery, (snapshot) => {
      setFeedback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error('Error loading feedback:', error);
      toast.error('Could not load feedback. Check your Firestore rules.');
    });
  }, [toast]);

  const handleToggleStatus = async (item) => {
    try {
      await updateDoc(doc(firestore, 'feedback', item.id), {
        status: item.status === 'handled' ? 'open' : 'handled',
      });
      toast.success(item.status === 'handled' ? 'Feedback reopened.' : 'Feedback marked handled.');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'feedback', id));
      toast.success('Feedback deleted.');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback.');
    }
  };

  const visibleFeedback = feedback.filter((item) => (
    filter === 'all' || item.status === filter
  ));

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'Just now';
    return timestamp.toDate().toLocaleString();
  };

  return (
    <div className="admin-section">
      <h2>Feedback Inbox</h2>

      <div className="admin-filter">
        <label>Filter:</label>
        {['all', 'open', 'handled'].map((status) => (
          <button
            key={status}
            className={`admin-filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? `All (${feedback.length})` : `${status[0].toUpperCase()}${status.slice(1)} (${feedback.filter((item) => item.status === status).length})`}
          </button>
        ))}
      </div>

      <div className="admin-list">
        {visibleFeedback.length === 0 ? (
          <p className="admin-empty">No feedback in this view.</p>
        ) : (
          visibleFeedback.map((item) => (
            <div key={item.id} className="admin-list-item">
              <div className="admin-list-content">
                <p className="admin-list-text">
                  <strong>{item.userName || item.userEmail || 'Anonymous'}</strong>
                  {' '}<span className="admin-feedback-date">{formatDate(item.createdAt)}</span>
                </p>
                <p className="admin-list-text">{item.message}</p>
                <span className={`admin-badge ${item.status === 'handled' ? 'admin-badge-active' : 'admin-badge-pending'}`}>
                  {item.status || 'open'}
                </span>
              </div>
              <div className="admin-list-actions">
                <button className="admin-btn-sm admin-btn-toggle" onClick={() => handleToggleStatus(item)}>
                  {item.status === 'handled' ? 'Reopen' : 'Mark handled'}
                </button>
                <button className="admin-btn-sm admin-btn-delete" onClick={() => handleDelete(item.id)}>
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

export default FeedbackManager;
