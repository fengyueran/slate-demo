import { DropTargetMonitor, useDrop } from "react-dnd";
import { findNode, isExpanded } from "@udecode/plate-common";
import {
  Path,
  Transforms,
  Editor,
  Element as SlateElement,
  Range,
  Node,
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

        if (!Path.equals(dragPath, Path.next(dropPath))) {
          const _dropPath = dropPath as Path;

          const before =
            Path.isBefore(dragPath, _dropPath) &&
            Path.isSibling(dragPath, _dropPath);
          const to = before ? _dropPath : Path.next(_dropPath);

          Transforms.moveNodes(editor, {
            at: dragPath,
            to,
          });
        }
      }

      if (direction === "top" || direction === "left") {
        const nodePath = findNode(editor, { at: [], match: { id } })?.[1];

        if (!nodePath) return;
        dropPath = [
          ...nodePath.slice(0, -1),
          nodePath[nodePath.length - 1] - 1,
        ];

        if (!Path.equals(dragPath, dropPath)) {
          const _dropPath = dropPath as Path;

          const before =
            Path.isBefore(dragPath, _dropPath) &&
            Path.isSibling(dragPath, _dropPath);
          const to = before ? _dropPath : Path.next(_dropPath);

          Transforms.moveNodes(editor, {
            at: dragPath,
            to,
          });
        }
      }

      const _dropPath = dropPath as Path;

      if (direction === "top" || direction === "bottom") {
        const link = {
          type: "column",
          children: [],
        };
        const newPath = findNode(editor, {
          at: [],
          match: { id },
        })?.[1] as Path;

        const parent = Node.parent(editor, newPath);
        console.log("parent", parent);
        if (parent && (parent as any).type === "row") {
          console.log("id", id);
          console.log("dragItem.id", dragItem.id);
          Transforms.wrapNodes(editor, link, {
            split: true,
            at: {
              anchor: { path: [0], offset: 0 },
              focus: Editor.end(editor, [editor.children.length - 1]),
            },
            match: (n) => {
              console.log("n", n);
              const matched =
                (n as any).id === id || (n as any).id === dragItem.id;
              console.log("matched", matched);
              return matched;
            },
          });
        }
        const a = Editor.end(editor, [editor.children.length - 1]);
        console.log("---------", a);

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
      if (direction === "left" || direction === "right") {
        const newPath = findNode(editor, {
          at: [],
          match: { id },
        })?.[1] as Path;

        const parent = Node.parent(editor, newPath);
        if ((parent as any)?.type !== "row") {
          const link = {
            type: "row",
            children: [],
          };

          Transforms.wrapNodes(editor, link, {
            split: true,
            at: {
              anchor: { path: [0], offset: 0 },
              focus: Editor.end(editor, [editor.children.length - 1]),
            },
            match: (n) => {
              const matched =
                (n as any).id === id || (n as any).id === dragItem.id;

              return matched;
            },
          });
        }

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
      isOver: monitor.isOver({ shallow: true }),
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
