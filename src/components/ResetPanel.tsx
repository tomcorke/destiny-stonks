import React from "react";
import classnames from "classnames";

import STYLES from "./ResetPanel.module.scss";

interface ResetPanelProps {
  header: string;
  content: string | JSX.Element | JSX.Element[];
  suggestedAction?: string;
}

export const ResetPanel = ({
  header,
  content,
  suggestedAction,
}: ResetPanelProps) => {
  return (
    <div className={STYLES.ResetPanel}>
      <div className={STYLES.inner}>
        <div className={STYLES.header}>{header}</div>
        <div className={STYLES.content}>{content}</div>
        {!!suggestedAction ? (
          <div className={STYLES.suggestedAction}>
            <div
              className={classnames(
                STYLES.suggestedActionInner,
                STYLES[suggestedAction]
              )}
            >
              {suggestedAction}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
