// src/utils/youtube.js

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This is the YouTube API helper – it loads the IFrame API and controls the player.
  2. It uses the YouTube IFrame Player API to embed and control YouTube videos.
  3. Functions include: loadPlayer, playVideo, pauseVideo, seekTo, getCurrentTime, getDuration.
  4. I use this in the VideoPlayer component to control the YouTube player.
  5. It loads the API asynchronously (doesn't block the rest of the app).
*/

// YouTube API script URL
const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api';

// Promise that resolves when the YouTube API is loaded
let apiLoaded = false;
let apiLoadingPromise = null;

// Load the YouTube IFrame API
export const loadYouTubeAPI = () => {
  // If already loaded, resolve immediately
  if (apiLoaded) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (apiLoadingPromise) {
    return apiLoadingPromise;
  }

  // Create a new promise to load the API
  apiLoadingPromise = new Promise((resolve) => {
    // Create script tag
    const script = document.createElement('script');
    script.src = YOUTUBE_API_URL;
    script.async = true;

    // When the API is ready, it calls window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      resolve();
    };

    // Fallback: if the API doesn't load within 10 seconds, resolve anyway
    const timeout = setTimeout(() => {
      if (!apiLoaded) {
        console.warn('YouTube API load timeout – continuing anyway');
        apiLoaded = true;
        resolve();
      }
    }, 10000);

    // Append the script to the head
    document.head.appendChild(script);

    // If the script loads successfully, it will call the callback
    // If it fails, the timeout will catch it
  });

  return apiLoadingPromise;
};

// Create a YouTube player instance
export const createYouTubePlayer = (elementId, options = {}) => {
  return new Promise((resolve) => {
    // Ensure the API is loaded
    loadYouTubeAPI().then(() => {
      // Wait for the API to be fully ready
      const checkReady = () => {
        if (window.YT && window.YT.Player) {
          const player = new window.YT.Player(elementId, {
            height: options.height || '100%',
            width: options.width || '100%',
            videoId: options.videoId || '',
            playerVars: {
              autoplay: options.autoplay ? 1 : 0,
              controls: options.controls !== undefined ? options.controls : 1,
              rel: 0, // Don't show related videos
              modestbranding: 1, // No YouTube logo
              iv_load_policy: 3, // No annotations
              disablekb: 0, // Allow keyboard controls
              fs: 1, // Allow fullscreen
              ...options.playerVars,
            },
            events: {
              onReady: (event) => {
                resolve(player);
                if (options.onReady) options.onReady(event);
              },
              onStateChange: (event) => {
                if (options.onStateChange) options.onStateChange(event);
              },
              onError: (error) => {
                console.error('YouTube player error:', error);
                if (options.onError) options.onError(error);
              },
            },
          });
        } else {
          // If YT is still not ready, retry after a short delay
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  });
};

// Player control functions (to be used with a player instance)
export const playerControls = {
  play: (player) => {
    if (player && player.playVideo) {
      player.playVideo();
    }
  },
  pause: (player) => {
    if (player && player.pauseVideo) {
      player.pauseVideo();
    }
  },
  seekTo: (player, seconds, allowSeekAhead = true) => {
    if (player && player.seekTo) {
      player.seekTo(seconds, allowSeekAhead);
    }
  },
  getCurrentTime: (player) => {
    if (player && player.getCurrentTime) {
      return player.getCurrentTime();
    }
    return 0;
  },
  getDuration: (player) => {
    if (player && player.getDuration) {
      return player.getDuration();
    }
    return 0;
  },
  isPlaying: (player) => {
    if (player && player.getPlayerState) {
      return player.getPlayerState() === 1; // 1 = playing
    }
    return false;
  },
  isPaused: (player) => {
    if (player && player.getPlayerState) {
      return player.getPlayerState() === 2; // 2 = paused
    }
    return true;
  },
  getPlayerState: (player) => {
    if (player && player.getPlayerState) {
      return player.getPlayerState();
    }
    return -1;
  },
  loadVideoById: (player, videoId, startSeconds = 0) => {
    if (player && player.loadVideoById) {
      player.loadVideoById(videoId, startSeconds);
    }
  },
  cueVideoById: (player, videoId, startSeconds = 0) => {
    if (player && player.cueVideoById) {
      player.cueVideoById(videoId, startSeconds);
    }
  },
  stopVideo: (player) => {
    if (player && player.stopVideo) {
      player.stopVideo();
    }
  },
  setVolume: (player, volume) => {
    if (player && player.setVolume) {
      player.setVolume(Math.max(0, Math.min(100, volume)));
    }
  },
  getVolume: (player) => {
    if (player && player.getVolume) {
      return player.getVolume();
    }
    return 100;
  },
  mute: (player) => {
    if (player && player.mute) {
      player.mute();
    }
  },
  unMute: (player) => {
    if (player && player.unMute) {
      player.unMute();
    }
  },
  isMuted: (player) => {
    if (player && player.isMuted) {
      return player.isMuted();
    }
    return false;
  },
  destroy: (player) => {
    if (player && player.destroy) {
      player.destroy();
    }
  },
};

// YouTube player states (for reference)
export const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// Default export for convenience
export default {
  loadYouTubeAPI,
  createYouTubePlayer,
  playerControls,
  PLAYER_STATES,
};