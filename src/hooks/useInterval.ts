import { useState, useEffect, useRef } from "preact/hooks";

export default function useInterval(callback, delay) {
  const savedCallback = useRef<any>(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    let intervalId = null;
    if (delay > 0) {
      intervalId = setInterval(tick, delay);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [delay]);
}
