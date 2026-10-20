import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "pui/ui/sidebar";

export type PuiSidebarItem = {
  title: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: ReactNode;
};

type PuiSidebarLayoutProps = {
  sections: { label?: ReactNode; items: PuiSidebarItem[] }[];
  header?: ReactNode;
  footer?: ReactNode;
  // Page content next to the sidebar
  children: ReactNode;
  defaultOpen?: boolean;
};

// App shell: collapsible sidebar with grouped links, plus the page content
export function PuiSidebarLayout({ sections, header, footer, children, defaultOpen }: PuiSidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        {header && <SidebarHeader>{header}</SidebarHeader>}
        <SidebarContent>
          {sections.map((section, sectionIndex) => (
            <SidebarGroup key={sectionIndex}>
              {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild={!!item.href}
                        isActive={item.isActive}
                        tooltip={item.title}
                        onClick={item.onClick}
                      >
                        {item.href ? (
                          <a href={item.href}>
                            {item.icon}
                            <span>{item.title}</span>
                          </a>
                        ) : (
                          <>
                            {item.icon}
                            <span>{item.title}</span>
                          </>
                        )}
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center border-b px-3">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
