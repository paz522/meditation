import { useState, useEffect, useRef } from 'react';

interface BinaualPlayerProps {
  baseFrequency: number;
  beatFrequency: number;
  isPlaying: boolean;
  volume: number;
}

const BinaualPlayer: React.FC<BinaualPlayerProps> = ({
  baseFrequency,
  beatFrequency,
  isPlaying,
  volume
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Initialize AudioContext only after play button is pressed
  useEffect(() => {
    // Initialize only after user interaction (play button press)
    if (isPlaying && !initializedRef.current) {
      try {
        // Create AudioContext
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        console.log('AudioContext initialized:', audioContextRef.current.state);
        
        // Create oscillators
        oscillatorLeftRef.current = audioContextRef.current.createOscillator();
        oscillatorRightRef.current = audioContextRef.current.createOscillator();
        
        // Set frequencies
        oscillatorLeftRef.current.frequency.value = baseFrequency;
        oscillatorRightRef.current.frequency.value = baseFrequency + beatFrequency;
        
        // Create gain node and set volume
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = volume;
        
        // Create channel merger (for stereo output)
        mergerRef.current = audioContextRef.current.createChannelMerger(2);
        
        // Set up connections
        oscillatorLeftRef.current.connect(mergerRef.current, 0, 0);
        oscillatorRightRef.current.connect(mergerRef.current, 0, 1);
        mergerRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        // Start oscillators
        oscillatorLeftRef.current.start();
        oscillatorRightRef.current.start();
        
        // Set initialization flag
        initializedRef.current = true;
        
        console.log('Audio system fully initialized and started');
      } catch (error) {
        console.error('Error initializing audio system:', error);
      }
    }

    return () => {
      // Clean up when component unmounts
      if (!isPlaying && initializedRef.current) {
        try {
          if (oscillatorLeftRef.current) {
            oscillatorLeftRef.current.stop();
            oscillatorLeftRef.current.disconnect();
            oscillatorLeftRef.current = null;
          }
          if (oscillatorRightRef.current) {
            oscillatorRightRef.current.stop();
            oscillatorRightRef.current.disconnect();
            oscillatorRightRef.current = null;
          }
          if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
          }
          if (mergerRef.current) {
            mergerRef.current.disconnect();
            mergerRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          initializedRef.current = false;
          console.log('Audio system cleaned up');
        } catch (error) {
          console.error('Error cleaning up audio system:', error);
        }
      }
    };
  }, [isPlaying]);

  // Update frequencies
  useEffect(() => {
    if (initializedRef.current && oscillatorLeftRef.current && oscillatorRightRef.current) {
      try {
        // Left channel: base frequency
        oscillatorLeftRef.current.frequency.value = baseFrequency;
        // Right channel: base frequency + beat frequency
        oscillatorRightRef.current.frequency.value = baseFrequency + beatFrequency;
        console.log(`Frequencies updated: L=${baseFrequency}Hz, R=${baseFrequency + beatFrequency}Hz`);
      } catch (error) {
        console.error('Error updating frequencies:', error);
      }
    }
  }, [baseFrequency, beatFrequency]);

  // Update volume
  useEffect(() => {
    if (initializedRef.current && gainNodeRef.current) {
      try {
        // Set volume
        gainNodeRef.current.gain.value = isPlaying ? volume : 0;
        console.log(`Volume set to ${isPlaying ? volume : 0}`);
      } catch (error) {
        console.error('Error updating volume:', error);
      }
    }
  }, [isPlaying, volume]);

  // No visible rendering
  return null;
};

export default BinaualPlayer; 