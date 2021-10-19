import React, { useState, useMemo, useEffect } from "react";
// import imageExtensions from "image-extensions";
// import isUrl from "is-url";
import { Editor, Transforms, createEditor, Descendant } from "slate";

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

// import { Button, Icon, Toolbar } from "../components";

const Toolbar = () => {
  const editor = useSlate();
  useEffect(() => {
    const { selection } = editor;
    console.log("9999", selection);
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
    console.log("domSelection", domSelection);
    console.log("domRange", domRange);
  }, [editor.selection]);
  return null;
};
const ImagesExample = () => {
  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );

  return (
    // <DndProvider backend={HTML5Backend}>
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      {/* <Toolbar>
        <InsertImageButton />
      </Toolbar> */}
      <Toolbar />
      <Editable
        renderElement={(props) => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
    // </DndProvider>
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

const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "image":
      return <Image {...props} />;
    case "imageTitle":
      return <div {...props}>{children}</div>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

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
    type: "paragraph",
    children: [
      {
        text: "In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.",
      },
    ],
  },
  {
    type: "image",
    url: "https://source.unsplash.com/kFrdX5IeQzI",
    children: [
      {
        type: "imageTitle",
        children: [{ text: "this is image title" }],
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!",
      },
    ],
  },
];

export default ImagesExample;
