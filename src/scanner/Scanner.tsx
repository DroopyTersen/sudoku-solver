import { useRef, useState } from "preact/hooks";
import useComponentSize from "../hooks/useComponentSize";
import { CanvasMode, WorkerConfig } from "../workers/processImage.types";
import { ARCanvas } from "./ARCanvas";
import { useProcessedData } from "./useProcessedData";
import { useStreamFrame } from "./useStreamFrame";
import useVideoStream from "./useVideoStream";

export function Scanner() {
  let [mode, setMode] = useState<CanvasMode>("original");
  const [blur, setBlur] = useState("20");
  const [threshold, setThreshold] = useState("30");
  let [config, setConfig] = useState<WorkerConfig>({
    blur: 20,
    threshhold: 14,
  });

  let containerRef = useRef<HTMLDivElement>(null);
  let containerSize = useComponentSize(containerRef);
  const videoStream = useVideoStream({ dimensions: containerSize });
  const frame = useStreamFrame(videoStream, 50);
  const processedData = useProcessedData(frame, {
    throttle: 100,
    mode,
    config: { blur: parseInt(blur, 10), threshhold: parseInt(threshold, 10) },
  });

  return (
    <div className="scanner" ref={containerRef}>
      <ARCanvas
        {...processedData}
        imageData={mode === "original" ? frame : processedData?.imageData}
      />
      <div className="knobs">
        <div>
          <label>
            Display
            <br />
            <select
              value={mode}
              onChange={(e) => setMode(e.currentTarget.value as CanvasMode)}
            >
              <option value="original">original</option>
              <option value="greyscale">greyscale</option>
              <option value="blur">blur</option>
              <option value="threshold">threshold</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Blur
            <br />
            <input
              type="number"
              inputMode="numeric"
              value={blur}
              onInput={(e) => {
                setBlur(e.currentTarget.value);
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Threshold
            <br />
            <input
              type="number"
              inputMode="numeric"
              value={threshold}
              onInput={(e) => {
                setThreshold(e.currentTarget.value);
              }}
            />
          </label>
        </div>
      </div>
      <video
        ref={videoStream.ref}
        playsInline
        muted
        width={100}
        height={100}
        style={{ opacity: 0 }}
      />
    </div>
  );
}
