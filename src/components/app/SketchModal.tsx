// Kind of scuffed. Works, but there are performance issues (arent using best practices) and sometimes theres a runtime error where points is undefined. 


// import dynamic from 'next/dynamic';
// import { canvasColor } from '@/lib/colors';
// import React, { useState, useRef } from 'react';

// // Dynamically import 'Stage', 'Layer', 'Line', 'Rect', and 'Group' components from Konva
// const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
// const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
// const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });
// const Rect = dynamic(() => import('react-konva').then(mod => mod.Rect), { ssr: false });
// const Group = dynamic(() => import('react-konva').then(mod => mod.Group), { ssr: false });

// const SketchModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
//   const [lines, setLines] = useState<any[]>([]);
//   const [tool, setTool] = useState<'pen' | 'eraser' | 'select'>('pen');
//   const isDrawing = useRef(false);
//   const [selectedShapes, setSelectedShapes] = useState<number[]>([]);
//   const [selectionBox, setSelectionBox] = useState<any>({ x: 0, y: 0, width: 0, height: 0 });
//   const selectionRef = useRef({ x: 0, y: 0 });
//   const lastGroupPos = useRef({ x: 0, y: 0 });

//   const handleMouseDown = (e: any) => {
//     const pos = e.target.getStage()?.getPointerPosition();
//     if (tool === 'pen') {
//       isDrawing.current = true;
//       setLines([...lines, { tool, points: [pos?.x, pos?.y], id: lines.length }]);
//     } else if (tool === 'eraser') {
//       const newLines = lines.filter(line => !line.points.some((point: any, index: any) => {
//         if (index % 2 === 0) {
//           const x = point;
//           const y = line.points[index + 1];
//           return Math.abs(x - pos.x) < 10 && Math.abs(y - pos.y) < 10;
//         }
//         return false;
//       }));
//       setLines(newLines);
//     } else if (tool === 'select') {
//       // Start selection box only when the mouse is pressed down
//       selectionRef.current = { x: pos.x, y: pos.y };
//       setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
//       isDrawing.current = true; // Start the selection rectangle
//     }
//   };

//   const handleMouseMove = (e: any) => {
//     const pos = e.target.getStage()?.getPointerPosition();
//     if (tool === 'pen' && isDrawing.current) {
//       const stage = e.target.getStage();
//       const point = stage?.getPointerPosition();
//       let lastLine = lines[lines.length - 1];
//       lastLine.points = lastLine.points.concat([point?.x, point?.y]);
//       lines.splice(lines.length - 1, 1, lastLine);
//       setLines([...lines]);
//     } else if (tool === 'select' && isDrawing.current) {
//       // Update selection box size only while dragging
//       const newBox = {
//         x: Math.min(selectionRef.current.x, pos.x),
//         y: Math.min(selectionRef.current.y, pos.y),
//         width: Math.abs(pos.x - selectionRef.current.x),
//         height: Math.abs(pos.y - selectionRef.current.y),
//       };
//       setSelectionBox(newBox);
//     }
//   };

//   const handleMouseUp = (e: any) => {
//     if (tool === 'pen') {
//       isDrawing.current = false;
//     } else if (tool === 'select' && isDrawing.current) {
//       // Check for shapes inside the selection box
//       const selected = lines.map((line, i) => {
//         const minX = Math.min(...line.points.filter((_: any, index: any) => index % 2 === 0));
//         const maxX = Math.max(...line.points.filter((_: any, index: any) => index % 2 === 0));
//         const minY = Math.min(...line.points.filter((_: any, index: any) => index % 2 === 1));
//         const maxY = Math.max(...line.points.filter((_: any, index: any) => index % 2 === 1));

//         const intersects = !(maxX < selectionBox.x || minX > selectionBox.x + selectionBox.width || maxY < selectionBox.y || minY > selectionBox.y + selectionBox.height);
//         return intersects ? i : null;
//       }).filter(i => i !== null);
//       setSelectedShapes(selected);
//       setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
//       isDrawing.current = false; // Stop the selection rectangle
//     }
//   };

//   const handleGroupDragStart = (e: any) => {
//     const groupNode = e.target;
//     lastGroupPos.current = { x: groupNode.x(), y: groupNode.y() };
//   };

//   const handleGroupDragMove = (e: any) => {
//     const groupNode = e.target;
//     const deltaX = groupNode.x() - lastGroupPos.current.x;
//     const deltaY = groupNode.y() - lastGroupPos.current.y;

//     lastGroupPos.current = { x: groupNode.x(), y: groupNode.y() };

//     const updatedLines = lines.map((line, index) => {
//       if (selectedShapes.includes(index)) {
//         const updatedPoints = line.points.map((point: number, i: number) =>
//           i % 2 === 0 ? point + deltaX : point + deltaY
//         );
//         return { ...line, points: updatedPoints };
//       }
//       return line;
//     });

//     setLines(updatedLines);
//   };

//   const handleGroupDragEnd = (e: any) => {
//     const groupNode = e.target;
//     // Reset the group's position to zero
//     groupNode.position({ x: 0, y: 0 });
//     lastGroupPos.current = { x: 0, y: 0 };
//   };

//   return (
//     <div className={`${isOpen ? '' : 'hidden'} fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center`}>
//       <div className="relative w-[90%] max-w-4xl bg-foreground rounded-lg shadow-lg p-5">
//         <button onClick={onClose} className="absolute top-3 right-3 text-dimmed hover:text-foreground-strong-muted">
//           Close
//         </button>
//         <div className="mb-4 flex justify-center">
//           <button
//             onClick={() => setTool('pen')}
//             className={`px-4 py-2 mr-2 ${tool === 'pen' ? 'bg-app-action-end text-foreground' : 'bg-drawing-tool-inactive text-overlay'} rounded`}
//           >
//             Draw
//           </button>
//           <button
//             onClick={() => setTool('eraser')}
//             className={`px-4 py-2 mr-2 ${tool === 'eraser' ? 'bg-status-danger text-foreground' : 'bg-drawing-tool-inactive text-overlay'} rounded`}
//           >
//             Erase
//           </button>
//           <button
//             onClick={() => setTool('select')}
//             className={`px-4 py-2 ${tool === 'select' ? 'bg-calendar-active text-foreground' : 'bg-drawing-tool-inactive text-overlay'} rounded`}
//           >
//             Select/Move
//           </button>
//         </div>
//         <div className="border border-foreground-soft">
//           <Stage
//             width={800}
//             height={600}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             style={{ border: '1px solid rgb(var(--drawing-ink-black))' }}
//           >
//             <Layer>
//               {lines.map((line, i) => (
//                 selectedShapes.includes(i) ? null : (
//                   <Line
//                     key={i}
//                     points={line.points}
//                     stroke={line.tool === 'pen' ? canvasColor('drawing-ink-black') : canvasColor('drawing-surface')}
//                     strokeWidth={line.tool === 'pen' ? 4 : 20}
//                     tension={0.5}
//                     lineCap="round"
//                     globalCompositeOperation={line.tool === 'pen' ? 'source-over' : 'destination-out'}
//                   />
//                 )
//               ))}
//               {selectedShapes.length > 0 && (
//                 <Group
//                   draggable
//                   onDragStart={handleGroupDragStart}
//                   onDragMove={handleGroupDragMove}
//                   onDragEnd={handleGroupDragEnd}
//                 >
//                   {selectedShapes.map((i) => (
//                     <Line
//                       key={i}
//                       points={lines[i].points}
//                       stroke={lines[i].tool === 'pen' ? canvasColor('drawing-ink-black') : canvasColor('drawing-surface')}
//                       strokeWidth={lines[i].tool === 'pen' ? 4 : 20}
//                       tension={0.5}
//                       lineCap="round"
//                       globalCompositeOperation={lines[i].tool === 'pen' ? 'source-over' : 'destination-out'}
//                     />
//                   ))}
//                 </Group>
//               )}
//               {tool === 'select' && isDrawing.current && (
//                 <Rect
//                   x={selectionBox.x}
//                   y={selectionBox.y}
//                   width={selectionBox.width}
//                   height={selectionBox.height}
//                   stroke={canvasColor('drawing-ink-blue')}
//                   dash={[4, 4]}
//                   fill={canvasColor('drawing-ink-blue', 0.1)}
//                 />
//               )}
//             </Layer>
//           </Stage>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SketchModal;