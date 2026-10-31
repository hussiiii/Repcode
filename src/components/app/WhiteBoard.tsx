"use client";

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Field, FieldLabel } from "@/components/ui/field";

import { Slider } from '@/components/ui/slider';
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
  active?: boolean;
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
  active = true,
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
  useEffect(() => {
    if (history.length === 0 && historyIndex < 0) {
      setHistory([elements.slice()]);
      setHistoryIndex(0);
    }
  }, [elements, history.length, historyIndex, setHistory, setHistoryIndex]);
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
    [history, historyIndex, setHistory, setHistoryIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex, setElements, setHistoryIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex, setElements, setHistoryIndex]);

  const clearCanvas = useCallback(() => {
    setElements([]);
    saveToHistory([]);
  }, [saveToHistory, setElements]);

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

  useEffect(() => { if (!active) setShowColorPicker(false); }, [active]);

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], .ace_editor, [role="dialog"], [role="alertdialog"]')) return;
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
  }, [active, undo, redo]);

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
  }, [selectedElements, setElements]);

  return (
    <div className={cn("flex flex-col h-full border border-border rounded-lg overflow-hidden bg-drawing-surface", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border bg-surface flex-shrink-0">
        {/* Row 1: Essential Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drawing Tools */}
          <ToggleGroup type="single" variant="tools" value={tool} onValueChange={value => { if (value) setTool(value as Tool); }} aria-label="Drawing tools">
            <ToggleGroupItem value="draw" aria-label="Draw"><Pen className="w-4 h-4" /></ToggleGroupItem>
            <ToggleGroupItem value="erase" aria-label="Erase"><Eraser className="w-4 h-4" /></ToggleGroupItem>
            <ToggleGroupItem value="select" aria-label="Select"><MousePointer className="w-4 h-4" /></ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" variant="toolbar" className="h-6" />

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <Button variant="tool" size="sm" aria-label="Undo"
              onClick={undo}
              disabled={historyIndex <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="tool" size="sm" aria-label="Redo"
              onClick={redo}
              disabled={historyIndex>= history.length - 1}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" variant="toolbar" className="h-6" />

          {/* Color Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button variant="tool" size="sm" aria-label="Choose ink color">
                  <Palette className="w-4 h-4" />
                  <div className="w-4 h-4 rounded border border-foreground" style={{ backgroundColor: previewInk(color) }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent aria-label="Ink colors">
                <RadioGroup aria-label="Ink color" variant="swatches" value={colors.find(c => resolvedInk(c).toUpperCase() === resolvedInk(color).toUpperCase()) ?? color} onValueChange={value => { setColor(value); setShowColorPicker(false); }}>
                  {colors.map(c => <RadioGroupItem key={c} variant="swatch" value={c} aria-label={c.replace('drawing-ink-', '')} colorToken={c} />)}
                </RadioGroup>
              </PopoverContent>
            </Popover>

            <Field orientation="horizontal">
              <FieldLabel variant="toolbar">Size:</FieldLabel>
              <Slider min={1} max={10} step={1} value={[strokeWidth]} onValueChange={values => setStrokeWidth(values[0])} className="w-16" aria-label="Stroke width" />
              <span className="text-sm w-4 text-muted-foreground">{strokeWidth}</span>
            </Field>
          </div>
        </div>

        {/* Row 2 (wraps on smaller screens): Action Buttons */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
          <Separator orientation="vertical" variant="toolbar" className="h-6 hidden sm:block" />

          <div className="flex items-center gap-1">
            {selectedElements.size > 0 && (
              <Button variant="toolDanger" size="sm" aria-label="Delete selected strokes"
                onClick={deleteSelected}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="tool" size="sm"
              onClick={clearCanvas}>
              Clear
            </Button>
            <Button variant="tool" size="sm" aria-label="Download sketch"
              onClick={downloadCanvas}>
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
