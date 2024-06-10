import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'url(https://unsplash.com/photos/x9I-6yoXrXE/download?force=true&w=1920) no-repeat center center fixed',
  backgroundSize: 'cover',
  padding: '20px',
  boxSizing: 'border-box',
  [theme.breakpoints.down('md')]: {
    padding: '10px',
    height: 'auto',
  },
}));

const videoBorderAnimation = keyframes`
  0% {
    border-color: transparent;
  }
  50% {
    border-color: #3f51b5;
  }
  100% {
    border-color: transparent;
  }
`;

const StyledVideoContainer = styled('div')(({ theme, loading }) => ({
  position: 'relative',
  width: '60%',
  maxWidth: '600px',
  borderRadius: '15px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    width: '90%',
  },
  '& video': {
    width: '100%',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '15px',
    border: '4px solid transparent',
    animation: loading ? `${videoBorderAnimation} 1.5s infinite` : 'none',
  },
}));

const CaptureButton = styled(Button)({
  marginTop: '20px',
});

const EmotionText = styled(Typography)(({ theme }) => ({
  marginTop: '20px',
  color: '#fff',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

const titleAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  animation: `${titleAnimation} 1s ease-in-out`,
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const EmotionDetect = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [emotion, setEmotion] = useState('');
    const [recentemotion, setRecentEmotion] = useState('');
    const [loading, setLoading] = useState(false);
    const mediaStreamRef = useRef(null);

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                mediaStreamRef.current = stream; // Save the stream reference
            } catch (error) {
                console.error('Error accessing webcam: ', error);
            }
        };

        getUserMedia();

        // Cleanup function to stop the media stream
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureFrame = async () => {
        setEmotion("");
        setLoading(true);
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        const emotions = [];

        for (let i = 0; i < 20; i++) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = canvas.toDataURL('image/jpeg');
            await new Promise(resolve => setTimeout(resolve, 400)); // Using setTimeout with async/await
            try {
                const response = await fetch('http://127.0.0.1:5000/detect_emotion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ frame: frame.split(',')[1] })
                });
                const data = await response.json();
                emotions.push(data.emotion);
                setRecentEmotion(data.emotion);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        if (emotions.length > 15) {
            const maxEmotion = emotions.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            const mostFrequentEmotion = Object.keys(maxEmotion).reduce((a, b) => maxEmotion[a] > maxEmotion[b] ? a : b);
            console.log('Most frequently occurring emotion:', mostFrequentEmotion);
            setEmotion(mostFrequentEmotion);
            setLoading(false);
            navigate(`/music?emotion=${encodeURIComponent(mostFrequentEmotion)}`);

            // Stop the camera after emotion detection
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        } else {
            setEmotion("Retry.. Your face is not visible correctly");
            setLoading(false);
        }
    };

    return (
        <Container>
            <AnimatedTitle variant="h3" component="h1" gutterBottom>
                Emotion Detection
            </AnimatedTitle>
            <StyledVideoContainer loading={loading}>
                <video ref={videoRef} autoPlay />
            </StyledVideoContainer>
            <EmotionText>{recentemotion}</EmotionText>
            <CaptureButton 
                onClick={captureFrame} 
                variant="contained" 
                color="primary" 
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Capture Frame'}
            </CaptureButton>
            <EmotionText>Detected Emotion: {emotion}</EmotionText>
        </Container>
    );
};

export default EmotionDetect;
