export function convertToGreyscale(imageData: ImageData) {
  if (!imageData || !imageData?.width) return null;

  const { width, height } = imageData;
  const bytes = new Uint8ClampedArray(width * height);
  // For each row
  for (let y = 0; y < height; y++) {
    const rowByteIndex = y * width;
    // each "pixel" is represented as four numbers RGBA
    const rowImageDataIndex = rowByteIndex * 4;
    for (let x = 0; x < width; x++) {
      // Take the row index + current column * 4 (RGBA)
      let cellIndex = rowImageDataIndex + x * 4;
      const greenValue = imageData.data[cellIndex + 1];
      bytes[y * width + x] = greenValue;
    }
  }

  return bytes;
}
