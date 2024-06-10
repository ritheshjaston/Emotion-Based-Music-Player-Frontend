import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmotionDetect from './components/EmotionDetect';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmotionDetect />}/>
        <Route path="/music" element={<MusicPlayer />}/>
      </Routes>
    </BrowserRouter>
  )
}
