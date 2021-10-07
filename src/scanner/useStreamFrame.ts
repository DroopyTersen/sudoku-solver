import { useState } from "preact/hooks";
import useInterval from "../hooks/useInterval";
import captureImage from "./captureImage";
import { VideoStream } from "./useVideoStream";

const DEFAULT_INTERVAL = 30;

export function useStreamFrame(
  videoStream: VideoStream,
  interval = DEFAULT_INTERVAL
): ImageData {
  const [imageData, setImageData] = useState<ImageData>(null);
  useInterval(() => {
    if (videoStream?.ref?.current) {
      setImageData(captureImage(videoStream.ref.current));
    }
  }, interval);

  return imageData;
}
