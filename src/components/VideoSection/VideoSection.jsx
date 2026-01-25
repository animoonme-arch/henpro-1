"use client";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import "./VideoPlayer.css";

const LOCAL_STORAGE_KEY_PREFIX = "dplayer-last-watched-";

// --- Time formatting helper ---
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const format = (val) => String(val).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${format(minutes)}:${format(seconds)}`;
  }
  return `${format(minutes)}:${format(seconds)}`;
};

// =======================================================================
// 🔑 VIEW TRACKING: NEW HOOK DEFINITION
// =======================================================================

/**
 * Hook to send a single POST request to increment the view count.
 * Ensures the view is counted only once per contentKey per session.
 */
const useViewTracker = (contentKey) => {
  const isViewTracked = useRef(false);

  const trackView = useCallback(() => {
    // Only track if the contentKey is available and we haven't tracked it yet
    if (!contentKey || isViewTracked.current) return;

    // Set ref immediately to prevent subsequent calls
    isViewTracked.current = true;

    // Send request to your new view tracking API endpoint
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentKey }),
    })
      .then((res) => {
        if (!res.ok) {
          console.warn("View tracking failed on API side.");
        }
      })
      .catch((e) => {
        console.error("Failed to send view tracking request:", e);
      });
  }, [contentKey]);

  return { trackView };
};


// =======================================================================
// useWatchProgress Hook (Unchanged logic, just for completeness)
// =======================================================================

const useWatchProgress = (metadata, session) => {
  const {
    contentKey,
    title,
    totalDuration,
    poster,
    parentContentId,
    episodeNo,
  } = metadata;

  const isAuth = !!session?.user;
  const localStorageKey = LOCAL_STORAGE_KEY_PREFIX + contentKey;

  const getProgress = useCallback(async () => {
    if (!contentKey)
      return { currentTime: 0, totalDuration: totalDuration || 0 };

    if (isAuth) {
      try {
        const res = await fetch(`/api/progress?contentKey=${contentKey}`);
        if (res.ok) {
          const data = await res.json();
          return {
            currentTime: parseFloat(data.currentTime || 0),
            totalDuration: parseFloat(data.totalDuration || totalDuration || 0),
          };
        }
      } catch (e) {
        console.warn(
          "API progress retrieval failed. Falling back to local storage.",
          e
        );
      }
    }

    // --- Local Storage Fallback ---
    const localData = localStorage.getItem(localStorageKey);
    try {
      const data = JSON.parse(localData);
      return {
        currentTime: parseFloat(data?.currentTime || 0),
        totalDuration: parseFloat(data?.totalDuration || totalDuration || 0),
      };
    } catch (e) {
      return { currentTime: 0, totalDuration: totalDuration || 0 };
    }
  }, [isAuth, contentKey, localStorageKey, totalDuration]);

  const saveProgress = useCallback(
    (time) => {
      if (!contentKey || !title || !poster || !totalDuration) return;
      if (time < 5) return;

      const progressPayload = {
        contentKey,
        currentTime: time,
        totalDuration: totalDuration,
        title,
        poster,
        parentContentId,
        episodeNo,
      };

      if (isAuth) {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(progressPayload),
        }).catch((e) => console.error("Failed to save progress to DB:", e));
      } else {
        localStorage.setItem(localStorageKey, JSON.stringify(progressPayload));
      }
    },
    [
      isAuth,
      contentKey,
      localStorageKey,
      title,
      poster,
      parentContentId,
      totalDuration,
      episodeNo,
    ]
  );

  const clearProgress = useCallback(() => {
    if (!contentKey) return;

    if (isAuth) {
      fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentKey }),
      }).catch((e) => console.error("Failed to delete progress from DB:", e));
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [isAuth, contentKey, localStorageKey]);

  return { getProgress, saveProgress, clearProgress };
};


// =======================================================================
// CustomVideoPlayer Component
// =======================================================================

export default function CustomVideoPlayer({ metadata }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const { videoUrl, contentKey, title } = metadata;

  const { data: session } = useSession();
  const { getProgress, saveProgress, clearProgress } = useWatchProgress(
    metadata,
    session
  );

  // 🔑 VIEW TRACKING: Integrate tracker hook
  const { trackView } = useViewTracker(contentKey);


  // --- Player State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [skipFeedback, setSkipFeedback] = useState(null);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Seek Preview State
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPercent, setHoverPercent] = useState(0);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const formattedTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  let controlsTimeout = useRef(null);
  let skipTimeout = useRef(null);
  let doubleTapTimeout = useRef(null);

  const proxyUrl = useMemo(() => {
    if (!videoUrl) return null;
    return `/api/video?url=${encodeURIComponent(videoUrl)}`;
  }, [videoUrl]);

  // --- Core Player Controls ---
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((e) => console.error("Play failed:", e));
    }
    setIsPlaying(!isPlaying);
    setIsSettingsOpen(false);
  }, [isPlaying]);

  const seek = useCallback(
    (seconds) => {
      const video = videoRef.current;
      if (!video || !isReady) return;

      const newTime = Math.min(
        video.duration,
        Math.max(0, video.currentTime + seconds)
      );

      setSkipFeedback(seconds > 0 ? "forward" : "backward");
      if (skipTimeout.current) clearTimeout(skipTimeout.current);
      skipTimeout.current = setTimeout(() => setSkipFeedback(null), 800);

      video.currentTime = newTime;
      setCurrentTime(newTime);
      saveProgress(newTime);
    },
    [saveProgress, isReady]
  );

  const toggleFullScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullScreen) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.mozRequestFullScreen) container.mozRequestFullScreen();
      else if (container.webkitRequestFullscreen)
        container.webkitRequestFullscreen();
      else if (container.msRequestFullscreen) container.msRequestFullscreen();
    } else {
      if (typeof document !== "undefined" && document.exitFullscreen)
        typeof document !== "undefined" && document.exitFullscreen();
      else if (typeof document !== "undefined" && document.mozCancelFullScreen)
        typeof document !== "undefined" && document.mozCancelFullScreen();
      else if (typeof document !== "undefined" && document.webkitExitFullscreen)
        typeof document !== "undefined" && document.webkitExitFullscreen();
      else if (typeof document !== "undefined" && document.msExitFullscreen)
        typeof document !== "undefined" && document.msExitFullscreen();
    }
  }, [isFullScreen]);

  // --- Progress Bar Handlers with Seek Preview ---

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newProgress = parseFloat(e.target.value);
    setProgressPercent(newProgress);

    const newTime = (newProgress / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgress(newTime); // Save immediately after manual seek
    setIsSeeking(false); // End seeking/scrubbing
  };

  const handleProgressScrub = (e) => {
    const video = videoRef.current;
    if (!video) return;

    setIsSeeking(true); // Start seeking/scrubbing

    const newProgress = parseFloat(e.target.value);
    setProgressPercent(newProgress);

    // Update the actual video time on scrubbing
    const newTime = (newProgress / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);

    // Update CSS variable to show immediate progress change
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--progress-fill",
        `${newProgress}%`
      );
    }
  };

  const handleProgressHover = (e) => {
    const video = videoRef.current;
    const slider = e.currentTarget;
    if (!video || isSeeking) return;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));

    const time = (percent / 100) * video.duration;

    setHoverPercent(percent);
    setHoverTime(time);
  };

  const handleProgressLeave = () => {
    setHoverPercent(0);
    setHoverTime(0);
  };

  // --- Other Controls (Volume, Mute, Speed) ---

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      setIsSettingsOpen(false);
    }
  };

  // =======================================================================
  // 📸 NEW: Screenshot Logic
  // =======================================================================
  const takeScreenshot = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // 2. Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 3. Get the image data as a URL
    const dataURL = canvas.toDataURL('image/png'); // Can change to 'image/jpeg'

    // 4. Create a temporary link element for download
    const a = document.createElement('a');
    a.href = dataURL;

    // Create a filename based on the video title and current time
    const cleanTitle = (title || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timeStamp = formatTime(video.currentTime).replace(/:/g, '-');
    a.download = `${cleanTitle}_${timeStamp}.png`;

    // 5. Trigger the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`Screenshot taken at ${formatTime(video.currentTime)}`);
  }, [title]);


  // --- Advanced UX Events ---

  const handleVideoClick = useCallback(
    (e) => {
      if (e.target !== videoRef.current && e.target !== containerRef.current)
        return;
      togglePlay();
    },
    [togglePlay]
  );

  const handleVideoDoubleClick = useCallback(() => {
    toggleFullScreen();
  }, [toggleFullScreen]);

  const handleContainerClick = (e) => {
    if (screenWidth <= 600 || e.target !== containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;

    if (Math.abs(e.detail) === 2) return;

    const boundary = containerWidth * 0.25;

    if (clickX < boundary) {
      seek(-10);
    } else if (clickX > containerWidth - boundary) {
      seek(10);
    }
  };

  const handleTouchStart = useCallback(
    (e) => {
      if (screenWidth > 600) return;

      if (e.touches.length > 1) {
        if (doubleTapTimeout.current) clearTimeout(doubleTapTimeout.current);
        doubleTapTimeout.current = null;
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const containerWidth = rect.width;
      const boundary = containerWidth * 0.5;

      if (doubleTapTimeout.current === null) {
        doubleTapTimeout.current = setTimeout(() => {
          doubleTapTimeout.current = null;
          togglePlay();
        }, 300);
      } else {
        clearTimeout(doubleTapTimeout.current);
        doubleTapTimeout.current = null;

        if (touchX < boundary) {
          seek(-10);
        } else {
          seek(10);
        }
      }

      e.preventDefault();
    },
    [screenWidth, togglePlay, seek]
  );

  // --- Effects and Event Listeners (Unchanged) ---

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(
        (!!typeof document !== "undefined" && document.fullscreenElement) ||
        (!!typeof document !== "undefined" &&
          document.webkitFullscreenElement) ||
        (!!typeof document !== "undefined" &&
          document.mozFullScreenElement) ||
        (!!typeof document !== "undefined" && document.msFullscreenElement)
      );
    };

    typeof document !== "undefined" &&
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    typeof document !== "undefined" &&
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    typeof document !== "undefined" &&
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    typeof document !== "undefined" &&
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      typeof document !== "undefined" &&
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      typeof document !== "undefined" &&
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
      typeof document !== "undefined" &&
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullscreenChange
        );
      typeof document !== "undefined" &&
        document.removeEventListener(
          "MSFullscreenChange",
          handleFullscreenChange
        );
    };
  }, []);

  const handleLoadedMetadata = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsReady(true);
    setIsLoading(false);
    video.playbackRate = playbackSpeed;

    // ✅ Wait until duration is actually known
    const duration = await new Promise((resolve) => {
      if (isFinite(video.duration) && video.duration > 0) {
        return resolve(video.duration);
      }

      const onDuration = () => {
        if (isFinite(video.duration) && video.duration > 0) {
          video.removeEventListener("durationchange", onDuration);
          resolve(video.duration);
        }
      };

      video.addEventListener("durationchange", onDuration);
    });

    setDuration(duration);

    const lastTime = await getProgress();

    if (
      lastTime.currentTime > 5 &&
      lastTime.currentTime < duration - 5
    ) {
      video.currentTime = lastTime.currentTime;
    }

    // 🔑 Count view ONLY when metadata is valid
    trackView();
  }, [getProgress, playbackSpeed, trackView]);


  const lastUpdateRef = useRef(0);

  const handleTimeUpdate = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 250) return;
    lastUpdateRef.current = now;

    const video = videoRef.current;
    if (!video || !isReady) return;

    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) return;

    const time = video.currentTime;
    const percent = (time / duration) * 100;

    setCurrentTime(time);
    if (!isSeeking) setProgressPercent(percent);

    containerRef.current?.style.setProperty(
      "--progress-fill",
      `${Math.min(percent, 100)}%`
    );
  }, [isReady, isSeeking]);


  useEffect(() => {
    let saveInterval = null;
    if (isReady && isPlaying) {
      saveInterval = setInterval(() => {
        if (
          videoRef.current &&
          videoRef.current.currentTime > 0 &&
          !videoRef.current.ended
        ) {
          saveProgress(videoRef.current.currentTime);
        }
      }, 5000);
    }

    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isReady, isPlaying, saveProgress, contentKey]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    clearProgress();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgressPercent(0);
      containerRef.current.style.setProperty("--progress-fill", `0%`);
    }
  }, [clearProgress]);

  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) {
        setControlsVisible(false);
      }
    }, 3000);
  }, [isPlaying, isSettingsOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [handleMouseMove]);

  // --- Keyboard Shortcuts (Updated for 'p' key for PiP) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video || !isReady) return;

      if (
        (typeof document !== "undefined" &&
          document.activeElement?.tagName === "INPUT") ||
        (typeof document !== "undefined" &&
          document.activeElement?.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        toggleFullScreen();
      } else if (e.key === "i" || e.key === "I") {
        togglePictureInPicture();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault(); // Prevent potential browser save action
        takeScreenshot();
      } else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
      else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        seek(-10);
      }
      else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        seek(10);
      }
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newVolume = Math.min(1, volume + 0.1);
        video.volume = newVolume;
        setVolume(newVolume);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newVolume = Math.max(0, volume - 0.1);
        video.volume = newVolume;
        setVolume(newVolume);
      }
    };

    typeof document !== "undefined" &&
      document.addEventListener("keydown", handleKeyDown);

    return () => {
      typeof document !== "undefined" &&
        document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReady, togglePlay, toggleMute, toggleFullScreen, seek, volume, takeScreenshot]); // takeScreenshot added

  // Picture-in-Picture logic
  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (
      !video ||
      (!typeof document !== "undefined" && document.pictureInPictureEnabled)
    )
      return;

    if (typeof document !== "undefined" && document.pictureInPictureElement) {
      (await typeof document) !== "undefined" &&
        document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  };

  if (!proxyUrl) {
    return (
      <div
        className="video-player-container"
        style={{
          height: "100%",
          backgroundColor: "#111",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#888",
        }}
      >
        Video URL not available.
      </div>
    );
  }

  // --- Custom Player UI ---
  return (
    <div
      ref={containerRef}
      className={`custom-video-player ${isFullScreen ? "fullscreen" : ""} ${isPlaying ? "is-playing" : ""
        } ${controlsVisible ? "controls-visible" : "controls-hidden"}`}
      onDoubleClick={handleVideoDoubleClick}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
    >
      <video
        ref={videoRef}
        src={proxyUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={handleVideoClick}
        tabIndex={-1}
        className="video-element"
        preload="auto"
        crossOrigin="anonymous" // IMPORTANT: Allows canvas drawing for screenshot
        playsInline
      />
      {isLoading && (
        <div className="player-loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {/* Skip Feedback Overlay */}
      {skipFeedback && (
        <div className={`skip-feedback ${skipFeedback}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
            {skipFeedback === "backward" ? (
              <path d="M10 19l-7-7 7-7v14zm11-14H12v14h9z" />
            ) : (
              <path d="M14 5l7 7-7 7V5zM3 5h9v14H3z" />
            )}
          </svg>
          <span>10s</span>
        </div>
      )}

      {/* Transient Play/Pause Center Button */}
      {(!isPlaying || !controlsVisible) && (
        <div className="center-play-button" onClick={togglePlay}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="60" height="60">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      )}

      {/* --- Settings Menu --- */}
      <div className={`settings-menu ${isSettingsOpen ? "open" : ""}`}>
        <div className="setting-group">
          <div className="setting-label">Speed</div>
          <div className="setting-options">
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                className={`speed-button ${playbackSpeed === speed ? "active" : ""
                  }`}
                onClick={() => handleSpeedChange(speed)}
              >
                {speed === 1.0 ? "Normal" : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-group mt-3">
          <div className="setting-label">Quality (Placeholder)</div>
          <div className="setting-options">
            {["Auto", "1080p", "720p", "480p"].map((q) => (
              <button
                key={q}
                className={`quality-button ${q === "Auto" ? "active" : ""}`}
              // Placeholder functionality
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className={`player-controls ${controlsVisible ? "visible" : ""}`}
        onMouseEnter={() => {
          if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
          setControlsVisible(true);
        }}
        onMouseLeave={handleMouseMove}
      >
        {/* Seek Preview Tooltip */}
        <div
          className="seek-tooltip"
          style={{
            left: `${hoverPercent}%`,
            opacity: hoverPercent > 0 ? 1 : 0,
          }}
        >
          {formatTime(hoverTime)}
        </div>

        {/* Progress Bar (Range input) */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={progressPercent}
          onChange={handleProgressChange}
          onInput={handleProgressScrub}
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
          className="progress-slider"
        />

        <div className="controls-row">
          {/* Left Controls (Play/Pause, Skip, Volume, Time) */}
          <div className="controls-group">
            <button
              onClick={togglePlay}
              className="control-button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {/* Play/Pause SVG */}
              {isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            {/* Skip Backward 10s */}
            <button
              onClick={() => seek(-10)}
              className="control-button skip-button"
              aria-label="Skip backward 10 seconds"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 19l-9-7 9-7v14z" />
                <path d="M22 19l-9-7 9-7v14z" />
              </svg>
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={() => seek(10)}
              className="control-button skip-button"
              aria-label="Skip forward 10 seconds"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 19l9-7-9-7v14z" />
                <path d="M2 19l9-7-9-7v14z" />
              </svg>
            </button>

            <div className="volume-control">
              <button
                onClick={toggleMute}
                className="control-button volume-toggle"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {/* Mute SVG */}
                {isMuted || volume === 0 ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                aria-label="Volume slider"
              />
            </div>

            <span className="time-display">
              {formattedTime} / {formattedDuration}
            </span>
          </div>

          {/* Right Controls (Settings, Screenshot, PiP, Fullscreen) */}
          <div className="controls-group">
            {/* Settings Button */}
            <button
              className={`control-button settings-button ${isSettingsOpen ? "active" : ""
                }`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label="Settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            {/* 📸 NEW: Screenshot Button */}
            <button
              onClick={takeScreenshot}
              className="control-button sreen-sht"
              aria-label="Take screenshot (S)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>

            {/* PiP Button */}
            <button
              onClick={togglePictureInPicture}
              className="control-button pip-button"
              aria-label="Toggle Picture-in-Picture"
            >
              <svg
                viewBox="0 0 16 16" // <-- FIXED SIZE
                fill="currentColor" // <-- Using fill for glyphs
              >
                <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z" />
                <path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z" />
              </svg>
            </button>


            {/* Fullscreen Button */}
            <button
              onClick={toggleFullScreen}
              className="control-button"
              aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? (
                // Exit Fullscreen
                <svg
                  viewBox="0 0 16 16" // <-- FIXED SIZE
                  fill="currentColor" // <-- Using fill for glyphs
                >
                  <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                </svg>
              ) : (
                // Fullscreen
                <svg
                  viewBox="0 0 16 16" // <-- FIXED SIZE
                  fill="currentColor" // <-- Using fill for glyphs
                >
                  <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}