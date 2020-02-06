import React, { useState } from "react";
import useInterval from "@use-it/interval";
import formatRelative from "date-fns/formatRelative";
import addDays from "date-fns/addDays";
import numeral from "numeral";
import * as locales from "date-fns/locale";

import STYLES from "./Calculator.module.scss";

import fractalineImage from "../images/fractaline_trans_2.png";

const getLocale = () => {
  const userLocale = navigator.language;
  const normalisedUserLocale = userLocale.replace("-", "");
  if (normalisedUserLocale in locales) {
    return locales[normalisedUserLocale];
  }
  return locales.enUS;
};

const secondsUntil = (date: Date) => {
  const now = new Date().getTime();
  return Math.floor(Math.max(0, date.getTime() - now) / 1000);
};
const minutesUntil = (date: Date) => Math.floor(secondsUntil(date) / 60);
const hoursUntil = (date: Date) => Math.floor(minutesUntil(date) / 60);
const daysUntil = (date: Date) => Math.floor(hoursUntil(date) / 24);
const weeksUntil = (date: Date) => Math.floor(daysUntil(date) / 7);

const getResetsUntil = (date: Date) => {
  const now = new Date();
  const day = now.getUTCDay();
  const results: Date[] = [];
  let d = now;
  if (day < 2) {
    d = addDays(d, 7);
  }
  d = addDays(d, 2 - day);
  d.setUTCHours(17);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  while (d < date) {
    d = addDays(d, 7);
    if (d < date) {
      results.push(d);
    }
  }
  return results;
};

const locale = getLocale();
console.log(locale);

const Calculator = () => {
  const lastResetDate = new Date(Date.UTC(2020, 2, 10, 17, 0, 0, 0));
  const relativeDateString = formatRelative(
    lastResetDate,
    new Date().getTime(),
    locale
  );

  const [[timeUntil, timeUnit, timeUnits], setTimeRemaining] = useState<
    [number, string, string]
  >([0, "Day", "Days"]);
  useInterval(() => {
    const weeks = weeksUntil(lastResetDate);
    if (weeks > 0) {
      return setTimeRemaining([weeks, "Week", "Weeks"]);
    }
    const days = daysUntil(lastResetDate);
    if (days > 0) {
      return setTimeRemaining([days, "Day", "Days"]);
    }
    const hours = hoursUntil(lastResetDate);
    if (hours > 0) {
      return setTimeRemaining([hours, "Hour", "Hours"]);
    }
    const minutes = minutesUntil(lastResetDate);
    if (minutes > 0) {
      return setTimeRemaining([minutes, "Minute", "Minutes"]);
    }
    const seconds = secondsUntil(lastResetDate);
    return setTimeRemaining([seconds, "Second", "Seconds"]);
  }, 1000);

  const resetsRemaining = getResetsUntil(lastResetDate);

  const DONATE_RESETS = 3;
  const shouldDonate = resetsRemaining.length <= DONATE_RESETS;

  const resetList: (JSX.Element | string)[] = [];
  if (resetsRemaining.length > 0) {
    const currentReset = (
      <li>
        Current reset ends: {resetsRemaining[0].toLocaleDateString()} -{" "}
        {shouldDonate ? "DONATE!" : "INVEST!"}
      </li>
    );
    resetList.push(currentReset);
  }
  if (resetsRemaining.length > 1) {
    for (let i = 0; i < resetsRemaining.length; i++) {
      const resetStart = resetsRemaining[i];
      const resetEnd = addDays(resetStart, 7);
      resetList.push(
        <li>
          {resetStart.toLocaleDateString()} - {resetEnd.toLocaleDateString()} -{" "}
          {resetsRemaining.length - i <= DONATE_RESETS ? "DONATE!" : "INVEST!"}
        </li>
      );
    }
  }

  return (
    <div className={STYLES.Calculator}>
      <h1>
        <img alt="Fractaline stonks" src={fractalineImage} />
        Fractaline Stonks
      </h1>
      <div className={STYLES.spacedElements}>
        {/*<input type="text" className={STYLES.input} placeholder="stonks" />*/}
        <div>Season of Dawn ends: {relativeDateString}</div>
        {shouldDonate ? (
          <div>
            {timeUntil === 1 ? timeUnit : timeUnits} remaining to donate
            Fractaline: {numeral(timeUntil).format("0,0")}
          </div>
        ) : (
          <div>
            Don&apos;t donate! {resetsRemaining.length - DONATE_RESETS + 1}{" "}
            resets left to invest for optimal fractaline
          </div>
        )}
        <div className={STYLES.resetList}>
          <ul>{resetList}</ul>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
