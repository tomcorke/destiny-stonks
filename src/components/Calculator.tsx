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
import { CheckPanel } from "./CheckPanel";

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
  d.setUTCMilliseconds(0);
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  while (d < toDate) {
    if (d < toDate) {
      results.push(d);
    }
    // Don't use addDays because it does things that are too clever with daylight savings time
    d = new Date(d.getTime() + SEVEN_DAYS);
  }
  return results;
};

const locale = getLocale();

interface CalculatorProps {
  isAuthed: boolean;
  donationData?: DonationData;
  fromDate: Date;
  toggleInitialHasCollectedTowerFractaline?: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const Calculator = ({
  isAuthed,
  donationData,
  fromDate,
  toggleInitialHasCollectedTowerFractaline,
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
  }, 1000 * 60);

  const resetsRemaining = getResetsUntil(fromDate, lastResetDate);

  const clone = <T extends object>(data: T): T =>
    JSON.parse(JSON.stringify(data)) as T;

  const getTotalObeliskLevel = (data: DonationData) =>
    data.obeliskLevels.edz +
    data.obeliskLevels.mars +
    data.obeliskLevels.nessus +
    data.obeliskLevels.tangledShore;

  const getResonancePower = (totalObeliskLevel: number) =>
    totalObeliskLevel * 100 + 200;

  const calculateInvestment = (
    data: DonationData,
    checkCollected = false
  ): DonationData => {
    const d = clone(data);
    let fractalineToUse = d.resonancePower + d.fractalineInInventory;
    if (checkCollected && d.hasCollectedTowerFractaline) {
      fractalineToUse = d.fractalineInInventory;
    }
    let addRanks = Math.floor(fractalineToUse / 200);
    const remainingFractaline = fractalineToUse - addRanks * 200;
    addRanks += d.lightFusedFractalineInInventory;

    const totalObeliskLevel = getTotalObeliskLevel(d);
    const newObeliskLevel = totalObeliskLevel + addRanks;
    const newResonancePower = getResonancePower(newObeliskLevel);

    return {
      ...d,
      obeliskLevels: {
        edz: newObeliskLevel,
        mars: 0,
        nessus: 0,
        tangledShore: 0,
      },
      fractalineInInventory: remainingFractaline,
      lightFusedFractalineInInventory: 0,
      resonancePower: newResonancePower,
      hasCollectedTowerFractaline: false,
    };
  };

  const calculateDonation = (
    data: DonationData,
    checkCollected = false
  ): DonationData => {
    const d = clone(data);
    let useResonancePower = d.resonancePower;
    if (d.lightFusedFractalineInInventory > 0) {
      const newObeliskLevel =
        getTotalObeliskLevel(d) + d.lightFusedFractalineInInventory;
      d.resonancePower = getResonancePower(newObeliskLevel);
      if (checkCollected && !d.hasCollectedTowerFractaline) {
        useResonancePower = d.resonancePower;
      }
      d.obeliskLevels = {
        edz: newObeliskLevel,
        mars: 0,
        nessus: 0,
        tangledShore: 0,
      };
    }
    let fractalineToUse = useResonancePower + d.fractalineInInventory;
    if (checkCollected && d.hasCollectedTowerFractaline) {
      fractalineToUse = d.fractalineInInventory;
    }
    const eligibleFractaline = Math.floor(fractalineToUse / 100) * 100;
    const remaining = fractalineToUse - eligibleFractaline;
    return {
      ...d,
      donatedFractaline: d.donatedFractaline + eligibleFractaline,
      fractalineInInventory: remaining,
      lightFusedFractalineInInventory: 0,
      hasCollectedTowerFractaline: false,
    };
  };

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
                +
                {numeral(
                  totalObeliskLevel - getTotalObeliskLevel(lastData)
                ).format("0,0")}
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
                +
                {numeral(data.resonancePower - lastData.resonancePower).format(
                  "0,0"
                )}
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
                +
                {numeral(
                  data.donatedFractaline - lastData.donatedFractaline
                ).format("0,0")}
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
        {data.lightFusedFractalineInInventory > 0 ? (
          <div>
            Light-Fused Fractaline in inventory:{" "}
            {numeral(data.lightFusedFractalineInInventory).format("0,0")}
          </div>
        ) : null}
        {data.hasCollectedTowerFractaline ? (
          <div className={STYLES.alreadyCollectedMessage}>
            You&apos;ve already collected your tower fractaline this week, so
            only the fractaline in your inventory will be used for investment
            calculation.
          </div>
        ) : null}
      </>
    );
  };

  const DONATE_RESETS = 3;

  type FractalineAction = "invest" | "donate";
  const [actionOverrides, setActionOverrides] = useState<{
    [key: number]: FractalineAction | undefined;
  }>({});
  const getFractalineAction = (
    resetIndex: number,
    ignoreOverrides = false
  ): FractalineAction => {
    const override = actionOverrides[resetIndex];
    if (override && !ignoreOverrides) {
      return override;
    }
    if (resetIndex <= 0 - DONATE_RESETS) {
      return "invest";
    }
    return "donate";
  };

  const toggleFractalineAction = (resetIndex: number) => {
    const action = getFractalineAction(resetIndex);
    const newAction = action === "donate" ? "invest" : "donate";
    setActionOverrides({
      ...actionOverrides,
      [resetIndex]: newAction,
    });
  };

  const resetList: (JSX.Element | string)[] = [];
  if (donationData) {
    let data = donationData;
    let lastData: DonationData | undefined;

    if (resetsRemaining.length > 0) {
      const resetIndex = 0 - resetsRemaining.length;
      const action = getFractalineAction(resetIndex);
      const currentReset = (
        <ResetPanel
          key="current"
          header="This week"
          content={
            <>
              {summaryDisplay(data)}
              <CheckPanel
                checked={data.hasCollectedTowerFractaline}
                onClick={() => toggleInitialHasCollectedTowerFractaline?.()}
              >
                Check here if you&apos;ve already collected your Generated
                Fractaline from the Tower this week
              </CheckPanel>
            </>
          }
          suggestedAction={action}
          onActionClick={() => toggleFractalineAction(resetIndex)}
        />
      );
      resetList.push(currentReset);
      lastData = clone(data);
      data =
        action === "donate"
          ? calculateDonation(data, true)
          : calculateInvestment(data, true);
    }

    if (resetsRemaining.length > 1) {
      for (let i = 0; i < resetsRemaining.length; i++) {
        const resetStart = resetsRemaining[i];
        // const resetEnd = addDays(resetStart, 7);
        const resetIndex = 1 - (resetsRemaining.length - i);
        const action = getFractalineAction(resetIndex);
        resetList.push(
          <ResetPanel
            key={resetStart.toISOString()}
            header={`Week beginning ${resetStart.toLocaleDateString()}`}
            content={
              <>
                {summaryDisplay(data, lastData)}
                {resetIndex === -2 ? (
                  <div className={STYLES.donateOrInvestChoice}>
                    <div>{`You can donate or invest this week, without affecting your
                    end total donated. If you reinvest your Fractaline you'll get back extra
                    legendary items and shaders from the obelisks, but it's more
                    clicking overall.`}</div>
                    <div>{`It's up to you! Click "DONATE" or "INVEST"
                    to see how your action this week affects following weeks.`}</div>
                  </div>
                ) : null}
              </>
            }
            suggestedAction={action === "donate" ? "donate" : "invest"}
            onActionClick={() => toggleFractalineAction(resetIndex)}
          />
        );
        lastData = clone(data);
        data =
          action === "donate"
            ? calculateDonation(data)
            : calculateInvestment(data);
      }
    }

    const lastDelta = lastData
      ? data.donatedFractaline - lastData.donatedFractaline
      : null;

    resetList.push(
      <ResetPanel
        key="end"
        header="End of Season of Dawn"
        content={
          <>
            Total fractaline donated: {data.donatedFractaline}
            {lastDelta ? (
              <>
                {" "}
                (
                <span className={STYLES.statDelta}>
                  +{numeral(lastDelta).format("0,0")}
                </span>
                )
              </>
            ) : null}
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
              fractalineInInventory={donationData.fractalineInInventory}
              lightFusedFractalineInInventory={
                donationData.lightFusedFractalineInInventory
              }
            />
          </>
        ) : isAuthed ? (
          <div>Fetching donation data...</div>
        ) : null}

        <div>Current date: {fromDate.toLocaleDateString()}</div>
        <div>Season of Dawn ends: {relativeDateString}</div>

        {getFractalineAction(0 - resetsRemaining.length, true) === "donate" ? (
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
