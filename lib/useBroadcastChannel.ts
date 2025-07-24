/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useBroadcastChannel(
  channelName: string,
  onMessageReceived: (message: any) => void
) {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined" && typeof BroadcastChannel !== "undefined";
  
  const channel = useMemo(
    () => isBrowser ? getSingletonChannel(channelName) : null,
    [channelName, isBrowser]
  );
  const isSubscribed = useRef(false);

  useEffect(() => {
    if (!channel) return;
    
    if (!isSubscribed.current || process.env.NODE_ENV !== "development") {
      channel.onmessage = (event) => onMessageReceived(event.data);
    }
    return () => {
      if (isSubscribed.current || process.env.NODE_ENV !== "development") {
        channel.close();
        isSubscribed.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  const postMessage = useCallback(
    (message: any) => {
      if (channel) {
        channel.postMessage(message);
      }
    },
    [channel]
  );

  return {
    postMessage,
  };
}

const channelInstances: { [key: string]: BroadcastChannel } = {};

export const getSingletonChannel = (name: string): BroadcastChannel => {
  // Additional safety check
  if (typeof BroadcastChannel === "undefined") {
    throw new Error("BroadcastChannel is not available in this environment");
  }
  
  if (!channelInstances[name]) {
    channelInstances[name] = new BroadcastChannel(name);
  }
  return channelInstances[name];
};
