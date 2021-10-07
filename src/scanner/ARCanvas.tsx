import { useEffect, useRef } from "preact/hooks";
import { drawBoundingBox, drawGrid } from "../utils/canvas.utils";
import { ProcessedData } from "../workers/processImage.types";

interface Props extends ProcessedData {}

export function ARCanvas({ imageData, corners, gridLines }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (imageData?.width) {
        context.putImageData(imageData, 0, 0);
      }
      if (corners?.topLeft) {
        drawBoundingBox(context, corners);
      }
      if (gridLines?.length) {
        drawGrid(context, gridLines);
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={imageData?.width}
      height={imageData?.height}
    />
  );
}
