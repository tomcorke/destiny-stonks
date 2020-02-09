import React from "react";
import numeral from "numeral";

import STYLES from "./TowerDisplay.module.scss";

import towerObeliskImage from "../images/tower_obelisk.png";
import fractalineImage from "../images/fractaline-trans.png";
import fractalineImage2 from "../images/fractaline_trans_2.png";
import lightFusedFractaline from "../images/light_fused.jpg";

interface TowerDisplayProps {
  donated: number;
  resonancePower: number;
  collected: boolean;
  fractalineInInventory: number;
  lightFusedFractalineInInventory: number;
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
    <div className={STYLES.value}>{numeral(value).format("0,0")}</div>
  </div>
);

export const TowerDisplay = ({
  resonancePower,
  donated,
  fractalineInInventory,
  lightFusedFractalineInInventory,
}: TowerDisplayProps) => {
  return (
    <div className={STYLES.TowerDisplay}>
      <div className={STYLES.header}>Tower</div>
      <Item
        value={resonancePower}
        label="Tower Resonance"
        iconPath={towerObeliskImage}
      />
      <Item
        value={donated}
        label="Donated Fractaline"
        iconPath={fractalineImage2}
      />
      <Item
        value={fractalineInInventory}
        label="Fractaline in Inventory"
        iconPath={fractalineImage}
      />
      <Item
        value={lightFusedFractalineInInventory}
        label="Light-Fused Fractaline"
        iconPath={lightFusedFractaline}
      />
    </div>
  );
};
