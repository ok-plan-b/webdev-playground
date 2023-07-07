import { useEffect } from 'react';

const EVENT = 'mousedown';

export const useClickAway = (ref: any, callback: any) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref || !ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };
    document.addEventListener(EVENT, listener);
    return () => {
      document.removeEventListener(EVENT, listener);
    };
  }, [ref, callback]);
};