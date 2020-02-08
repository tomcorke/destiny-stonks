import React, { useState } from "react";
import useInterval from "@use-it/interval";
import formatRelative from "date-fns/formatRelative";
import addDays from "date-fns/addDays";
import numeral from "numeral";
import * as locales from "date-fns/locale";

import STYLES from "./Calculator.module.scss";
import { DonationData } from "../types";
import { ResetPanel } from "./ResetPanel";
import { ObeliskDisplay } from "./ObeliskDisplay";
import { TowerDisplay } from "./TowerDisplay";

const getLocale = () => {
  const userLocale = navigator.language;
  const normalisedUserLocale = userLocale.replace("-", "");
  if (normalisedUserLocale in locales) {
    return locales[normalisedUserLocale];
  }
  return locales.enUS;
};

const secondsUntil = (fromDate: Date, toDate: Date) => {
  const fromTime = fromDate.getTime();
  return Math.floor(Math.max(0, toDate.getTime() - fromTime) / 1000);
};
const minutesUntil = (fromDate: Date, toDate: Date) =>
  Math.floor(secondsUntil(fromDate, toDate) / 60);
const hoursUntil = (fromDate: Date, toDate: Date) =>
  Math.floor(minutesUntil(fromDate, toDate) / 60);
const daysUntil = (fromDate: Date, toDate: Date) =>
  Math.floor(hoursUntil(fromDate, toDate) / 24);
const weeksUntil = (fromDate: Date, toDate: Date) =>
  Math.floor(daysUntil(fromDate, toDate) / 7);

const getResetsUntil = (fromDate: Date, toDate: Date) => {
  const day = fromDate.getUTCDay();
  const results: Date[] = [];
  let d = fromDate;
  if (day < 2) {
    d = addDays(d, 2 - day);
  } else {
    d = addDays(d, 7 - day + 2);
  }
  d.setUTCHours(17);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  while (d < toDate) {
    if (d < toDate) {
      results.push(d);
    }
    d = addDays(d, 7);
  }
  return results;
};

const locale = getLocale();

interface CalculatorProps {
  isAuthed: boolean;
  donationData?: DonationData | null;
  fromDate: Date;
}

export const Calculator = ({
  isAuthed,
  donationData,
  fromDate,
}: CalculatorProps) => {
  const lastResetDate = new Date(Date.UTC(2020, 2, 10, 17, 0, 0, 0));
  const relativeDateString = formatRelative(lastResetDate, fromDate.getTime(), {
    locale,
  });

  const [[timeUntil, timeUnit, timeUnits], setTimeRemaining] = useState<
    [number, string, string]
  >([0, "Day", "Days"]);
  useInterval(() => {
    const weeks = weeksUntil(fromDate, lastResetDate);
    if (weeks > 0) {
      return setTimeRemaining([weeks, "Week", "Weeks"]);
    }
    const days = daysUntil(fromDate, lastResetDate);
    if (days > 0) {
      return setTimeRemaining([days, "Day", "Days"]);
    }
    const hours = hoursUntil(fromDate, lastResetDate);
    if (hours > 0) {
      return setTimeRemaining([hours, "Hour", "Hours"]);
    }
    const minutes = minutesUntil(fromDate, lastResetDate);
    if (minutes > 0) {
      return setTimeRemaining([minutes, "Minute", "Minutes"]);
    }
    const seconds = secondsUntil(fromDate, lastResetDate);
    return setTimeRemaining([seconds, "Second", "Seconds"]);
  }, 1000);

  const resetsRemaining = getResetsUntil(fromDate, lastResetDate);

  const DONATE_RESETS = 3;
  const shouldDonate = resetsRemaining.length + 1 <= DONATE_RESETS;

  const resetList: (JSX.Element | string)[] = [];
  if (resetsRemaining.length > 0) {
    const currentReset = (
      <ResetPanel
        key="current"
        header="This week"
        content={`${shouldDonate ? "DONATE!" : "INVEST!"}`}
      />
    );
    resetList.push(currentReset);
  }
  if (resetsRemaining.length > 1) {
    for (let i = 0; i < resetsRemaining.length; i++) {
      const resetStart = resetsRemaining[i];
      // const resetEnd = addDays(resetStart, 7);
      resetList.push(
        <ResetPanel
          key={resetStart.toISOString()}
          header={`Week beginning ${resetStart.toLocaleDateString()}`}
          content={`${
            resetsRemaining.length - i <= DONATE_RESETS ? "DONATE!" : "INVEST!"
          }`}
        />
      );
    }
  }
  resetList.push(
    <ResetPanel
      key="after"
      header="After that..."
      content="Season of Dawn is over!"
    />
  );

  return (
    <div className={STYLES.Calculator}>
      <div className={STYLES.spacedElements}>
        {donationData ? (
          /* <pre>{JSON.stringify(donationData, null, 2)}</pre>*/
          <>
            <ObeliskDisplay obeliskLevels={donationData.obeliskLevels} />
            <TowerDisplay
              resonancePower={donationData.resonancePower}
              donated={donationData.donatedFractaline}
              collected={donationData.hasCollectedTowerFractaline}
            />
          </>
        ) : isAuthed ? (
          <div>Fetching donation data...</div>
        ) : null}
        <div>Current date: {fromDate.toLocaleDateString()}</div>
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
        <div className={STYLES.resetList}>{resetList}</div>
      </div>
    </div>
  );
};
