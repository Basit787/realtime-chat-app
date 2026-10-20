import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "pui/ui/accordion";

type PuiAccordionItem = { value?: string; title: ReactNode; content: ReactNode; disabled?: boolean };

type PuiAccordionProps = {
  items: PuiAccordionItem[];
  // Allow several sections open at once
  multiple?: boolean;
  defaultValue?: string[];
  className?: string;
};

export function PuiAccordion({ items, multiple, defaultValue, className }: PuiAccordionProps) {
  const rows = items.map((item, index) => (
    <AccordionItem key={item.value ?? index} value={item.value ?? String(index)} disabled={item.disabled}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.content}</AccordionContent>
    </AccordionItem>
  ));
  return multiple ? (
    <Accordion type="multiple" defaultValue={defaultValue} className={className}>
      {rows}
    </Accordion>
  ) : (
    <Accordion type="single" collapsible defaultValue={defaultValue?.[0]} className={className}>
      {rows}
    </Accordion>
  );
}
