import React from "react";

import STYLES from "./ResetPanel.module.scss";

interface ResetPanelProps {
  header: string;
  content: string | JSX.Element | JSX.Element[];
}

export const ResetPanel = ({ header, content }: ResetPanelProps) => {
  return (
    <div className={STYLES.ResetPanel}>
      <div className={STYLES.header}>{header}</div>
      <div className={STYLES.content}>{content}</div>
    </div>
  );
};
