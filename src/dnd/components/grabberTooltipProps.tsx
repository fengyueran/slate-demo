import React from "react";
import { TippyProps } from "@tippyjs/react";

const GrabberTooltipContent = () => (
  <div style={{ fontSize: 12 }}>
    <div>Drag and drop</div>
  </div>
);
export const grabberTooltipProps: TippyProps = {
  content: <GrabberTooltipContent />,
  placement: "bottom",
  arrow: false,
  offset: [0, 0],
  delay: [300, 0],
  duration: [0, 0],
  hideOnClick: true,
  theme: "small",
};
