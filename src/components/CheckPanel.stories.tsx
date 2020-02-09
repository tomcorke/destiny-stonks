import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import { CheckPanel } from "./CheckPanel";

export default { title: "Check panel", component: CheckPanel };

export const notChecked = () => (
  <CheckPanel checked={false} onClick={action("Click")}>
    Not checked
  </CheckPanel>
);
export const checked = () => (
  <CheckPanel checked={true} onClick={action("Click")}>
    Checked
  </CheckPanel>
);

export const useToggleable = () => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <CheckPanel checked={isChecked} onClick={() => setIsChecked(!isChecked)}>
      Click to toggle
    </CheckPanel>
  );
};
