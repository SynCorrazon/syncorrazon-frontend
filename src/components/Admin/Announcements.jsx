// src/components/Admin/Announcements.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This component manages announcements – post, edit, delete.
  2. It stores announcements in Firestore: /announcements/{id}
  3. It displays the current list of announcements.
  4. Users see active announcements on the frontend.
*/

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { useToast } from '../common/ToastContainer';
import './Admin.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const q = query(
      collection(firestore, 'announcements'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setAnnouncements(items);
    });

    return unsubscribe;
  }, []);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) {
      toast.error('Please enter an announcement');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'announcements'), {
        text: newAnnouncement.trim(),
        timestamp: serverTimestamp(),
        active: true,
      });
      setNewAnnouncement('');
      toast.success('Announcement posted!');
    } catch (error) {
      console.error('Error adding announcement:', error);
      toast.error('Failed to post announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'announcements', id));
      toast.success('Announcement deleted.');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete.');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateDoc(doc(firestore, 'announcements', id), {
        active: !currentStatus,
      });
      toast.success('Status updated.');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update.');
    }
  };

  return (
    <div className="admin-section">
      <h2>📢 Announcements</h2>

      <form onSubmit={handleAddAnnouncement} className="admin-form">
        <div className="admin-form-group">
          <input
            type="text"
            placeholder="Write an announcement..."
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            className="admin-input"
            disabled={loading}
          />
        </div>
        <button type="submit" className="admin-btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </form>

      <div className="admin-list">
        {announcements.length === 0 ? (
          <p className="admin-empty">No announcements yet</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="admin-list-item">
              <div className="admin-list-content">
                <p className="admin-list-text">{announcement.text}</p>
                <span className={`admin-badge ${announcement.active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                  {announcement.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="admin-list-actions">
                <button
                  className="admin-btn-sm admin-btn-toggle"
                  onClick={() => handleToggleActive(announcement.id, announcement.active)}
                >
                  {announcement.active ? 'Hide' : 'Show'}
                </button>
                <button
                  className="admin-btn-sm admin-btn-delete"
                  onClick={() => handleDelete(announcement.id)}
                >
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

export default Announcements;