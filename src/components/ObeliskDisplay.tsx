import React from "react";

import edzObeliskIcon from "../images/edz_obelisk.png";
import marsObeliskIcon from "../images/mars_obelisk.png";
import nessusObeliskIcon from "../images/nessus_obelisk.png";
import tangledShoreObeliskIcon from "../images/tangled_shore_obelisk.png";

import STYLES from "./ObeliskDisplay.module.scss";

interface ObeliskDisplayProps {
  obeliskLevels: {
    edz: number;
    mars: number;
    nessus: number;
    tangledShore: number;
  };
}

export const Obelisk = ({
  level,
  name,
  iconPath,
}: {
  level: number;
  name: string;
  iconPath: string;
}) => (
  <div className={STYLES.obelisk}>
    <div className={STYLES.icon}>
      <img alt={`${name} obelisk`} src={iconPath} />
    </div>
    <div className={STYLES.name}>{name}</div>
    <div className={STYLES.level}>{level}</div>
  </div>
);

export const ObeliskDisplay = ({ obeliskLevels }: ObeliskDisplayProps) => (
  <div className={STYLES.ObeliskDisplay}>
    <div className={STYLES.header}>Obelisk ranks</div>
    <Obelisk
      name="Tangled Shore"
      level={obeliskLevels.tangledShore}
      iconPath={tangledShoreObeliskIcon}
    />
    <Obelisk
      name="Mars"
      level={obeliskLevels.mars}
      iconPath={marsObeliskIcon}
    />
    <Obelisk
      name="Nessus"
      level={obeliskLevels.nessus}
      iconPath={nessusObeliskIcon}
    />
    <Obelisk name="EDZ" level={obeliskLevels.edz} iconPath={edzObeliskIcon} />
  </div>
);
