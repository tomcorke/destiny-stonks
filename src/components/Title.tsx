import React from "react";

import STYLES from "./Title.module.scss";

import fractalineImage from "../images/fractaline_trans_2.png";

export const Title = () => (
  <h1 className={STYLES.Title}>
    <img alt="Fractaline stonks" src={fractalineImage} />
    Fractaline Stonks
  </h1>
);
