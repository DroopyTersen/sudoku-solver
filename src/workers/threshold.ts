import { boxBlur } from "./boxBlur";

export function applyThreshold(
  greyscaleBytes: Uint8ClampedArray,
  blurredBytes: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 10
): Uint8ClampedArray {
  const bytes = new Uint8ClampedArray(width * height);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      bytes[row + width + x] =
        blurredBytes[row + x] - greyscaleBytes[row + width + x] > threshold
          ? 0
          : 255;
    }
  }
  return bytes;
}
