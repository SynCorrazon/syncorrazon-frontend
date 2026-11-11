import React from 'react';
import { Link } from 'react-router-dom';
import ApprovedReviews from '../common/ApprovedReviews';
import ThemeSelector from '../Layout/ThemeSelector';
import './LandingPage.css';

const FAQ_ITEMS = [
  {
    question: 'How can I watch YouTube together with someone far away?',
    answer:
      'Create a SynCorrazon room, open a YouTube video, and send your invite link to the person you want to watch with. Playback controls stay in sync while you watch.',
  },
  {
    question: 'What can I do with my long-distance partner?',
    answer:
      'Plan a shared movie night, watch a music video or a favorite creator together, and chat in your private watch room. It is an easy way to make time together across time zones.',
  },
  {
    question: 'How can I spend Christmas with family in another country?',
    answer:
      'Share a YouTube holiday movie, concert, or music playlist and watch it in sync with a family member. Rooms currently support two people; multi-person family rooms are planned.',
  },
  {
    question: 'Does SynCorrazon use extra data to stream the video?',
    answer:
      'SynCorrazon synchronizes playback instead of relaying the video through its own cloud stream. Each person watches through YouTube on their own connection, so data use depends on the video and playback quality as usual.',
  },
  {
    question: 'Can friends and family in Nigeria use SynCorrazon?',
    answer:
      'Yes. SynCorrazon is designed for people to watch together across distances, including friends and loved ones in Nigeria and around the world. You will need an internet connection to play YouTube videos.',
  },
];

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
};

const appStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SynCorrazon',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web browser',
  description:
    'Watch YouTube together in sync with a long-distance partner, friend, or family member.',
  featureList: [
    'Synchronized YouTube playback',
    'Private watch rooms with invite links',
    'Live room chat',
  ],
};

const LandingPage = () => (
  <main className="landing-page">
    <script type="application/ld+json">
      {JSON.stringify([appStructuredData, faqStructuredData])}
    </script>

    <header className="landing-nav">
      <Link to="/" className="landing-brand" aria-label="SynCorrazon home">
        <img src="/assets/synco-logo.png" alt="" />
        <span>SynCorrazon</span>
      </Link>
      <div className="landing-nav-actions">
        <ThemeSelector placement="navbar" />
        <Link to="/login" className="landing-signin">
          Sign in
        </Link>
        <Link to="/signup" className="landing-nav-cta">
          Start watching
        </Link>
      </div>
    </header>

    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">Good company, no matter the distance</p>
        <h1 id="landing-title" className="landing-title">
          Watch YouTube together, wherever you are.
        </h1>
        <p className="landing-subtitle">
          Make room for a shared movie night with your partner, friends, or
          family—even when you live miles apart.
        </p>
        <p className="landing-description">
          Start a private room, share the invite, and watch videos in sync.
          SynCorrazon syncs playback instead of sending video through another
          streaming service.
        </p>
        <div className="landing-buttons">
          <Link to="/signup" className="landing-btn landing-btn-primary">
            Create a watch room
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/login" className="landing-btn landing-btn-secondary">
            I already have an account
          </Link>
        </div>
        <p className="landing-data-note">
          YouTube plays on each person’s own connection. Standard YouTube data
          use applies.
        </p>
      </div>

      <div
        className="landing-demo"
        role="img"
        aria-label="Illustration of two people watching a video together from different places"
      >
        <div className="landing-demo-topbar">
          <span className="landing-demo-mark">S</span>
          <span>YOUR WATCH ROOM</span>
          <span className="landing-demo-live">
            <i /> IN SYNC
          </span>
        </div>
        <div className="landing-demo-screen">
          <div className="landing-demo-orbit landing-demo-orbit-one" />
          <div className="landing-demo-orbit landing-demo-orbit-two" />
          <div className="landing-demo-screen-caption">
            <span>TONIGHT’S PLAN</span>
            <strong>One more episode?</strong>
          </div>
          <span className="landing-demo-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.8v12.4c0 .8.9 1.3 1.6.9l9.1-6.2a1.1 1.1 0 0 0 0-1.8L9.6 4.9A1.1 1.1 0 0 0 8 5.8Z" />
            </svg>
          </span>
          <div className="landing-demo-progress">
            <span />
          </div>
        </div>
        <div className="landing-demo-people">
          <div className="landing-demo-person">
            <span className="landing-demo-avatar">Y</span>
            <span>
              <strong>You</strong>
              <small>Watching now</small>
            </span>
            <i aria-hidden="true" />
          </div>
          <div className="landing-demo-person">
            <span className="landing-demo-avatar landing-demo-avatar-alt">
              ♥
            </span>
            <span>
              <strong>Your person</strong>
              <small>Right there with you</small>
            </span>
            <i aria-hidden="true" />
          </div>
        </div>
        <div className="landing-demo-chat">
          <span aria-hidden="true">✦</span>
          <p>“Press play — I’m ready.”</p>
        </div>
      </div>
    </section>

    <section
      className="landing-section landing-how"
      aria-labelledby="how-title"
    >
      <div className="landing-section-heading">
        <p className="landing-eyebrow">Simple to start</p>
        <h2 id="how-title">A little closer in three steps.</h2>
        <p>
          No complicated setup. Pick a video, invite someone, and settle in
          together.
        </p>
      </div>
      <div className="landing-step-grid">
        <article className="landing-step">
          <span className="landing-step-number">01</span>
          <h3>Make a room</h3>
          <p>Sign in and start a private watch room for the two of you.</p>
        </article>
        <article className="landing-step">
          <span className="landing-step-number">02</span>
          <h3>Choose a video</h3>
          <p>Bring a YouTube video you both want to watch.</p>
        </article>
        <article className="landing-step">
          <span className="landing-step-number">03</span>
          <h3>Share the moment</h3>
          <p>Send the room link and watch in sync, with chat close by.</p>
        </article>
      </div>
    </section>

    <section
      className="landing-section landing-features"
      aria-labelledby="features-title"
    >
      <div className="landing-section-heading">
        <p className="landing-eyebrow">Made for being apart</p>
        <h2 id="features-title">Your usual YouTube. A shared moment.</h2>
        <p>
          Keep the tech in the background, so the person you miss stays in the
          moment.
        </p>
      </div>
      <div className="landing-feature-grid">
        <article className="landing-feature">
          <span className="landing-feature-icon" aria-hidden="true">
            ↔
          </span>
          <h3>Playback that stays together</h3>
          <p>
            Play, pause, or catch up together instead of counting down over
            messages.
          </p>
        </article>
        <article className="landing-feature">
          <span className="landing-feature-icon" aria-hidden="true">
            ⌁
          </span>
          <h3>A room that’s yours</h3>
          <p>
            Share a room link with the person you want beside you for movie
            night.
          </p>
        </article>
        <article className="landing-feature">
          <span className="landing-feature-icon" aria-hidden="true">
            “
          </span>
          <h3>Chat while you watch</h3>
          <p>
            React to the funny bits, pick the next video, and keep the
            conversation going.
          </p>
        </article>
        <article className="landing-feature">
          <span className="landing-feature-icon" aria-hidden="true">
            ◉
          </span>
          <h3>No extra video relay</h3>
          <p>
            YouTube streams to each viewer as usual. SynCorrazon coordinates
            playback, not a second copy of the video.
          </p>
        </article>
      </div>
    </section>

    <section className="landing-holiday" aria-labelledby="holiday-title">
      <div>
        <p className="landing-eyebrow">Across countries and time zones</p>
        <h2 id="holiday-title">
          How to spend Christmas with family in another country?
        </h2>
        <p>
          Pick a holiday movie, concert, or playlist on YouTube and make time to
          watch it with someone you love. SynCorrazon rooms are for two people
          today; updates to support watching with more family members are
          planned.
        </p>
        <Link to="/signup" className="landing-text-link">
          Make a little time together <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="landing-holiday-note" aria-hidden="true">
        <span>HOME IS A PERSON</span>
        <strong>
          Same song.
          <br />
          Different places.
        </strong>
        <span className="landing-holiday-stars">✳ &nbsp; ✦ &nbsp; ✳</span>
      </div>
    </section>

    <section
      className="landing-section landing-faq"
      aria-labelledby="faq-title"
    >
      <div className="landing-section-heading">
        <p className="landing-eyebrow">Good to know</p>
        <h2 id="faq-title">A few things you might be wondering.</h2>
      </div>
      <div className="landing-faq-list">
        {FAQ_ITEMS.map(({ question, answer }) => (
          <details className="landing-faq-item" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>

    <section className="landing-trust" aria-labelledby="trust-title">
      <div>
        <p className="landing-eyebrow">Your connection, your choice</p>
        <h2 id="trust-title">YouTube plays on your connection.</h2>
        <p>
          SynCorrazon coordinates watch-room playback and chat; it does not
          cloud-stream the video. Each viewer’s data use depends on YouTube
          playback and video quality, just as it normally would.
        </p>
      </div>
      <span className="landing-trust-mark" aria-hidden="true">
        ↗
      </span>
    </section>

    <div className="landing-reviews">
      <ApprovedReviews />
    </div>

    <footer className="landing-footer">
      <Link to="/" className="landing-brand" aria-label="SynCorrazon home">
        <img src="/assets/synco-logo.png" alt="" />
        <span>SynCorrazon</span>
      </Link>
      <p>Make a little time for the people you miss.</p>
      <Link to="/signup">Create a watch room</Link>
    </footer>
  </main>
);

export default LandingPage;
