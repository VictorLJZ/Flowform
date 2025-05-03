"use client"

import { useState, useEffect } from 'react'

// Animated typing component for section title
export function TypedTitle({ baseTitle, endings }: { baseTitle: string; endings: string[] }) {
  const [displayText, setDisplayText] = useState(baseTitle);
  const [ending, setEnding] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting' | 'pauseBeforeNext'>('typing');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Handle cursor blinking
  useEffect(() => {
    const id = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    
    return () => clearInterval(id);
  }, []);
  
  // Handle text animation
  useEffect(() => {
    // Init state if needed
    if (ending === "" && phase === 'typing') {
      setEnding(endings[currentIndex]);
      return;
    }
    
    let timerId: number;
    
    if (phase === 'typing') {
      if (displayText.length < baseTitle.length + ending.length) {
        // Still typing
        timerId = window.setTimeout(() => {
          const nextPosition = displayText.length - baseTitle.length;
          const nextChar = ending[nextPosition];
          setDisplayText(prev => prev + nextChar);
        }, 120);
      } else {
        // Finished typing, pause
        timerId = window.setTimeout(() => {
          setPhase('pause');
        }, 2000);
      }
    } 
    else if (phase === 'pause') {
      // Start deleting
      timerId = window.setTimeout(() => {
        setPhase('deleting');
      }, 300);
    } 
    else if (phase === 'deleting') {
      if (displayText.length > baseTitle.length) {
        // Still deleting
        timerId = window.setTimeout(() => {
          setDisplayText(prev => prev.substring(0, prev.length - 1));
        }, 60);
      } else {
        // Finished deleting, prepare for next word
        timerId = window.setTimeout(() => {
          setPhase('pauseBeforeNext');
        }, 300);
      }
    } 
    else if (phase === 'pauseBeforeNext') {
      // Move to next word
      timerId = window.setTimeout(() => {
        const nextIndex = (currentIndex + 1) % endings.length;
        setCurrentIndex(nextIndex);
        setEnding(endings[nextIndex]);
        setPhase('typing');
      }, 300);
    }
    
    return () => clearTimeout(timerId);
  }, [baseTitle, displayText, ending, endings, currentIndex, phase]);

  return (
    <span className="inline-block">
      {displayText}
      <span className={`inline-block ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity ml-[1px] -mr-[1px]`}>|</span>
    </span>
  );
}