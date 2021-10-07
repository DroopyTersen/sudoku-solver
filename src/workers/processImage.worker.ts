import {
  CornerPoints,
  GridLines,
  ProcessedData,
  WorkerConfig,
  WorkerMessage,
} from "./processImage.types";
import { boxBlur } from "./boxBlur";
import { applyThreshold } from "./threshold";
import { convertToGreyscale } from "./greyscale";
import { getLargestConnectedRegion } from "./connectedRegions";
import { checkIsSquare, getCornerPoints } from "./corners";
import findHomographicTransform, { createGridLines } from "./homography";

const PROCESSING_SIZE = 900;
const DEFAULT_OPTIONS: WorkerConfig = {
  blur: 24,
  threshhold: 16,
};
onmessage = async function (e) {
  let { imageData, mode }: WorkerMessage = e.data;
  let config: WorkerConfig = { ...DEFAULT_OPTIONS, ...e?.data?.config };
  let corners: CornerPoints = null;
  let gridLines: GridLines = null;
  let greyscaleBytes = convertToGreyscale(imageData);
  let blurredBytes = boxBlur(
    { bytes: greyscaleBytes, width: imageData.width, height: imageData.height },
    config.blur
  );
  let thresholdBytes = applyThreshold(
    greyscaleBytes,
    blurredBytes,
    imageData.width,
    imageData.height,
    config.threshhold
  );

  let largestConnectedComponent = getLargestConnectedRegion(
    {
      bytes: thresholdBytes,
      width: imageData.width,
      height: imageData.height,
    },
    {
      // Sudoku should be roughly a square but allow slop for perspective
      minAspectRatio: 0.6,
      maxAspectRatio: 1.5,
      // Sudoku should take up at least a third of the image
      minSize: Math.min(imageData.width, imageData.height) * 0.3,
      // Sudoku should be within the bounds of the image
      maxSize: Math.min(imageData.width, imageData.height) * 0.95,
    }
  );
  if (largestConnectedComponent) {
    corners = getCornerPoints(largestConnectedComponent);
    if (checkIsSquare(corners)) {
      const transform = findHomographicTransform(PROCESSING_SIZE, corners);
      gridLines = createGridLines(transform, PROCESSING_SIZE);
    }
  }

  let result: ProcessedData = {
    imageData,
    corners,
    gridLines,
  };

  if (mode !== "original") {
    let bytes;
    if (mode === "greyscale") bytes = greyscaleBytes;
    else if (mode === "blur") bytes = blurredBytes;
    else if (mode === "threshold") bytes = thresholdBytes;

    result.imageData = toImageData(bytes, imageData.width, imageData.height);
  }

  this.self.postMessage(result);
};

export function toImageData(
  bytes: Uint8ClampedArray,
  width: number,
  height: number
) {
  const imageData = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const value = bytes[row + x];
      imageData.data[(row + x) * 4] = value;
      imageData.data[(row + x) * 4 + 1] = value;
      imageData.data[(row + x) * 4 + 2] = value;
      imageData.data[(row + x) * 4 + 3] = 255;
    }
  }
  return imageData;
}
