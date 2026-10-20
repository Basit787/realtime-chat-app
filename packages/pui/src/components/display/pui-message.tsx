import type { ReactNode } from "react";
import { Bubble, BubbleContent } from "pui/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "pui/ui/message";

type PuiMessageProps = {
  children: ReactNode;
  // "end" for the current user's own messages
  align?: "start" | "end";
  avatar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

// Chat message: avatar, optional name/time, and the text in a bubble
export function PuiMessage({ children, align = "start", avatar, header, footer, className }: PuiMessageProps) {
  return (
    <Message align={align} className={className}>
      {avatar && <MessageAvatar>{avatar}</MessageAvatar>}
      <MessageContent>
        {header && <MessageHeader>{header}</MessageHeader>}
        <Bubble align={align}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
        {footer && <MessageFooter>{footer}</MessageFooter>}
      </MessageContent>
    </Message>
  );
}
