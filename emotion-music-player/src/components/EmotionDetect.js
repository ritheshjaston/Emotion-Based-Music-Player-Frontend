import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { styled } from '@mui/system';


const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
});

const StyledVideo = styled('video')({
  width: '60%',
  maxWidth: '600px',
  borderRadius: '50%',
});

const EmotionDetect = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [emotion, setEmotion] = useState('');
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
        } catch (error) {
          console.error('Error:', error);
        }
      }
      
      if (emotions.length > 10) {
        const maxEmotion = emotions.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});
        const mostFrequentEmotion= Object.keys(maxEmotion).reduce((a, b) => maxEmotion[a] > maxEmotion[b] ? a : b);
        console.log('Most frequently occurring emotion:', mostFrequentEmotion);
        setEmotion(mostFrequentEmotion);
        setLoading(false);
        navigate(`/music?emotion=${encodeURIComponent(mostFrequentEmotion)}`);
        
        // Stop the camera after emotion detection
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }else{
        setEmotion("Retry.. Your face is not visible correctly")
        setLoading(false);
      }
    };
    
    return (
        <Container>
            <h1>Emotion Detection</h1>
            <StyledVideo ref={videoRef} autoPlay />
            <br />
            <Button onClick={captureFrame} variant="contained" color="primary" disabled={loading}>{loading ? 'Loading...' : 'Capture Frame'}</Button>
            <p>Detected Emotion: {emotion}</p>
        </Container>
    );
};

export default EmotionDetect;
