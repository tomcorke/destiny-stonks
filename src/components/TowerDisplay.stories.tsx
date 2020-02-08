import React from "react";

import { TowerDisplay } from "./TowerDisplay";

export default { title: "Tower Display", component: TowerDisplay };

export const display = () => (
  <TowerDisplay donated={0} resonancePower={0} collected={false} />
);
