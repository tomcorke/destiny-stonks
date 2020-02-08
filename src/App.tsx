import React, { useState, useEffect } from "react";
import throttle from "lodash/throttle";

import STYLES from "./App.module.scss";
import Calculator from "./components/Calculator";

import {
  auth,
  hasManuallyAuthed,
  hasValidAuth,
  manualStartAuth,
  getSelectedDestinyMembership,
  logOut,
} from "./services/bungie-auth";
import { EVENTS, useEvent } from "./services/events";
import { Title } from "./components/Title";
import { getFullProfile } from "./services/bungie-api";
import {
  DestinyProfileResponse,
  DestinyCharacterProgressionComponent,
  DestinyFactionProgression,
  DestinyProgression,
  DestinyItemComponent,
} from "bungie-api-ts/destiny2";
import { DonationData } from "./types";
import {
  EDZ_OBELISK_FACTION_HASH,
  MARS_OBELISK_FACTION_HASH,
  NESSUS_OBELISK_FACTION_HASH,
  TANGLED_SHORE_OBELISK_FACTION_HASH,
  DONATED_FRACTALINE_PROGRESSION_HASH,
  FRACTALINE_INVENTORY_ITEM_HASH,
  LIGHT_INFUSED_FRACTALINE_INVENTORY_ITEM_HASH,
} from "./constants";

const doAuth = throttle(
  (
    setIsAuthed: (value: boolean) => void,
    setAuthError: (value: boolean) => void
  ) => {
    (async () => {
      try {
        const authResult = await auth();
        if (authResult) {
          setIsAuthed(true);
          setAuthError(false);
        } else {
          setIsAuthed(false);
          setAuthError(true);
        }
      } catch (e) {
        console.error(e);
        setIsAuthed(false);
        setAuthError(true);
      }
    })();
  },
  100
);

const App = () => {
  const [isAuthed, setIsAuthed] = useState(hasValidAuth());
  const [hasAuthError, setHasAuthError] = useState(false);
  const _hasManuallyAuthed = hasManuallyAuthed();
  const selectedMembership = getSelectedDestinyMembership();

  useEffect(() => {
    doAuth(setIsAuthed, setHasAuthError);
  }, []);

  const [isBungieSystemDisabled, setBungieSystemDisabled] = useState(false);
  const [isBungieServiceUnavailable, setBungieServiceUnavailable] = useState(
    false
  );

  const [profileData, setProfileData] = useState<
    DestinyProfileResponse | undefined
  >(undefined);
  useEffect(() => {
    (async () => {
      if (isAuthed) {
        try {
          const membership = await getSelectedDestinyMembership();
          const profileResponse = await getFullProfile(
            membership.membershipType,
            membership.membershipId
          );
          if (profileResponse.ErrorStatus === "SystemDisabled") {
            return setBungieSystemDisabled(true);
          }
          setProfileData(profileResponse.Response);
        } catch (e) {
          if (e.message === "401") {
            setIsAuthed(false);
            doAuth(setIsAuthed, setHasAuthError);
          }
        }
      }
    })();
  }, [isAuthed, setIsAuthed, setHasAuthError, setBungieSystemDisabled]);

  const [donationData, setDonationData] = useState<DonationData | undefined>(
    undefined
  );

  useEffect(() => {
    const characterProgressions = profileData?.characterProgressions?.data;
    const profileInventory = profileData?.profileInventory?.data;
    if (characterProgressions && profileInventory) {
      const flatProgressions = Object.keys(characterProgressions).reduce(
        (allProgressions, characterId) =>
          allProgressions.concat(characterProgressions[characterId]),
        [] as DestinyCharacterProgressionComponent[]
      );

      const findFaction = (hash: string): DestinyFactionProgression | null => {
        for (const p of flatProgressions) {
          if (p.factions[hash]) {
            return p.factions[hash];
          }
        }
        return null;
      };

      const findProgression = (hash: string): DestinyProgression | null => {
        for (const p of flatProgressions) {
          if (p.progressions[hash]) {
            return p.progressions[hash];
          }
        }
        return null;
      };

      const findInventory = (hash: number): DestinyItemComponent | null => {
        return profileInventory.items.find(item => item.itemHash === hash);
      };

      try {
        const edzProgress = findFaction(EDZ_OBELISK_FACTION_HASH);
        const marsProgress = findFaction(MARS_OBELISK_FACTION_HASH);
        const nessusProgress = findFaction(NESSUS_OBELISK_FACTION_HASH);
        const tangledProgress = findFaction(TANGLED_SHORE_OBELISK_FACTION_HASH);
        const donationProgress = findProgression(
          DONATED_FRACTALINE_PROGRESSION_HASH
        );
        const inventoryFractaline = findInventory(
          FRACTALINE_INVENTORY_ITEM_HASH
        );
        const lightInfusedInventoryFractaline = findInventory(
          LIGHT_INFUSED_FRACTALINE_INVENTORY_ITEM_HASH
        );

        setDonationData({
          obeliskLevels: {
            edz: edzProgress.level,
            mars: marsProgress.level,
            nessus: nessusProgress.level,
            tangledShore: tangledProgress.level,
          },
          donatedFractaline: donationProgress.level,
          fractalineInInventory: inventoryFractaline?.quantity || 0,
          lightInfusedFractalineInInventory:
            lightInfusedInventoryFractaline?.quantity || 0,
          hasCollectedTowerFractaline: false,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [profileData]);

  useEvent(EVENTS.LOG_OUT, () => {
    setIsAuthed(false);
    setDonationData(undefined);
  });

  return (
    <div className={STYLES.App}>
      <Title />
      <div className={STYLES.auth}>
        {isAuthed && selectedMembership ? (
          <>
            <div>Logged in as {selectedMembership.displayName}</div>
            <button className={STYLES.logOut} onClick={logOut}>
              Log out
            </button>
          </>
        ) : null}
        {!isAuthed && !_hasManuallyAuthed ? (
          <button className={STYLES.logIn} onClick={manualStartAuth}>
            Log in
          </button>
        ) : null}
      </div>
      <Calculator isAuthed={isAuthed} donationData={donationData} />
    </div>
  );
};

export default App;
