'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Client-side only rendering using dynamic import
const BinaualPlayer = dynamic(() => import('../components/BinaualPlayer'), {
  ssr: false,
});

// Frequency presets with carrier frequencies and descriptions
interface FrequencyPreset {
  name: string;
  frequency: number;
  carrierFrequency: number;
  description: string;
}

export default function Home() {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [baseFrequency, setBaseFrequency] = useState(200);
  const [beatFrequency, setBeatFrequency] = useState(7.83);
  const [volume, setVolume] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState<string>("Schumann Resonance");

  // Timer state
  const [timer, setTimer] = useState(10); // Default 10 minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Presets with descriptions
  const frequencyPresets: FrequencyPreset[] = [
    { name: "Delta Waves (Deep Sleep)", frequency: 2, carrierFrequency: 150, description: "Promotes deep sleep and recovery" },
    { name: "Theta Waves (Meditation)", frequency: 5, carrierFrequency: 180, description: "Deep relaxation and enhanced creativity" },
    { name: "Schumann Resonance", frequency: 7.83, carrierFrequency: 200, description: "Earth's resonance frequency, balance and harmony" },
    { name: "Alpha Waves (Relaxation)", frequency: 10, carrierFrequency: 220, description: "Creates relaxed focus state" },
    { name: "Beta Waves (Focus)", frequency: 15, carrierFrequency: 240, description: "Frequency suitable for high concentration" }
  ];

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      setIsPlaying(false);
      setTimerActive(false);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Play button handler
  const handlePlay = useCallback(() => {
    // Set audio initialization flag
    setAudioInitialized(true);
    
    // Timer settings
    if (!isPlaying && timer > 0) {
      setTimeRemaining(timer * 60); // Convert minutes to seconds
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
    
    // Toggle play state (with delay to ensure user interaction has been processed)
    setTimeout(() => {
      setIsPlaying(prevState => !prevState);
      console.log('Play state toggled');
    }, 100);
  }, [isPlaying, timer]);

  // Timer settings handler
  const handleTimerChange = (minutes: number) => {
    setTimer(minutes);
    if (!isPlaying) {
      setTimeRemaining(minutes * 60);
    }
  };

  // Preset selection (sets both carrier and beat frequencies)
  const selectPreset = (presetName: string) => {
    const preset = frequencyPresets.find(p => p.name === presetName);
    if (preset) {
      setBeatFrequency(preset.frequency);
      setBaseFrequency(preset.carrierFrequency);
      setSelectedPreset(presetName);
      console.log(`Preset changed: ${presetName}, Carrier: ${preset.carrierFrequency}Hz, Beat: ${preset.frequency}Hz`);
    }
  };

  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get description text for current preset
  const getCurrentPresetDescription = () => {
    const preset = frequencyPresets.find(p => p.name === selectedPreset);
    return preset?.description || '';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Binaural Beats Meditation</h1>
        
        {/* Player controls */}
        <div className="mb-8 text-center">
          <div className="text-5xl font-mono mb-4">
            {timerActive ? formatTime(timeRemaining) : formatTime(timer * 60)}
          </div>
          
          <button
            onClick={handlePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } transition-colors`}
          >
            {isPlaying ? '■' : '▶'}
          </button>
          
          <p className="mt-3 text-sm text-blue-300">{getCurrentPresetDescription()}</p>
        </div>

        {/* Frequency presets - positioned prominently */}
        <div className="mb-6">
          <h2 className="text-xl mb-2">Presets</h2>
          <div className="grid grid-cols-1 gap-2">
            {frequencyPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => selectPreset(preset.name)}
                className={`py-2 px-4 rounded text-left ${
                  selectedPreset === preset.name
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                disabled={isPlaying}
              >
                {preset.name} ({preset.frequency} Hz)
              </button>
            ))}
          </div>
        </div>

        {/* Frequency settings */}
        <div className="mb-6">
          <h2 className="text-xl mb-2">Advanced Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Carrier Frequency: {baseFrequency} Hz</label>
            <input
              type="range"
              min="100"
              max="300"
              step="1"
              value={baseFrequency}
              onChange={(e) => {
                setBaseFrequency(Number(e.target.value));
                setSelectedPreset('Custom'); // Clear preset selection when using custom settings
              }}
              className="w-full"
              disabled={isPlaying}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Beat Frequency: {beatFrequency.toFixed(2)} Hz</label>
            <input
              type="range"
              min="0.5"
              max="30"
              step="0.1"
              value={beatFrequency}
              onChange={(e) => {
                setBeatFrequency(Number(e.target.value));
                setSelectedPreset('Custom'); // Clear preset selection when using custom settings
              }}
              className="w-full"
              disabled={isPlaying}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Timer: {timer} minutes</label>
            <div className="flex justify-between gap-2">
              {[5, 10, 15, 20, 30].map((min) => (
                <button
                  key={min}
                  onClick={() => handleTimerChange(min)}
                  className={`flex-1 py-1 rounded ${
                    timer === min
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  disabled={isPlaying}
                >
                  {min}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio processing component */}
      {typeof window !== 'undefined' && audioInitialized && (
        <BinaualPlayer
          baseFrequency={baseFrequency}
          beatFrequency={beatFrequency}
          isPlaying={isPlaying}
          volume={volume}
        />
      )}

      <footer className="mt-8 text-sm text-gray-400">
        <p>Use headphones for optimal experience.</p>
        <p className="mt-1">Note: If you can't hear anything, check your volume and press the play button.</p>
      </footer>
    </main>
  );
} 