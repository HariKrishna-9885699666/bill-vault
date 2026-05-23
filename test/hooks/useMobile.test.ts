import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

let changeListeners: (() => void)[] = [];

function setupMatchMedia() {
  changeListeners = [];
  const mql = {
    matches: false,
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      changeListeners.push(cb);
    }),
    removeEventListener: vi.fn((_event: string, cb: () => void) => {
      changeListeners = changeListeners.filter((l) => l !== cb);
    }),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn(() => mql),
  });
  return mql;
}

function triggerResize() {
  changeListeners.forEach((cb) => cb());
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  it("returns true when innerWidth is below 768px", () => {
    setupMatchMedia();
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when innerWidth is 768px", () => {
    setupMatchMedia();
    setViewportWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns false when innerWidth is greater than 768px", () => {
    setupMatchMedia();
    setViewportWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when viewport resizes from desktop to mobile", () => {
    setupMatchMedia();
    setViewportWidth(1280); // start desktop
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      setViewportWidth(375); // resize to mobile
      triggerResize();
    });
    expect(result.current).toBe(true);
  });

  it("updates when viewport resizes from mobile to desktop", () => {
    setupMatchMedia();
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      setViewportWidth(1024);
      triggerResize();
    });
    expect(result.current).toBe(false);
  });

  it("removes the event listener on unmount", () => {
    const mql = setupMatchMedia();
    setViewportWidth(1280);
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledOnce();
  });
});
