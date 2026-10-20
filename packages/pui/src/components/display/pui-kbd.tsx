import { Kbd, KbdGroup } from "pui/ui/kbd";

type PuiKbdProps = { keys: string[]; className?: string };

// Keyboard shortcut, e.g. keys={["⌘", "K"]}
export function PuiKbd({ keys, className }: PuiKbdProps) {
  return (
    <KbdGroup className={className}>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}
