import { useState, useEffect } from 'react';

interface DublinClockProps {
  className?: string;
  prefix?: string;
}

/**
 * DublinClock Component
 *
 * Performance Optimization: Isolates the 1-second interval state to this leaf component.
 * Prevents the entire application from re-rendering every second.
 */
export default function DublinClock({ className = "", prefix = "" }: DublinClockProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-IE', {
        timeZone: 'Europe/Dublin',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setTime(formatter.format(now));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span className={className}>
      {prefix}{time || 'Updating...'}
    </span>
  );
}
