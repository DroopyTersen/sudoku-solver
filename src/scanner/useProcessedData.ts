import { useEffect, useRef, useState } from "preact/hooks";
import AsyncWorker from "../utils/AsyncWorker";
import { wait } from "../utils/utils";
// import { wait } from "../utils/utils";
import {
  CanvasMode,
  ProcessedData,
  WorkerConfig,
} from "../workers/processImage.types";
import ProcessImageWorker from "../workers/processImage.worker?worker";
const worker = new ProcessImageWorker();
interface Options {
  throttle?: number;
  mode?: CanvasMode;
  config?: WorkerConfig;
}
const DEFAULT_THROTTLE = 500;
export function useProcessedData(
  imageData: ImageData,
  {
    mode = "original",
    throttle = DEFAULT_THROTTLE,
    config: { blur, threshhold },
  }: Options
) {
  // let workerRef = useRef<Worker>(new ProcessImageWorker());
  let isBusyRef = useRef(false);
  let [processed, setProcessed] = useState<ProcessedData>(null);

  useEffect(() => {
    worker.onmessage = (event) => {
      isBusyRef.current = false;
      setProcessed(event.data);
    };
    worker.onerror = (event: ErrorEvent) => {
      console.error("Worker Error", event);
      isBusyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isBusyRef.current || !imageData) return;
    const doAsync = async () => {
      await wait(throttle);
      worker.postMessage({
        imageData,
        mode,
        config: {
          blur,
          threshhold,
        },
      });
    };
    isBusyRef.current = true;
    doAsync();
  }, [imageData, blur, threshhold]);

  return processed;
}
