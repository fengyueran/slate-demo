import { DropTargetMonitor, useDrop } from "react-dnd";
import { findNode, isExpanded } from "@udecode/plate-common";
import {
  Path,
  Transforms,
  Editor,
  Element as SlateElement,
  Range,
} from "slate";
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

        if (Path.equals(dragPath, dropPath) && direction === "top") return;
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
      console.log("Path.levels", Path.levels([3], { reverse: true }));
      if (direction === "left" || direction === "right") {
        const link = {
          type: "block",
          children: [],
        };
        // debugger; //eslint-disable-line

        let anchor;
        let focus;

        if (Path.equals(_dropPath, to)) {
          anchor = { path: _dropPath, offset: 0 };
          focus = { path: [...Path.next(_dropPath), 0], offset: 0 };
        } else {
          anchor = Path.isBefore(_dropPath, to)
            ? { path: _dropPath, offset: 0 }
            : { path: to, offset: 0 };
          focus = Path.isBefore(_dropPath, to)
            ? { path: [...to, 0], offset: 0 }
            : { path: [..._dropPath, 0], offset: 0 };
        }

        if (direction === "left") {
          anchor = { path: to, offset: 0 };
          focus = { path: Path.next(to), offset: 0 };
        } else {
          anchor = { path: Path.previous(to), offset: 0 };
          focus = { path: to, offset: 0 };
        }

        Transforms.wrapNodes(editor, link, {
          split: true,
          at: {
            anchor: { path: [0], offset: 0 },
            focus: { path: [editor.children.length - 1, 0], offset: 0 },
          },
          match: (n) => {
            console.log("------", n);
            // debugger; //eslint-disable-line

            const matched =
              (n as any).id === id || (n as any).id === dragItem.id;
            // debugger; //eslint-disable-line

            return matched;
          },
        });

        // Transforms.unwrapNodes(editor, {
        //   split: true,
        //   mode: "highest",
        //   match: (n) => {
        //     console.log("------", n);
        //     const matched = (n as any).id === 3 || (n as any).id === 4;
        //     // debugger; //eslint-disable-line

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
