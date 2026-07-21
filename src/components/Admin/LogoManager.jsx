// src/components/Admin/LogoManager.jsx

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This component manages the SynCorrazon logo.
  2. It uploads to Firebase Storage and stores the download URL in Firestore.
  3. The frontend fetches the logo from Firestore.
  4. It shows a preview of the current logo.
*/

import React, { useState, useEffect } from 'react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { storage, firestore } from '../../services/firebase';
import { useToast } from '../common/ToastContainer';
import './Admin.css';

const LogoManager = () => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch current logo URL from Firestore
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const docRef = doc(firestore, 'settings', 'brand');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().logoUrl) {
          setLogoUrl(docSnap.data().logoUrl);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };
    fetchLogo();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, 'logos/syncorrazon-logo');
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save URL to Firestore
      const docRef = doc(firestore, 'settings', 'brand');
      await setDoc(docRef, { logoUrl: downloadURL }, { merge: true });

      setLogoUrl(downloadURL);
      toast.success('Logo uploaded successfully!');
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!logoUrl) return;

    setLoading(true);
    try {
      // Delete from Storage
      const storageRef = ref(storage, 'logos/syncorrazon-logo');
      await deleteObject(storageRef);

      // Remove URL from Firestore
      const docRef = doc(firestore, 'settings', 'brand');
      await setDoc(docRef, { logoUrl: null }, { merge: true });

      setLogoUrl(null);
      toast.success('Logo deleted.');
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast.error('Failed to delete logo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>🖼️ Logo Manager</h2>

      <div className="admin-logo-display">
        {logoUrl ? (
          <div className="admin-logo-preview">
            <img src={logoUrl} alt="SynCorrazon logo" className="admin-logo-img" />
            <button
              className="admin-btn-sm admin-btn-delete"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Logo'}
            </button>
          </div>
        ) : (
          <p className="admin-empty">No logo uploaded yet</p>
        )}
      </div>

      <div className="admin-logo-upload">
        <h4>Upload New Logo</h4>
        <p className="admin-hint">Recommended: PNG with transparent background, 500x500px</p>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div className="admin-logo-preview">
            <img src={preview} alt="Preview" className="admin-logo-img" />
          </div>
        )}
        <button
          className="admin-btn-primary"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload Logo'}
        </button>
      </div>
    </div>
  );
};

export default LogoManager;