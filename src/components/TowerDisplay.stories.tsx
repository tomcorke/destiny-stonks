import React from "react";

import { TowerDisplay } from "./TowerDisplay";

export default { title: "Tower Display", component: TowerDisplay };

export const display = () => (
  <TowerDisplay donated={123456} resonancePower={654321} collected={false} />
);
