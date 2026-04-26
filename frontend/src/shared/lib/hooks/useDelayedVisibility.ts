import { useEffect, useState } from "react";

export const useDelayedVisibility = (visible: boolean, delayMs = 200) => {
  const [delayedVisible, setDelayedVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDelayedVisible(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDelayedVisible(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [visible, delayMs]);

  return delayedVisible;
};
