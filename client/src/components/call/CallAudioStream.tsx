import { useEffect, useRef } from "react";

type CallAudioStreamProps = {
  stream: MediaStream | null;
};

export const CallAudioStream = ({ stream }: CallAudioStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.srcObject = stream;
    if (!stream) return;

    const play = () => {
      void audio.play().catch(() => {
        // Autoplay may require a user gesture; accept/hang-up buttons usually satisfy this.
      });
    };

    play();
    stream.getAudioTracks().forEach((track) => {
      track.onunmute = play;
    });

    return () => {
      audio.srcObject = null;
    };
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline className="sr-only" aria-hidden />;
};
