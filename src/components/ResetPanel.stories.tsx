import React from "react";

import { ResetPanel } from "./ResetPanel";

export default { title: "Reset Panel", component: ResetPanel };

export const display = () => <ResetPanel header="Reset panel" content="" />;

export const multiplePanels = () => (
  <>
    <ResetPanel header="This week" content="" />
    <ResetPanel header="next week" content="" />
    <ResetPanel header="Week beginning 03/03/2020" content="" />
  </>
);
