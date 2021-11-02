import { DropTargetMonitor, useDrop } from "react-dnd";
import { findNode, isExpanded } from "@udecode/plate-common";
import { Path, Transforms, Editor, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";
import { DragItemBlock } from "../types";
import { getHoverDirection } from "../utils/getHoverDirection";
import { getNewDirection } from "../utils/getNewDirection";

export const useDropBlockOnEditor = (
  editor: ReactEditor,
  {
    blockRef,
    id,
    dropLine,
    setDropLine,
  }: {
    blockRef: any;
    id: string;
    dropLine: string;
    setDropLine: Function;
  }
) => {
  return useDrop({
    accept: "block",
    drop: (dragItem: DragItemBlock, monitor: DropTargetMonitor) => {
      const direction = getHoverDirection(dragItem, monitor, blockRef, id);

      if (!direction) return;

      const dragEntry = findNode(editor, {
        at: [],
        match: { id: dragItem.id },
      });

      if (!dragEntry) return;
      const [, dragPath] = dragEntry;

      ReactEditor.focus(editor);

      let dropPath: Path | undefined;
      if (direction === "bottom" || direction === "right") {
        dropPath = findNode(editor, { at: [], match: { id } })?.[1];
        if (!dropPath) return;

        if (
          Path.equals(dragPath, Path.next(dropPath)) &&
          direction === "bottom"
        ) {
          console.log("invalid drop path");
          return;
        }
      }

      if (direction === "top" || direction === "left") {
        const nodePath = findNode(editor, { at: [], match: { id } })?.[1];

        if (!nodePath) return;
        dropPath = [
          ...nodePath.slice(0, -1),
          nodePath[nodePath.length - 1] - 1,
        ];

        if (Path.equals(dragPath, dropPath) || direction === "top") return;
      }

      const _dropPath = dropPath as Path;

      const before =
        Path.isBefore(dragPath, _dropPath) &&
        Path.isSibling(dragPath, _dropPath);
      const to = before ? _dropPath : Path.next(_dropPath);

      Transforms.moveNodes(editor, {
        at: dragPath,
        to,
      });

      if (direction === "left" || direction === "right") {
        const link = {
          type: "block",
          url: "url",
          children: [{ text: "url" }],
        };
        // debugger; //eslint-disable-line

        // const anchor = Path.isBefore(_dropPath, to)
        //   ? { path: _dropPath, offset: 0 }
        //   : { path: to, offset: 0 };
        // const focus = Path.isBefore(_dropPath, to)
        //   ? { path: [...to, 0], offset: 0 }
        //   : { path: [..._dropPath, 0], offset: 0 };
        // Transforms.wrapNodes(editor, link, {
        //   split: true,
        //   at: {
        //     anchor,
        //     focus,
        //   },
        // });

        // Transforms.unwrapNodes(editor, {
        //   split: true,
        //   match: (n) => {
        //     const matched =
        //       !Editor.isEditor(n) &&
        //       SlateElement.isElement(n) &&
        //       (n as any).type === "block";
        //     debugger; //eslint-disable-line

        //     return matched;
        //   },
        // });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: DragItemBlock, monitor: DropTargetMonitor) {
      const direction = getHoverDirection(item, monitor, blockRef, id);
      console.log("direction", direction);
      const dropLineDir = getNewDirection(dropLine, direction);
      if (dropLineDir) setDropLine(dropLineDir);

      if (direction && isExpanded(editor.selection)) {
        ReactEditor.focus(editor);
        Transforms.collapse(editor);
      }
    },
  });
};
