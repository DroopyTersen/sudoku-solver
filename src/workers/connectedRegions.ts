import { Point, SudukoImage } from "./processImage.types";

export interface ConnectedRegion {
  points: Point[];
  bounds: { topLeft: Point; bottomRight: Point };
  getWidth: () => number;
  getHeight: () => number;
  getAspectRatio: () => number;
  getArea: () => number;
}

const createConnectedRegion = (
  points: Point[],
  topLeft: Point,
  bottomRight: Point
): ConnectedRegion => {
  const getWidth = () => bottomRight.x - topLeft.x;
  const getHeight = () => bottomRight.y - topLeft.y;
  const getAspectRatio = () => getWidth() / getHeight();
  const getArea = () => getWidth() * getHeight();
  return {
    points,
    bounds: {
      topLeft,
      bottomRight,
    },
    getWidth,
    getHeight,
    getAspectRatio,
    getArea,
  };
};

type ConnectedRegionOptions = {
  minAspectRatio: number;
  maxAspectRatio: number;
  minSize: number;
  maxSize: number;
};

export function getLargestConnectedRegion(
  image: SudukoImage,
  { minAspectRatio, maxAspectRatio, minSize, maxSize }: ConnectedRegionOptions
): any | null {
  let maxRegion: ConnectedRegion | null = null;
  // clone the input image as this is a destructive operation
  const tmp: SudukoImage = {
    bytes: new Uint8ClampedArray(image.bytes),
    width: image.width,
    height: image.height,
  };
  for (let y = 0; y < image.height; y++) {
    const row = y * image.width;
    for (let x = 0; x < image.width; x++) {
      if (tmp.bytes[row + x] === LINE_COLOR) {
        const region = getConnectedRegion(tmp, x, y);

        if (
          region.getAspectRatio() >= minAspectRatio &&
          region.getAspectRatio() <= maxAspectRatio &&
          region.getHeight() >= minSize &&
          region.getWidth() >= minSize &&
          region.getHeight() <= maxSize &&
          region.getWidth() <= maxSize
        ) {
          if (!maxRegion || region.getArea() > maxRegion.getArea()) {
            maxRegion = region;
          }
        }
      }
    }
  }
  return maxRegion;
}

const LINE_COLOR = 0;
const BACKGROUND_COLOR = 255;

function getConnectedRegion(
  /** A temp image that will be mutated to "turn off" pixels. It should be a clone of a real image. */
  image: SudukoImage,
  x: number,
  y: number
): ConnectedRegion {
  const { width, height, bytes } = image;
  const bounds: { topLeft: Point; bottomRight: Point } = {
    topLeft: { x, y },
    bottomRight: { x, y },
  };

  const points: Point[] = [];
  const frontier: Point[] = [];
  points.push({ x, y });
  // frontier should only ever have 0 or 1 item in it
  frontier.push({ x, y });
  // Turn the starting pixel off so it doesn't get re-added
  bytes[y * width + x] = BACKGROUND_COLOR;
  // If there weren't any adjacent pixels equal to the LINE_COLOR
  // then the frontier will be empty
  while (frontier.length > 0) {
    // Frontier should now be empty. We'll check adjacent pixels for LINE_COLOR
    const seed = frontier.pop()!;
    // Keep track of the connected regions corners
    bounds.topLeft = {
      x: Math.min(seed.x, bounds.topLeft.x),
      y: Math.min(seed.y, bounds.topLeft.y),
    };
    bounds.bottomRight = {
      x: Math.max(seed.x, bounds.bottomRight.x),
      y: Math.max(seed.y, bounds.bottomRight.y),
    };
    // Search the rows above, same and below
    for (
      // Use Math.max and a check against total height to handle edges
      let dy = Math.max(0, seed.y - 1);
      dy < height && dy <= seed.y + 1;
      dy++
    ) {
      // Search the columns left, same and right
      for (
        // Use Math.max and a check against total width to handle edges
        let dx = Math.max(0, seed.x - 1);
        dx < width && dx <= seed.x + 1;
        dx++
      ) {
        if (bytes[dy * width + dx] === LINE_COLOR) {
          points.push({ x: dx, y: dy });
          frontier.push({ x: dx, y: dy });
          // "Turn off" the pixel so it isn't duplicated in the next pass
          bytes[dy * width + dx] = BACKGROUND_COLOR;
        }
      }
    }
  }
  return createConnectedRegion(points, bounds.topLeft, bounds.bottomRight);
}
