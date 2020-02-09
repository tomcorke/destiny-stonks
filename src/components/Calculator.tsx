import React, { useState } from "react";
import useInterval from "@use-it/interval";
import formatRelative from "date-fns/formatRelative";
import addDays from "date-fns/addDays";
import numeral from "numeral";
import * as locales from "date-fns/locale";
import { Locale } from "date-fns";

import STYLES from "./Calculator.module.scss";
import { DonationData } from "../types";
import { ResetPanel } from "./ResetPanel";
import { ObeliskDisplay } from "./ObeliskDisplay";
import { TowerDisplay } from "./TowerDisplay";

const getLocale = () => {
  const userLocale = navigator.language;
  const normalisedUserLocale = userLocale.replace("-", "");
  if (normalisedUserLocale in locales) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (locales as any)[normalisedUserLocale] as Locale;
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
  donationData?: DonationData;
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

  const clone = <T extends object>(data: T): T =>
    JSON.parse(JSON.stringify(data)) as T;

  const calculateInvestment = (
    data: DonationData,
    checkCollected = false
  ): DonationData => {
    let fractalineToUse = data.resonancePower + data.fractalineInInventory;
    if (checkCollected && data.hasCollectedTowerFractaline) {
      fractalineToUse = data.fractalineInInventory;
    }
    let addRanks = Math.floor(fractalineToUse / 200);
    const remainingFractaline = fractalineToUse - addRanks * 200;
    addRanks += data.lightInfusedFractalineInInventory;

    const totalObeliskLevel =
      data.obeliskLevels.edz +
      data.obeliskLevels.mars +
      data.obeliskLevels.nessus +
      data.obeliskLevels.tangledShore;
    const newObeliskLevel = totalObeliskLevel + addRanks;
    const newResonancePower = newObeliskLevel * 100 + 200;

    return {
      obeliskLevels: {
        edz: newObeliskLevel,
        mars: 0,
        nessus: 0,
        tangledShore: 0,
      },
      donatedFractaline: data.donatedFractaline,
      fractalineInInventory: remainingFractaline,
      lightInfusedFractalineInInventory: 0,
      resonancePower: newResonancePower,
      hasCollectedTowerFractaline: false,
    };
  };

  const calculateDonation = (
    data: DonationData,
    checkCollected = false
  ): DonationData => {
    if (checkCollected && data.hasCollectedTowerFractaline) {
      return data;
    }
    return {
      ...data,
      donatedFractaline: data.donatedFractaline + data.resonancePower,
    };
  };

  const getTotalObeliskLevel = (data: DonationData) =>
    data.obeliskLevels.edz +
    data.obeliskLevels.mars +
    data.obeliskLevels.nessus +
    data.obeliskLevels.tangledShore;

  const summaryDisplay = (data: DonationData, lastData?: DonationData) => {
    const totalObeliskLevel =
      data.obeliskLevels.edz +
      data.obeliskLevels.mars +
      data.obeliskLevels.nessus +
      data.obeliskLevels.tangledShore;
    return (
      <>
        <div>
          Total obelisk level: {numeral(totalObeliskLevel).format("0,0")}
          {lastData && totalObeliskLevel > getTotalObeliskLevel(lastData) ? (
            <>
              {" "}
              (
              <span className={STYLES.statDelta}>
                +{totalObeliskLevel - getTotalObeliskLevel(lastData)}
              </span>
              )
            </>
          ) : null}
        </div>
        <div>
          Tower resonance: {numeral(data.resonancePower).format("0,0")}
          {lastData && data.resonancePower > lastData.resonancePower ? (
            <>
              {" "}
              (
              <span className={STYLES.statDelta}>
                +{data.resonancePower - lastData.resonancePower}
              </span>
              )
            </>
          ) : null}
        </div>
        <div>
          Fractaline donated: {numeral(data.donatedFractaline).format("0,0")}
          {lastData && data.donatedFractaline > lastData.donatedFractaline ? (
            <>
              {" "}
              (
              <span className={STYLES.statDelta}>
                +{data.donatedFractaline - lastData.donatedFractaline}
              </span>
              )
            </>
          ) : null}
        </div>
        {data.fractalineInInventory > 200 ? (
          <div>
            Fractaline in inventory:{" "}
            {numeral(data.fractalineInInventory).format("0,0")}
          </div>
        ) : null}
        {data.lightInfusedFractalineInInventory > 0 ? (
          <div>
            Light-Infused Fractaline in inventory:{" "}
            {numeral(data.lightInfusedFractalineInInventory).format("0,0")}
          </div>
        ) : null}
        {data.hasCollectedTowerFractaline ? (
          <div>
            You&apos;ve already collected your tower fractaline this week, so
            only the fractaline in your inventory will be used for investment
            calculation.
          </div>
        ) : null}
      </>
    );
  };

  const resetList: (JSX.Element | string)[] = [];
  if (donationData) {
    let data = donationData;
    let lastData: DonationData | undefined;

    if (resetsRemaining.length > 0) {
      const currentReset = (
        <ResetPanel
          key="current"
          header="This week"
          content={summaryDisplay(donationData)}
          suggestedAction={shouldDonate ? "donate" : "invest"}
        />
      );
      resetList.push(currentReset);
      lastData = clone(data);
      data = shouldDonate
        ? calculateDonation(data, true)
        : calculateInvestment(data, true);
    }

    if (resetsRemaining.length > 1) {
      for (let i = 0; i < resetsRemaining.length; i++) {
        const resetStart = resetsRemaining[i];
        // const resetEnd = addDays(resetStart, 7);
        const donateThisWeek = resetsRemaining.length - i <= DONATE_RESETS;
        resetList.push(
          <ResetPanel
            key={resetStart.toISOString()}
            header={`Week beginning ${resetStart.toLocaleDateString()}`}
            content={summaryDisplay(data, lastData)}
            suggestedAction={donateThisWeek ? "donate" : "invest"}
          />
        );
        lastData = clone(data);
        data = donateThisWeek
          ? calculateDonation(data)
          : calculateInvestment(data);
      }
    }

    resetList.push(
      <ResetPanel
        key="end"
        header="End of Season of Dawn"
        content={
          <>
            Total fractaline donated: {data.donatedFractaline} (
            <span className={STYLES.statDelta}>+{data.resonancePower}</span>)
          </>
        }
      />
    );
  }

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
          <div className={STYLES.donateHint}>
            {timeUntil === 1 ? timeUnit : timeUnits} remaining to donate
            Fractaline: {numeral(timeUntil).format("0,0")}
          </div>
        ) : (
          <div className={STYLES.dontDonateWarning}>
            Don&apos;t donate your fractaline yet!
            <br />
            Invest it into obelisks for until the last 3 resets of the season
            for maximum fractaline returns.
          </div>
        )}
        <div className={STYLES.resetList}>{resetList}</div>
      </div>
    </div>
  );
};
