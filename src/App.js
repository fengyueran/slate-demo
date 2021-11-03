import React, { useState, useMemo, useEffect } from "react";
// import imageExtensions from "image-extensions";
// import isUrl from "is-url";
import { Editor, Transforms, createEditor, Descendant } from "slate";
import { DragDrop } from "@styled-icons/remix-line";

import Tippy from "@tippyjs/react";

import {
  Slate,
  Editable,
  useSlateStatic,
  useSelected,
  useFocused,
  withReact,
  ReactEditor,
  useSlate,
} from "slate-react";
import { withHistory } from "slate-history";
import { css } from "@emotion/css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";
import { withDraggable, grabberTooltipProps } from "./dnd";
import { withNodeId } from "./withIDPlugin";

// import { Button, Icon, Toolbar } from "../components";
const EditorContainer = styled.div`
  padding: 50px;
  width: 520px;
`;
const Toolbar = () => {
  const editor = useSlate();
  console.log("select", editor.selection);
  useEffect(() => {
    const { selection } = editor;
    if (
      !selection ||
      !ReactEditor.isFocused(editor)
      // Range.isCollapsed(selection) ||
      // Editor.string(editor, selection) === ""
    ) {
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
  }, [editor.selection]);
  return null;
};
const DemoEditor = () => {
  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => withImages(withHistory(withReact(withNodeId()(createEditor())))),
    []
  );
  console.log("Editor value:", value);
  return (
    <DndProvider backend={HTML5Backend}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => setValue(value)}
      >
        <Toolbar>
          <InsertImageButton />
        </Toolbar>
        <EditorContainer>
          <Editable
            onDrop={() => 1}
            renderElement={(props) => <Element {...props} />}
            placeholder="Enter some text..."
          />
        </EditorContainer>
      </Slate>
    </DndProvider>
  );
};

const withImages = (editor) => {
  const { insertData, isVoid, isBlock } = editor;

  // editor.isVoid = (element) => {
  //   return element.type === "image" ? true : isVoid(element);
  // };

  // editor.insertData = (data) => {
  //   const text = data.getData("text/plain");
  //   const { files } = data;

  //   if (files && files.length > 0) {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       const [mime] = file.type.split("/");

  //       if (mime === "image") {
  //         reader.addEventListener("load", () => {
  //           const url = reader.result;
  //           insertImage(editor, url);
  //         });

  //         reader.readAsDataURL(file);
  //       }
  //     }
  //   } else if (isImageUrl(text)) {
  //     insertImage(editor, text);
  //   } else {
  //     insertData(data);
  //   }
  // };

  return editor;
};

// const insertImage = (editor, url) => {
//   const text = { text: "" };
//   const image = { type: "image", url, children: [text] };
//   Transforms.insertNodes(editor, image);
// };

const Praragraph = ({ attributes, children }) => {
  return <p {...attributes}>{children}</p>;
};

const Block = ({ attributes, children }) => {
  return (
    <div style={{ display: "flex" }} {...attributes}>
      {children}
    </div>
  );
};
const Col = ({ attributes, children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }} {...attributes}>
      {children}
    </div>
  );
};

const DraggableP = withDraggable(Praragraph, {
  onRenderDragHandle: ({ styles, ...props }) => (
    <Tippy {...grabberTooltipProps}>
      <button type="button" {...props} css={styles}>
        <DragDrop
          style={{
            width: 18,
            height: 18,
            color: "rgba(55, 53, 47, 0.3)",
          }}
        />
      </button>
    </Tippy>
  ),
});
const Image = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div>
        <img
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
        />
        {children}
      </div>
    </div>
  );
};
const DraggableImg = withDraggable(Image, {
  onRenderDragHandle: ({ styles, ...props }) => (
    <Tippy {...grabberTooltipProps}>
      <button type="button" {...props} css={styles}>
        <DragDrop
          style={{
            width: 18,
            height: 18,
            color: "rgba(55, 53, 47, 0.3)",
          }}
        />
      </button>
    </Tippy>
  ),
});

const DraggableBlock = withDraggable(Block, {
  onRenderDragHandle: ({ styles, ...props }) => (
    <Tippy {...grabberTooltipProps}>
      <button type="button" {...props} css={styles}>
        <DragDrop
          style={{
            width: 18,
            height: 18,
            color: "rgba(55, 53, 47, 0.3)",
          }}
        />
      </button>
    </Tippy>
  ),
});
let id = 0;
const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "h1":
      return <h1 {...props}>{children}</h1>;
    case "image":
      if (!element.id) {
        id++;
        element.id = id;
      }
      return <DraggableImg {...props} />;
    case "imageTitle":
      return (
        <div style={{ marginLeft: 170 }} {...props}>
          {children}
        </div>
      );
    case "block":
      return <Block {...props} />;
    case "column":
      return <Col {...props} />;
    default:
      if (!element.id) {
        id++;
        element.id = id;
      }
      return <DraggableP {...props} />;
  }
};

const InsertImageButton = () => {
  const editor = useSlateStatic();
  return null;
  // (
  // <Button
  //   onMouseDown={(event) => {
  //     event.preventDefault();
  //     const url = window.prompt("Enter the URL of the image:");
  //     if (url && !isImageUrl(url)) {
  //       alert("URL is not an image");
  //       return;
  //     }
  //     insertImage(editor, url);
  //   }}
  // >
  //   <Icon>image</Icon>
  // </Button>
  // );
};

const isImageUrl = (url) => {
  if (!url) return false;
  // if (!isUrl(url)) return false;
  // const ext = new URL(url).pathname.split(".").pop();
  return true;
};

const initialValue = [
  {
    type: "h1",
    children: [
      {
        text: "Next Medical Report",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "这是一个可编辑的，支持redo、undo的Report demo。这个demo里简单地实现了Block的上下左右地拖曳调序功能以及一个基于editor的可编辑图片名称的组件。",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Hover时Block的左上方出现拖动的按钮，拖动出现红色的位置线时松开鼠标完成移动。",
      },
    ],
  },
  {
    type: "image",
    url: "./test.jpg",
    children: [
      {
        type: "imageTitle",
        children: [{ text: "我是可以编辑的图片名" }],
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "打开控制台你可以看到实时更新的Editor value。",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "PS：当前拖曳功能，只是一个基础地实现，还有很多问题待解决。",
      },
    ],
  },
];

export default DemoEditor;
