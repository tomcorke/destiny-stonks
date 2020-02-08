import React from "react";

import STYLES from "./TowerDisplay.module.scss";

import towerObeliskImage from "../images/tower_obelisk.png";
import fractalineImage from "../images/fractaline_trans_2.png";

interface TowerDisplayProps {
  donated: number;
  resonancePower: number;
  collected: boolean;
}

export const Item = ({
  value,
  label,
  iconPath,
}: {
  value: number;
  label: string;
  iconPath: string;
}) => (
  <div className={STYLES.item}>
    <div className={STYLES.icon}>
      <img alt={`${label}`} src={iconPath} />
    </div>
    <div className={STYLES.label}>{label}</div>
    <div className={STYLES.value}>{value}</div>
  </div>
);

export const TowerDisplay = ({}: TowerDisplayProps) => {
  return (
    <div className={STYLES.TowerDisplay}>
      <div className={STYLES.header}>Tower</div>
      <Item
        value={11500}
        label="Tower Resonance"
        iconPath={towerObeliskImage}
      />
      <Item
        value={5400}
        label="Donated Fractaline"
        iconPath={fractalineImage}
      />
    </div>
  );
};
