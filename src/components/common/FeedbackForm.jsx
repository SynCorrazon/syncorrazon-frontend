import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../services/firebase';
import { useToast } from './ToastContainer';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error('Please describe the issue first.');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(firestore, 'feedback'), {
        message: trimmedMessage,
        status: 'open',
        userId: currentUser?.uid || null,
        userName: currentUser?.displayName || null,
        userEmail: currentUser?.email || null,
        createdAt: serverTimestamp(),
      });
      setMessage('');
      toast.success('Thanks. Your feedback has been sent.');
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Could not send feedback right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <div>
        <h2 className="feedback-form-title">Something not working?</h2>
        <p className="feedback-form-copy">Tell us what happened and we will look into it.</p>
      </div>
      <textarea
        className="feedback-form-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Describe the problem..."
        rows="3"
        maxLength="1000"
        disabled={sending}
      />
      <button className="room-btn room-btn-join" type="submit" disabled={sending}>
        {sending ? 'Sending...' : 'Send feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm;
