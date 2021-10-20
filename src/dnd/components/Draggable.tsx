import React, { useRef } from "react";
import useMergedRef from "@react-hook/merged-ref";
import { useDndBlock } from "../hooks/useDndBlock";
import { getDraggableStyles } from "./Draggable.styles";
import { DraggableProps, DragHandleProps } from "./Draggable.types";

const DefaultDragHandle = ({ styles, ...props }: DragHandleProps) => (
  <button
    type="button"
    {...props}
    css={styles}
    style={{ width: 100, height: 30 }}
  />
);

export const Draggable = (props: DraggableProps) => {
  const { children, element, componentRef, onRenderDragHandle } = props;
  const DragHandle = onRenderDragHandle ?? DefaultDragHandle;

  const blockRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragWrapperRef = useRef(null);
  const multiRootRef = useMergedRef(componentRef, rootRef);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: element.id,
    blockRef: rootRef,
  });

  console.log("dropLine", dropLine);

  const multiDragRef = useMergedRef(dragRef, dragWrapperRef);

  const styles = getDraggableStyles({
    ...props,
    direction: dropLine,
    isDragging,
  });

  return (
    <div
      css={styles.root.css}
      className={styles.root.className}
      ref={multiRootRef}
      data-id="hhhhh"
      style={{ position: "relative" }}
    >
      <div
        ref={blockRef}
        css={[
          ...(styles.blockAndGutter?.css ?? []),
          ...(styles.block?.css ?? []),
        ]}
      >
        {children}

        {!!dropLine && (
          <div
            css={styles.dropLine?.css}
            className={styles.dropLine?.className}
            contentEditable={false}
            style={{
              height: "0.125rem",
              left: 0,
              position: "absolute",
              right: 0,
              opacity: 1,
              background: "red",
              top: "-1px",
            }}
          />
        )}
        {/* 
        <div
          css={styles.dropLine?.css}
          className={styles.dropLine?.className}
          contentEditable={false}
        /> */}
      </div>

      <div
        css={[
          ...(styles.blockAndGutter?.css ?? []),
          ...(styles.gutterLeft?.css ?? []),
        ]}
        style={{
          position: "absolute",
          top: 0,
          display: "flex",
          height: "100%",
          opacity: 1,
          transform: "translateX(-100%)",
          paddingTop: "0.25rem",
        }}
        className={styles.gutterLeft?.className}
        contentEditable={false}
      >
        <div
          css={styles.blockToolbarWrapper?.css}
          className={styles.blockToolbarWrapper?.className}
        >
          <div
            css={styles.blockToolbar?.css}
            className={styles.blockToolbar?.className}
            ref={multiDragRef}
          >
            <DragHandle
              element={element}
              styles={styles.dragHandle?.css}
              className={styles.dragHandle?.className}
              onMouseDown={(e: any) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
