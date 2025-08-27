import { useEffect } from "react";

interface IframeScrollPayload {
  method: "wheel" | "touch" | "key";
  deltaX?: number;
  deltaY?: number;
  key?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

/**
 * Custom hook to handle scroll event forwarding from iframe to parent window
 * This captures wheel, touch, and keyboard scroll events and forwards them to the parent page
 */
export const useScrollForwarding = () => {
  useEffect(() => {
    const parentOrigin = "https://waterlooworks.uwaterloo.ca/*";

    const sendScroll = (payload: IframeScrollPayload) => {
      window.parent.postMessage(
        { type: "IFRAME_SCROLL", payload },
        parentOrigin
      );
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sendScroll({
        method: "wheel",
        deltaX: e.deltaX || 0,
        deltaY: e.deltaY || 0,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      });
    };

    let lastTouchX = 0;
    let lastTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const deltaX = lastTouchX - x;
      const deltaY = lastTouchY - y;
      lastTouchX = x;
      lastTouchY = y;
      e.preventDefault();
      sendScroll({ method: "touch", deltaX, deltaY });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowDown",
        "ArrowUp",
        "ArrowLeft",
        "ArrowRight",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ];
      if (!scrollKeys.includes(e.key)) return;
      e.preventDefault();
      sendScroll({
        method: "key",
        key: e.key,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
      });
    };

    // Add event listeners
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
};
