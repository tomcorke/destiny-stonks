import React from "react";

import STYLES from "./App.module.scss";
import Calculator from "./components/Calculator";

const App = () => {
  return (
    <div className={STYLES.App}>
      <Calculator />
    </div>
  );
};

export default App;
