import React from "react";

import { Calculator } from "./Calculator";

export default { title: "Calculator", component: Calculator };

export const display = () => (
  <Calculator
    fromDate={new Date(2020, 1, 2, 0, 0, 0)}
    isAuthed={true}
    donationData={{
      obeliskLevels: { edz: 1, nessus: 2, mars: 3, tangledShore: 4 },
      donatedFractaline: 5400,
      fractalineInInventory: 7500,
      hasCollectedTowerFractaline: false,
      lightInfusedFractalineInInventory: 24,
      resonancePower: 11500,
    }}
  />
);
