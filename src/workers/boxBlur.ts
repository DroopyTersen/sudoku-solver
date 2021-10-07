// Fast box blur algorithm
// see - https://www.gamasutra.com/view/feature/3102/four_tricks_for_fast_blurring_in_.php?print=1

import { SudukoImage } from "./processImage.types";

/** Replace each pixel with a sum of all pixels above and to the left */
function precompute({ bytes, width, height }: SudukoImage): number[] {
  const result: number[] = new Array(bytes.length);
  let index = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let tot = bytes[index];
      // Try to add the pixel to the left
      if (x > 0) tot += result[index - 1];
      // Try to add the pixel above
      if (y > 0) tot += result[index - width];
      // Subtract the diagonal pixel since it was included
      // in both the top and the left sums
      if (x > 0 && y > 0) tot -= result[index - width - 1];
      result[index] = tot;
      index++;
    }
  }
  return result;
}

export function boxBlur(
  { bytes, width, height }: SudukoImage,
  blurSize: number
): Uint8ClampedArray {
  const precomputed = precompute({ bytes, width, height });
  const result = new Uint8ClampedArray(width * height);
  let dst = 0;
  const mul = 1.0 / ((blurSize * 2 + 1) * (blurSize * 2 + 1));

  function getPrecomputedValue(x: number, y: number): number {
    // Handle left and right edges
    if (x < 0) x = 0;
    else if (x >= width) x = width - 1;
    // Handle top and bottom edges
    if (y < 0) y = 0;
    else if (y >= height) y = height - 1;

    // Look up the precomputed value
    return precomputed[x + y * width];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tot =
        getPrecomputedValue(x + blurSize, y + blurSize) +
        getPrecomputedValue(x - blurSize, y - blurSize) -
        getPrecomputedValue(x - blurSize, y + blurSize) -
        getPrecomputedValue(x + blurSize, y - blurSize);
      result[dst] = tot * mul;
      dst++;
    }
  }
  return result;
}
