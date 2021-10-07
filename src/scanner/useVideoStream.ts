import { RefObject } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const getStream = ({ width, height }): Promise<MediaStream> => {
  console.log("🚀 | { width, height }", { width, height });
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      width: { ideal: width },
      height: { ideal: height },
    },
    audio: false,
  });
};
export interface VideoStream {
  ref: RefObject<HTMLVideoElement>;
  stream: MediaStream;
  isPlaying: boolean;
  stop: () => void;
  width: number;
  height: number;
}

/** Start using the camera and pumping the camera feed into a video element */
export default function useVideoStream({ dimensions }): VideoStream {
  const videoRef = useRef<HTMLVideoElement>(null);
  let streamRef = useRef<MediaStream>(null);

  let [isPlaying, setIsPlaying] = useState(false);

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.removeEventListener("canplay", handleCanPlay);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && dimensions) {
      console.log("video is loaded");
      let doAsync = async () => {
        streamRef.current = await getStream(dimensions);
        video.addEventListener("canplay", handleCanPlay);
        video.srcObject = streamRef.current;
        video.play();
      };
      doAsync();
    }
  }, [dimensions]);

  const stop = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  return {
    ref: videoRef,
    stream: streamRef.current,
    isPlaying,
    stop,
    ...dimensions,
  };
}
