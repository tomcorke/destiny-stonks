import React from "react";

import { ObeliskDisplay } from "./ObeliskDisplay";

export default { title: "Obelisk Display", component: ObeliskDisplay };

export const display = () => (
  <ObeliskDisplay
    obeliskLevels={{ edz: 1, mars: 2, nessus: 3, tangledShore: 69 }}
  />
);
