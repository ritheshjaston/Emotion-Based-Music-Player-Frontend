import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Slider,
  IconButton,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp } from "@mui/icons-material";
import { styled, keyframes } from "@mui/system";
import "./MusicPlayer.css"; // Import the CSS file

const MusicPlayerContainer = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  height: "100vh",
  background: "linear-gradient(135deg, #1a237e 30%, #b3e5fc 90%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
}));

const EmojiContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  flex: "1 0 auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const Emoji = styled("img")(({ theme }) => ({
  width: "150px",
  height: "150px",
  animation: `${keyframes({
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  })} 2s infinite`,
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
  color: "#fff",
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  animation: `${keyframes({
    "0%": { opacity: 0, transform: "translateY(-20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  })} 1s ease-in-out`,
}));

const MusicPlayer = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const detectedEmotion = searchParams.get("emotion");
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1); // Default volume (1 is 100%)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const emotionsToSongs = {
    Happy: ["/songs/Happy/happy_song1.mp3", "/songs/Happy/happy_song2.mp3"],
    Sad: ["/songs/Sad/sad_song1.mp3", "/songs/Sad/sad_song2.mp3"],
    Surprise: ["/songs/Sad/sad_song1.mp3", "/songs/Sad/sad_song2.mp3"],
    Angry: ["/songs/Angry/angry_song1.mp3", "/songs/Angry/angry_song2.mp3"],
    Disgust: ["/songs/Angry/angry_song1.mp3", "/songs/Angry/angry_song2.mp3"],
    Neutral: ["/songs/Angry/angry_song1.mp3", "/songs/Angry/angry_song2.mp3"],
    Fear: ["/songs/Angry/angry_song1.mp3", "/songs/Angry/angry_song2.mp3"],
  };

  const emojis = {
    Sad: "/Emojis/sad.gif",
    Happy: "/Emojis/happy.gif",
    Angry: "/Emojis/angry.gif",
    Disgust: "/Emojis/disgust.gif",
    Neutral: "/Emojis/Neutral.gif",
    Surprise: "/Emojis/surprise.gif",
    Fear: "/Emojis/fear.gif",
  };

  const playSongForEmotion = (emotion) => {
    const songUrls = emotionsToSongs[emotion];
    if (songUrls && songUrls.length > 0) {
      const randomIndex = Math.floor(Math.random() * songUrls.length);
      setPlaylist(songUrls);
      setCurrentIndex(randomIndex);
      setCurrentSong(songUrls[randomIndex]);
      audioRef.current.src = songUrls[randomIndex];
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playMusic = () => {
    if (audioRef.current.paused && audioRef.current.readyState === 4) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseMusic = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextSong = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
      setCurrentSong(playlist[nextIndex]);
      audioRef.current.src = playlist[nextIndex];
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const previousSong = () => {
    if (playlist.length > 0) {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentIndex(prevIndex);
      setCurrentSong(playlist[prevIndex]);
      audioRef.current.src = playlist[prevIndex];
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(progress);
  };

  const handleSeek = (event, newValue) => {
    const seekTime = (newValue / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  useEffect(() => {
    if (detectedEmotion) {
      playSongForEmotion(detectedEmotion);
    }
  }, [detectedEmotion]);

  return (
    <MusicPlayerContainer>
      <Title variant="h4" gutterBottom>
        Feel the Music
      </Title>
      <EmojiContainer>
        <Emoji
          src={emojis[detectedEmotion] || "/Emojis/Neutral.gif"}
          alt="Emotion Emoji"
        />
      </EmojiContainer>
      <Typography variant="h6" color="white" gutterBottom>
        {detectedEmotion}
      </Typography>
      <Paper elevation={3} sx={{ padding: 2, width: isMobile ? "90%" : "60%", marginBottom: theme.spacing(2) }}>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}>
          <source src={currentSong} type="audio/mp3" />
        </audio>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <VolumeUp />
          </Grid>
          <Grid item xs>
            <Slider
              value={volume * 100}
              onChange={handleVolumeChange}
              aria-labelledby="volume-slider"
              min={0}
              max={100}
            />
          </Grid>
        </Grid>
        <Slider
          value={progress}
          onChange={handleSeek}
          aria-labelledby="progress-slider"
          min={0}
          max={100}
          sx={{ mt: 2 }}
        />
        <ControlsContainer>
          <IconButton onClick={previousSong} color="primary">
            <SkipPrevious />
          </IconButton>
          {isPlaying ? (
            <IconButton onClick={pauseMusic} color="primary">
              <Pause />
            </IconButton>
          ) : (
            <IconButton onClick={playMusic} color="primary">
              <PlayArrow />
            </IconButton>
          )}
          <IconButton onClick={nextSong} color="primary">
            <SkipNext />
          </IconButton>
        </ControlsContainer>
      </Paper>
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
