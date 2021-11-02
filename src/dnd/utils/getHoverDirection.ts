import { DropTargetMonitor, XYCoord } from "react-dnd";
import { DragItemBlock, DropDirection } from "../types";

/**
 * If dragging a block A over another block B:
 * get the direction of block A relative to block B.
 */
export const getHoverDirection = (
  dragItem: DragItemBlock,
  monitor: DropTargetMonitor,
  ref: any, //hover ref
  hoverId: string
): DropDirection => {
  if (!ref.current) return;

  const dragId = dragItem.id;

  // Don't replace items with themselves
  if (dragId === hoverId) return;

  // Determine rectangle on screen
  const hoverBoundingRect = ref.current?.getBoundingClientRect();

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;

  const dTop = Math.abs((clientOffset as XYCoord).y - hoverBoundingRect.top);
  const dBottom = Math.abs(
    (clientOffset as XYCoord).y - hoverBoundingRect.bottom
  );
  const dLeft = Math.abs((clientOffset as XYCoord).x - hoverBoundingRect.left);
  const dRight = Math.abs(
    (clientOffset as XYCoord).x - hoverBoundingRect.right
  );

  const distances = [dTop, dRight, dBottom, dLeft];
  const min = Math.min(...distances);
  const index = distances.indexOf(min);
  switch (index) {
    case 0:
      return "top";
    case 1:
      return "right";
    case 2:
      return "bottom";
    case 3:
      return "left";
    default:
      return undefined;
  }
  // Get pixels to the top
  const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

  // Only perform the move when the mouse has crossed half of the items height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%

  // Dragging downwards
  // if (dragId < hoverId && hoverClientY < hoverMiddleY) {
  if (hoverClientY < hoverMiddleY) {
    return "top";
  }

  // Dragging upwards
  // if (dragId > hoverId && hoverClientY > hoverMiddleY) {
  if (hoverClientY >= hoverMiddleY) {
    return "bottom";
  }
};
