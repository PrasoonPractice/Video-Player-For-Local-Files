import { useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { BiPlay, BiSkipNext, BiSkipPrevious, BiPause, BiFullscreen, BiExitFullscreen, BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { TbRewindBackward5, TbRewindForward10  } from "react-icons/tb";
import { RiSettings6Line } from "react-icons/ri";
import { PiPictureInPictureBold } from "react-icons/pi";
import "./videoPlayer.css";
import { Padding } from "@mui/icons-material";

const video = '/assets/EP001.mkv';

function VideoPlayer({videoRef, changeVideo, isLight}) {
  const playerContainerRef = useRef(null);
  const settingsRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("--:--");
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [duration, setDuration] = useState("--:--");
  const [durationSec, setDurationSec] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(100);
  const [lastVolume, setLastVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef(null);
  const [showControlsContainer, setShowControlsContainer] = useState(true);
  const timeoutRef = useRef(null);
  const keepVisibleRef = useRef(false);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    const updateDuration = () => {
      const durationInSeconds = videoElement.duration;
      setDurationSec(durationInSeconds);
      setDuration(formatTime(durationInSeconds));
    };

    const updateCurrentTime = () => {
      const currentTimeInSeconds = videoElement.currentTime;
      setCurrentTimeSec(currentTimeInSeconds);
      setCurrentTime(formatTime(currentTimeInSeconds));
    };

    videoElement.addEventListener("loadedmetadata", updateDuration);
    videoElement.addEventListener("timeupdate", updateCurrentTime);

    return () => {
      videoElement.removeEventListener("loadedmetadata", updateDuration);
      videoElement.removeEventListener("timeupdate", updateCurrentTime);
    };
  }, [videoRef]);

  const hideControlsContainer = () => {
    // Clear any existing timeout to avoid stacking them
    clearTimeout(timeoutRef.current);
  
    timeoutRef.current = setTimeout(() => {
      if (!keepVisibleRef.current) {
        setShowControlsContainer(false);
      }
    }, 2000); // Adjust delay as needed
  };
  
  const showControls = () => {
    // Clear any existing timeout
    clearTimeout(timeoutRef.current);
  
    // Show the controls
    setShowControlsContainer(true);
    keepVisibleRef.current = true;
  
    // Set timeout to hide controls after a delay
    hideControlsContainer();
  
    // Reset `keepVisibleRef` after a small delay to allow toggling
    setTimeout(() => {
      keepVisibleRef.current = false;
    }, 2000); // Adjust delay as needed
  };

  const handleUserActivity = () => {
    videoRef.current.paused ?
    setShowControlsContainer(true) : showControls();
  };

  const handlePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setShowControlsContainer(true);
      clearTimeout(timeoutRef.current);
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setShowControlsContainer(false);
      setIsPlaying(true);
    }
  };

  const handleFullScreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
      playerContainerRef.current.classList.remove('fullscreen');
    } else {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if (playerContainerRef.current.mozRequestFullScreen) { // Firefox
        playerContainerRef.current.mozRequestFullScreen();
      } else if (playerContainerRef.current.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        playerContainerRef.current.webkitRequestFullscreen();
      } else if (playerContainerRef.current.msRequestFullscreen) { // IE/Edge
        playerContainerRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
      playerContainerRef.current.classList.add('fullscreen'); 
    }
  };

  const handlePictureInPicture = async () => {
    if (isPip) {
      document.exitPictureInPicture();
      setIsPip(false);
    } else {
      try {
        await videoRef.current.requestPictureInPicture();
        setIsPip(true);
      } catch (error) {
        console.error("Failed to enter Picture-in-Picture mode", error);
      }
    }
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handlePlaybackRateChange = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleClickOutside = (event) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target)) {
      setShowSettings(false);
    }
    if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target) && !event.target.classList.contains("volumeButton")) {
      setShowVolumeSlider(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    videoRef.current.volume = newVolume / 100;
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    resetVolumeSliderTimeout();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(lastVolume);
      videoRef.current.volume = lastVolume / 100;
      setIsMuted(false);
    } else {
      setLastVolume(volume);
      setVolume(0);
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
    resetVolumeSliderTimeout();
  };

  const resetVolumeSliderTimeout = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 1000);
  };

  const showVolumeSliderAndResetTimeout = () => {
    // setShowVolumeSlider(true);
    resetVolumeSliderTimeout();
  };

  useEffect(() =>{
    const hoverShow = () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      setShowVolumeSlider(true);
    }
    document.getElementById("volumeButton").addEventListener("mouseenter",hoverShow);
    document.getElementById("volumeButton").addEventListener("mousemove",hoverShow);
    volumeSliderRef.current.addEventListener("mouseenter",hoverShow);
    volumeSliderRef.current.addEventListener("mousemove",hoverShow);

    return () => {
      document.getElementById("volumeButton").removeEventListener("mouseenter",hoverShow);
      document.getElementById("volumeButton").removeEventListener("mousemove",hoverShow);
      volumeSliderRef.current.removeEventListener("mouseenter",hoverShow);
      volumeSliderRef.current.removeEventListener("mousemove",hoverShow);

    }

  }, [showVolumeSlider]);

  useEffect(() => {
    // const videoElement = document.getElementById("videoPlayer");
    const handleKeyDown = (e) => {
        e.stopPropagation();
        console.log("videoPlayer");
        switch (e.key) {
          case ' ':
            e.preventDefault();
            handlePlay();
            break;
          case 'ArrowRight':
            // console.log("from->",videoRef.current.currentTime);
            e.preventDefault();
            videoRef.current.currentTime += 10;
            // console.log("to ->",videoRef.current.currentTime);
            break;
          case 'ArrowLeft':
            // console.log("from->",videoRef.current.currentTime);
            e.preventDefault();
            videoRef.current.currentTime -= 5;
            // console.log("to ->",videoRef.current.currentTime);
            break;
          case 'm':
            handleToggleMute();
            break;
          case 'ArrowUp': {
            e.preventDefault();
            const newVolume = Math.min(volume + 5, 100);
            setVolume(newVolume);
            videoRef.current.volume = newVolume / 100;
            setIsMuted(false);
            break;
          }
          case 'ArrowDown': {
            e.preventDefault();
            const newVolume = Math.max(volume - 5, 0);
            setVolume(newVolume);
            videoRef.current.volume = newVolume / 100;
            if (newVolume === 0) {
              setIsMuted(true);
            }
            break;
          }
          case 'i':
            handlePictureInPicture();
            break;
          case 'f':
            handleFullScreen();
            break;
          case 'n':
            changeVideo(1);
            break;
          case 'p':
            changeVideo(-1);
            break;
          default:
            break;
        }
      // }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, volume, videoRef, changeVideo]);

  useEffect(() => {
    const videoElement = document.getElementById("playerRoot");
    
    videoElement.addEventListener("mousemove", handleUserActivity);
    videoElement.addEventListener("click", handleUserActivity);
    videoElement.addEventListener("keypress", handleUserActivity);
  
    return () => {
      videoElement.removeEventListener("mousemove", handleUserActivity);
      videoElement.removeEventListener("click", handleUserActivity);
      videoElement.removeEventListener("keypress", handleUserActivity);
    };
  }, []);

  return (
    <div id="videoPlayer" className={`container video-player ${isLight ? 'light-mode' : ''}`}>
      <div id="playerRoot" className="playerContainer" ref={playerContainerRef}>
        <video id="player" className="videoPlayer" ref={videoRef} src={video}></video>
        <div className="onVidClick" onClick={handlePlay}></div>
        <div className={`controlsContainer ${showControlsContainer ? '' : 'notDisplayed'}`}>
          <div className="controls">

            <div className="controlsLeft">
              <button className="controlButton" onClick={() => changeVideo(-1)} style={{ position: "relative", top: "2px" }}>
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  <BiSkipPrevious />
                </IconContext.Provider>
              </button>
              {isPlaying ? (
                <button className="controlButton" onClick={handlePlay} style={{ position: "relative", top: "2px" }}>
                  <IconContext.Provider value={{ color: "white", size: "2em" }}>
                    <BiPause />
                  </IconContext.Provider>
                </button>
              ) : (
                <button className="controlButton" onClick={handlePlay} style={{ position: "relative", top: "2px" }}>
                  <IconContext.Provider value={{ color: "white", size: "2em" }}>
                    <BiPlay />
                  </IconContext.Provider>
                </button>
              )}
              <button className="controlButton" onClick={() => changeVideo(1)} style={{ position: "relative", top: "2px" }}>
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  <BiSkipNext />
                </IconContext.Provider>
              </button>

              <button className="controlButton" onClick={() => videoRef.current.currentTime -= 5} style={{ position: "relative", top: "2px" }}>
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  <TbRewindBackward5 />
                </IconContext.Provider>
              </button>

              <button className="controlButton" onClick={() => videoRef.current.currentTime += 10} style={{ position: "relative", top: "2px" }}>
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  <TbRewindForward10  />
                </IconContext.Provider>
                </button>

              <button
                id="volumeButton"
                className="controlButton volumeButton"
                onClick={handleToggleMute}
                onMouseLeave={showVolumeSliderAndResetTimeout}
                style={{ position: "relative", top: "2px" }}
              >
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  {isMuted ? <BiVolumeMute /> : <BiVolumeFull />}
                </IconContext.Provider>
              </button>
            </div>
            <div className="controlsCenter" >
              <div
                  className={`volumeSliderContainer ${showVolumeSlider ? 'show' : ''}`}
                  ref={volumeSliderRef}
                  onMouseLeave={showVolumeSliderAndResetTimeout}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    className="volumeSlider"
                    onMouseEnter={() =>{setShowVolumeSlider(true)}}
                    onMouseLeave={showVolumeSliderAndResetTimeout}
                    onChange={handleVolumeChange}
                  />
              </div>

            <div className="duration" style={{ position: "relative", top: "2px" }}>
              {currentTime} / {duration}
            </div>
            </div>
            <div className="controlsRight">
              
              <button className="controlButton" onClick={handlePictureInPicture}>
                <IconContext.Provider value={{ color: "white", size: "2em" }}>
                  <PiPictureInPictureBold />
                </IconContext.Provider>
              </button>
              <div className="settingsContainer" ref={settingsRef}>
                <button className="controlButton" onClick={handleSettings}>
                  <IconContext.Provider value={{ color: "white", size: "2em" }} style={{Padding: "4px 0px 0px 0px"}}>
                    <RiSettings6Line />
                  </IconContext.Provider>
                </button>
                {showSettings && (
                  <div className="settingsMenu">
                    <button onClick={() => handlePlaybackRateChange(0.25)}>0.25x</button>
                    <button onClick={() => handlePlaybackRateChange(0.5)}>0.5x</button>
                    <button onClick={() => handlePlaybackRateChange(0.75)}>0.75x</button>
                    <button onClick={() => handlePlaybackRateChange(1)}>Normal</button>
                    <button onClick={() => handlePlaybackRateChange(1.25)}>1.25x</button>
                    <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
                    <button onClick={() => handlePlaybackRateChange(1.75)}>1.75x</button>
                    <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
                  </div>
                )}
              </div>
              {isFullScreen ? (
                <button className="controlButton" onClick={handleFullScreen}>
                  <IconContext.Provider value={{ color: "white", size: "2em" }}>
                    <BiExitFullscreen />
                  </IconContext.Provider>
                </button>
              ) : (
                <button className="controlButton" onClick={handleFullScreen}>
                  <IconContext.Provider value={{ color: "white", size: "2em" }}>
                    <BiFullscreen />
                  </IconContext.Provider>
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={durationSec}
            value={currentTimeSec}
            className="timeline"
            onChange={(e) => {
              videoRef.current.currentTime = e.target.value;
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
