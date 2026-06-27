import { useEffect, useRef } from "react";

const playRingTone = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(660, now + 0.2);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.45);
};

export const useIncomingCallAlerts = (active: boolean, title: string, body: string) => {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      notifiedRef.current = false;
      return;
    }

    let audioContext: AudioContext | null = null;
    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      audioContext = new AudioContext();
      const ring = () => {
        if (audioContext?.state === "suspended") void audioContext.resume();
        if (audioContext) playRingTone(audioContext);
      };
      ring();
      interval = setInterval(ring, 1400);
    } catch {
      // Audio may be blocked until user gesture; overlay still shows.
    }

    if (document.hidden && !notifiedRef.current && "Notification" in window) {
      notifiedRef.current = true;
      const show = () => {
        try {
          new Notification(title, { body, tag: "incoming-call" });
        } catch {
          // Ignore notification errors.
        }
      };

      if (Notification.permission === "granted") {
        show();
      } else if (Notification.permission !== "denied") {
        void Notification.requestPermission().then((permission) => {
          if (permission === "granted") show();
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      void audioContext?.close();
    };
  }, [active, body, title]);
};
