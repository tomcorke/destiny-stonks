import EventEmitter from "events";
import { useEffect, useRef } from "react";

export enum EVENTS {
  GET_MANIFEST = "GET_MANIFEST",
  LOAD_MANIFEST_DATA = "LOAD_MANIFEST_DATA",
  FETCH_MANIFEST_DATA = "FETCH_MANIFEST_DATA",
  PARSE_MANIFEST_DATA = "PARSE_MANIFEST_DATA",
  STORE_MANIFEST_DATA = "STORE_MANIFEST_DATA",
  MANIFEST_DATA_READY = "MANIFEST_DATA_READY",
  MANIFEST_FETCH_ERROR = "MANIFEST_FETCH_ERROR",

  UNAUTHED_FETCH_ERROR = "UNAUTHED_FETCH_ERROR",

  LOG_OUT = "LOG_OUT",
}

const eventEmitter = new EventEmitter();

export default eventEmitter;

type EventHandler<T extends object[]> = (args: T) => void;

function useEvent<T extends object[]>(
  eventName: EVENTS,
  handler: EventHandler<T>
) {
  const savedHandler = useRef<EventHandler<T>>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (eventData: T) => savedHandler.current?.(eventData);
    eventEmitter.addListener(eventName, eventListener);
    return () => {
      eventEmitter.removeListener(eventName, eventListener);
    };
  }, [eventName]);
}

export { useEvent };
