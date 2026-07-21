# SynCorrazon – Watch YouTube Together

**SynCorrazon** is a Nigerian-first sync-watch platform. Two people watch the same YouTube video in real-time – even on slow networks (MTN, Glo, Airtel).

## Features (MVP)

- Room creation + invite link
- YouTube link sync (play/pause/seek via WebRTC)
- Heartbeat sync (500ms) – auto-corrects drift
- Text chat overlay
- Manual resync button
- Sync status indicator (Green/Yellow/Orange/Red)
- User accounts (email/password + Google Sign-In)
- Free tier (1.5hr/day) + ad banner

## Tech Stack

- **Frontend:** React.js + CSS
- **Backend:** Node.js + Express + Socket.io
- **P2P:** WebRTC (simple-peer)
- **Database/Auth:** Firebase Firestore + Firebase Auth
- **Hosting:** Vercel (frontend) + Render (backend)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/SynCorrazon/syncorrazon-frontend.git
   cd syncorrazon-frontend