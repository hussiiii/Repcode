"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Pen,
  Eraser,
  MousePointer,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Palette,
} from "lucide-react";
import { canvasColor, cssColor, hexColor } from '@/lib/colors';
import { cn } from "@/lib/utils";

type Tool = "draw" | "erase" | "select";

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: "path";
  points?: Point[];
  color: string;
  strokeWidth: number;
  selected?: boolean;
}

interface WhiteboardProps {
  className?: string;
  elements?: DrawingElement[];
  setElements?: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
  history?: DrawingElement[][];
  setHistory?: React.Dispatch<React.SetStateAction<DrawingElement[][]>>;
  historyIndex?: number;
  setHistoryIndex?: React.Dispatch<React.SetStateAction<number>>;
}

// Store token names only for the current tool. Saved paths keep resolved ink colors.
const colors = [
  'drawing-ink-black', 'drawing-ink-red', 'drawing-ink-lime', 'drawing-ink-blue',
  'drawing-ink-yellow', 'drawing-ink-magenta', 'drawing-ink-cyan',
  'drawing-ink-orange', 'drawing-ink-purple', 'drawing-ink-green',
];

// Keep existing selections usable during Fast Refresh, and retain the saved ink format.
const resolvedInk = (ink: string) => ink.startsWith('drawing-ink-') ? hexColor(ink).toUpperCase() : ink;
const previewInk = (ink: string) => ink.startsWith('drawing-ink-') ? cssColor(ink) : ink;

export function Whiteboard({ 
  className,
  elements: propElements,
  setElements: propSetElements,
  history: propHistory,
  setHistory: propSetHistory,
  historyIndex: propHistoryIndex,
  setHistoryIndex: propSetHistoryIndex
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("draw");
  const [color, setColor] = useState('drawing-ink-black');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [localElements, localSetElements] = useState<DrawingElement[]>([]);
  const [localHistory, localSetHistory] = useState<DrawingElement[][]>([]);
  const [localHistoryIndex, localSetHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  // Use props if provided, otherwise use local state
  const elements = propElements !== undefined ? propElements : localElements;
  const setElements = propSetElements || localSetElements;
  const history = propHistory !== undefined ? propHistory : localHistory;
  const setHistory = propSetHistory || localSetHistory;
  const historyIndex = propHistoryIndex !== undefined ? propHistoryIndex : localHistoryIndex;
  const setHistoryIndex = propSetHistoryIndex || localSetHistoryIndex;
  const [selectedElements, setSelectedElements] = useState<Set<string>>(
    new Set()
  );
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    start: Point;
    end: Point;
  } | null>(null);
  const [isDrawingSelection, setIsDrawingSelection] = useState(false);

  const saveToHistory = useCallback(
    (newElements: DrawingElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    setElements([]);
    saveToHistory([]);
  }, [saveToHistory]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawElements = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (element.type === "path" && element.points) {
        ctx.beginPath();
        if (element.points.length > 0) {
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
        }
        ctx.stroke();
      }

      // Draw selection indicator
      if (element.selected) {
        ctx.strokeStyle = canvasColor('drawing-selection');
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        if (
          element.type === "path" &&
          element.points &&
          element.points.length > 0
        ) {
          const minX = Math.min(...element.points.map((p) => p.x));
          const maxX = Math.max(...element.points.map((p) => p.x));
          const minY = Math.min(...element.points.map((p) => p.y));
          const maxY = Math.max(...element.points.map((p) => p.y));
          ctx.strokeRect(
            minX - 5,
            minY - 5,
            maxX - minX + 10,
            maxY - minY + 10
          );
        }

        ctx.setLineDash([]);
      }
    });

    // Draw current path while drawing
    if (isDrawing && currentPath.length > 0 && tool === "draw") {
      ctx.beginPath();
      ctx.strokeStyle = resolvedInk(color);
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (currentPath.length > 0) {
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
      }
      ctx.stroke();
    }

    // Draw selection box
    if (selectionBox) {
      ctx.strokeStyle = canvasColor('drawing-selection');
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      const width = selectionBox.end.x - selectionBox.start.x;
      const height = selectionBox.end.y - selectionBox.start.y;
      ctx.strokeRect(selectionBox.start.x, selectionBox.start.y, width, height);
      ctx.setLineDash([]);
    }
  }, [
    elements,
    color,
    strokeWidth,
    selectionBox,
    isDrawing,
    currentPath,
    tool,
  ]);

  useEffect(() => {
    drawElements();
  }, [drawElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === "draw") {
      setIsDrawing(true);
      setCurrentPath([pos]);
    } else if (tool === "erase") {
      // Find elements to erase - remove whole objects
      const elementsToKeep = elements.filter((element) => {
        if (element.type === "path" && element.points) {
          return !element.points.some(
            (point) =>
              Math.abs(point.x - pos.x) < 15 && Math.abs(point.y - pos.y) < 15
          );
        }
        return true;
      });

      if (elementsToKeep.length !== elements.length) {
        setElements(elementsToKeep);
        saveToHistory(elementsToKeep);
      }
    } else if (tool === "select") {
      // Check if clicking within the bounds of selected elements
      let clickedInSelectionArea = false;

      if (selectedElements.size > 0) {
        // Calculate bounding box of all selected elements
        let minX = Number.POSITIVE_INFINITY,
          maxX = Number.NEGATIVE_INFINITY,
          minY = Number.POSITIVE_INFINITY,
          maxY = Number.NEGATIVE_INFINITY;

        elements.forEach((element) => {
          if (!selectedElements.has(element.id)) return;

          if (element.type === "path" && element.points) {
            element.points.forEach((point) => {
              minX = Math.min(minX, point.x);
              maxX = Math.max(maxX, point.x);
              minY = Math.min(minY, point.y);
              maxY = Math.max(maxY, point.y);
            });
          }
        });

        // Check if click is within selection bounds
        if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
          clickedInSelectionArea = true;
          setDragStart(pos);
        }
      }

      if (!clickedInSelectionArea) {
        // Start selection box
        setIsDrawingSelection(true);
        setSelectionBox({ start: pos, end: pos });
        setSelectedElements(new Set());
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isDrawing && tool === "draw") {
      setCurrentPath((prev) => [...prev, pos]);
    } else if (isDrawingSelection && selectionBox) {
      setSelectionBox((prev) => (prev ? { ...prev, end: pos } : null));
    } else if (tool === "select" && dragStart && selectedElements.size > 0) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      setElements((prev) =>
        prev.map((element) => {
          if (selectedElements.has(element.id)) {
            if (element.type === "path" && element.points) {
              return {
                ...element,
                points: element.points.map((point) => ({
                  x: point.x + dx,
                  y: point.y + dy,
                })),
              };
            }
          }
          return element;
        })
      );

      setDragStart(pos);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && tool === "draw" && currentPath.length > 0) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: "path",
        points: [...currentPath],
        color: resolvedInk(color),
        strokeWidth,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveToHistory(newElements);
      setCurrentPath([]);
    } else if (isDrawingSelection && selectionBox) {
      // Select elements within selection box
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);

      const selectedIds = new Set<string>();

      elements.forEach((element) => {
        let isInSelection = false;

        if (element.type === "path" && element.points) {
          isInSelection = element.points.some(
            (point) =>
              point.x >= minX &&
              point.x <= maxX &&
              point.y >= minY &&
              point.y <= maxY
          );
        }

        if (isInSelection) {
          selectedIds.add(element.id);
        }
      });

      setSelectedElements(selectedIds);
      setSelectionBox(null);
      setIsDrawingSelection(false);
    }

    setIsDrawing(false);
    setDragStart(null);
  };

  const deleteSelected = () => {
    const newElements = elements.filter(
      (element) => !selectedElements.has(element.id)
    );
    setElements(newElements);
    saveToHistory(newElements);
    setSelectedElements(new Set());
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // Update selected state in elements
  useEffect(() => {
    setElements((prev) =>
      prev.map((element) => ({
        ...element,
        selected: selectedElements.has(element.id),
      }))
    );
  }, [selectedElements]);

  return (
    <div className={cn("flex flex-col h-full border border-border rounded-lg overflow-hidden bg-drawing-surface", className)}>
      {/* Toolbar */}
      {/* Keep toolbar buttons transparent as shared component tokens become available. */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border bg-surface flex-shrink-0">
        {/* Row 1: Essential Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1">
            <Button
              variant={tool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("draw")}
              className={tool === "draw" ? "bg-action hover:bg-action text-foreground" : "bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border"}
            >
              <Pen className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === "erase" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("erase")}
              className={tool === "erase" ? "bg-action hover:bg-action text-foreground" : "bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border"}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("select")}
              className={tool === "select" ? "bg-action hover:bg-action text-foreground" : "bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border"}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-border opacity-70" />

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border disabled:text-control-disabled-foreground disabled:bg-control-disabled"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border disabled:text-control-disabled-foreground disabled:bg-control-disabled"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-border opacity-70" />

          {/* Color Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="gap-2 bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border"
              >
                <Palette className="w-4 h-4" />
                <div
                  className="w-4 h-4 rounded border border-foreground"
                  style={{ backgroundColor: previewInk(color) }}
                />
              </Button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 py-2 px-1 w-32 bg-surface-inset border border-border rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        className={cn(
                          "w-4 h-4 rounded border-1",
                          color === c || (!color.startsWith('drawing-ink-') && resolvedInk(c).toUpperCase() === color.toUpperCase())
                            ? "border-foreground"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: cssColor(c) }}
                        onClick={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16 accent-action"
              />
              <span className="text-sm w-4 text-muted-foreground">{strokeWidth}</span>
            </div>
          </div>
        </div>

        {/* Row 2 (wraps on smaller screens): Action Buttons */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
          <Separator orientation="vertical" className="h-6 bg-border opacity-70 hidden sm:block" />

          <div className="flex items-center gap-1">
            {selectedElements.size > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={deleteSelected}
                className="bg-transparent text-status-error hover:text-status-error hover:bg-difficulty-hard-background border-border"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCanvas}
              className="bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border whitespace-nowrap"
            >
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadCanvas}
              className="bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground border-border"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas - Full remaining space */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className={cn(
            "absolute inset-0 w-full h-full bg-drawing-surface border border-border",
            tool === "draw" && "cursor-crosshair",
            tool === "erase" && "cursor-default",
            tool === "select" && "cursor-move"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-border bg-surface text-sm text-muted-foreground flex-shrink-0">
        <span className="text-foreground font-medium">Tool:</span> {tool} |
        <span className="text-foreground font-medium ml-2">Elements:</span> {elements.length} |
        <span className="text-foreground font-medium ml-2">Selected:</span> {selectedElements.size}
        {tool === "select" &&
          " | Draw selection box to select multiple elements"}
      </div>
    </div>
  );
}
