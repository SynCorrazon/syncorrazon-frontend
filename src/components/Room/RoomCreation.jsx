// src/components/Room/RoomCreation.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../common/ToastContainer";
import Navbar from "../Layout/Navbar";
import { getBackendToken, roomApi } from "../../services/api";
import { extractYouTubeVideoId } from "../../utils/youtube";
import "./RoomCreation.css";

const RoomCreation = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    const normalizedUrl = youtubeUrl.trim();

    if (!normalizedUrl) {
      toast.error("Please paste a YouTube URL");
      return;
    }

    if (!extractYouTubeVideoId(normalizedUrl)) {
      toast.error("Enter a valid YouTube video link to continue.");
      return;
    }

    setLoading(true);
    try {
      const token = await getBackendToken(currentUser);
      if (!token) {
        toast.error("Please log in again");
        navigate("/login");
        return;
      }

      const data = await roomApi.createRoom(normalizedUrl, token);
      const createdRoomCode = data.data?.roomCode || data.roomCode;
      if (!createdRoomCode) {
        throw new Error("The server did not return a room code.");
      }

      setRoomCode(createdRoomCode);
      toast.success(`Room created! Code: ${createdRoomCode}`);
    } catch (error) {
      console.error("Create room error:", error);
      toast.error(error.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!roomCode) return;
    const inviteLink = `${window.location.origin}/room/${roomCode}`;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable in this browser.");
      }
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy invite link error:", error);
      toast.error(
        "Could not copy the invite link. Please copy the room code instead."
      );
    }
  };

  const handleJoinRoom = () => {
    if (!roomCode) return;
    navigate(`/room/${roomCode}`);
  };

  const videoLinkIsValid = Boolean(extractYouTubeVideoId(youtubeUrl.trim()));

  return (
    <div className="room-creation-container">
      <Navbar />

      <div className="room-creation-content">
        <div className="room-creation-header">
          <div className="room-creation-step">
            YOUR WATCH ROOM <span>{roomCode ? "02 / 02" : "01 / 02"}</span>
          </div>
          <h1>
            {roomCode ? "Your room is ready." : "Make tonight a shared one."}
          </h1>
          <p className="room-creation-subtitle">
            {roomCode
              ? "Send the invite to someone you want to watch with."
              : "Add a YouTube video, then invite someone to watch it with you."}
          </p>
        </div>

        <div className="room-creation-layout">
          <section
            className="room-creation-card"
            aria-label="Create your watch room"
          >
            {!roomCode ? (
              <form
                className="room-creation-initial"
                onSubmit={handleCreateRoom}
                aria-busy={loading}
              >
                <div className="room-creation-field-heading">
                  <label htmlFor="youtube-url">YouTube video link</label>
                  <span>Required</span>
                </div>
                <p className="room-creation-text">
                  Paste the link to the video you’d like to watch together.
                </p>
                <div
                  className={`room-creation-url-input${
                    videoLinkIsValid ? " is-valid" : ""
                  }`}
                >
                  <input
                    id="youtube-url"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    placeholder="https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(event) => {
                      setYoutubeUrl(event.target.value);
                      setCopied(false);
                    }}
                    className="url-input-field"
                    disabled={loading}
                    aria-describedby="youtube-url-help youtube-url-status"
                  />
                  <span className="room-creation-input-icon" aria-hidden="true">
                    {videoLinkIsValid ? "✓" : "↗"}
                  </span>
                </div>
                <p className="room-creation-field-help" id="youtube-url-help">
                  Works with YouTube video, Shorts, and youtu.be links.
                </p>
                <p
                  className={`room-creation-link-status${
                    youtubeUrl.trim()
                      ? videoLinkIsValid
                        ? " is-valid"
                        : " is-invalid"
                      : ""
                  }`}
                  id="youtube-url-status"
                  aria-live="polite"
                >
                  {youtubeUrl.trim()
                    ? videoLinkIsValid
                      ? "YouTube link looks good."
                      : "Paste a valid YouTube video link to continue."
                    : "Your video will open in the shared room."}
                </p>
                <button
                  className="room-creation-btn room-creation-btn-create"
                  type="submit"
                  disabled={loading || !videoLinkIsValid}
                >
                  {loading ? (
                    <>
                      <span
                        className="room-creation-spinner"
                        aria-hidden="true"
                      />
                      Creating your room…
                    </>
                  ) : (
                    <>
                      Create watch room <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="room-creation-ready" aria-live="polite">
                <span className="room-creation-success-icon" aria-hidden="true">
                  ✓
                </span>
                <h2>Ready when you are</h2>
                <p className="room-creation-success-copy">
                  Share this code or invite link with your watch partner.
                </p>
                <div className="room-creation-code-container">
                  <span className="room-creation-code-label">ROOM CODE</span>
                  <strong className="room-creation-code">{roomCode}</strong>
                </div>

                <div className="room-creation-actions">
                  <button
                    className="room-creation-btn room-creation-btn-join"
                    type="button"
                    onClick={handleJoinRoom}
                  >
                    Enter your room <span aria-hidden="true">→</span>
                  </button>
                  <button
                    className="room-creation-btn room-creation-btn-copy"
                    type="button"
                    onClick={handleCopyLink}
                  >
                    {copied ? "Copied to clipboard" : "Copy invite link"}
                  </button>
                </div>

                <p className="room-creation-hint">
                  Your friend can join with the link or enter the room code.
                </p>
              </div>
            )}
          </section>

          <aside className="room-creation-aside">
            <span className="room-creation-aside-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                <path d="M3.5 4.5v15" />
              </svg>
            </span>
            <h2>Good video. Better company.</h2>
            <ul>
              <li>
                <span>01</span> You pick what to watch
              </li>
              <li>
                <span>02</span> Send one simple invite
              </li>
              <li>
                <span>03</span> Watch and chat in sync
              </li>
            </ul>
            <div className="room-creation-data-note">
              <span aria-hidden="true">↗</span>
              <p>
                YouTube plays on each person’s own connection. SynCorrazon
                doesn’t relay the video through a cloud stream.
              </p>
            </div>
          </aside>
        </div>

        <div className="room-creation-footer">
          <button
            type="button"
            className="room-creation-back"
            onClick={() => navigate("/lobby")}
          >
            <span aria-hidden="true">←</span> Back to your rooms
          </button>
          <p className="room-creation-footer-text">
            One room is just for two people.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomCreation;
