export interface ProcessedData {
  imageData: ImageData;
  corners: CornerPoints;
  gridLines: GridLines;
}

export type CornerPoints = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};
export type GridLines = {
  p1: Point;
  p2: Point;
}[];
export interface SudukoImage {
  bytes: Uint8ClampedArray;
  width: number;
  height: number;
}
export interface WorkerMessage {
  imageData: ImageData;
  mode?: CanvasMode;
  config?: WorkerConfig;
}
export interface WorkerConfig {
  blur?: number;
  threshhold?: number;
}
export type CanvasMode = "original" | "greyscale" | "blur" | "threshold";

export interface Point {
  x: number;
  y: number;
}
