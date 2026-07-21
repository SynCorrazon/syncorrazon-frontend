// src/components/Admin/AdminPanel.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the Admin Panel – a dashboard for managing SynCorrazon.
  2. It includes: Announcements, Logo Manager, Reviews Manager.
  3. It's password-protected (AdminAuth) and only visible to me.
  4. It uses Firebase to read/write data.
*/

import React, { useState } from 'react';
import Announcements from './Announcements';
import LogoManager from './LogoManager';
import ReviewsManager from './ReviewsManager';
import './Admin.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('announcements');

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>⚙️ SynCorrazon Admin</h1>
        <p className="admin-subtitle">Manage announcements, logos, and reviews</p>
      </header>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements
        </button>
        <button
          className={`admin-tab ${activeTab === 'logo' ? 'active' : ''}`}
          onClick={() => setActiveTab('logo')}
        >
          🖼️ Logo
        </button>
        <button
          className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'announcements' && <Announcements />}
        {activeTab === 'logo' && <LogoManager />}
        {activeTab === 'reviews' && <ReviewsManager />}
      </div>
    </div>
  );
};

export default AdminPanel;