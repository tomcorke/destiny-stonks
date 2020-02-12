import React from "react";

import { Calculator } from "./Calculator";

export default { title: "Calculator", component: Calculator };

export const display = () => (
  <Calculator
    fromDate={new Date(Date.UTC(2020, 1, 12, 11, 12, 13, 123))}
    isAuthed={true}
    donationData={{
      obeliskLevels: { edz: 11, nessus: 62, mars: 29, tangledShore: 11 },
      donatedFractaline: 5400,
      fractalineInInventory: 750,
      hasCollectedTowerFractaline: true,
      lightFusedFractalineInInventory: 24,
      resonancePower: 11500,
    }}
  />
);
