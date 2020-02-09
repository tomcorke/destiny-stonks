import React from "react";
import classnames from "classnames";

import STYLES from "./CheckPanel.module.scss";

interface CheckPanelProps {
  checked: boolean;
  children: string;
  onClick: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const CheckPanel = ({ checked, children, onClick }: CheckPanelProps) => {
  return (
    <div className={STYLES.CheckPanel}>
      <label
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
      >
        <input type="checkbox" defaultChecked={checked} />
        <div
          className={classnames(STYLES.checkDisplay, {
            [STYLES.checked]: checked,
          })}
        />
        <div className={STYLES.label}>{children}</div>
      </label>
    </div>
  );
};
