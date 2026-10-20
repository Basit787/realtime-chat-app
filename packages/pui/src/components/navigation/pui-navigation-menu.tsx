import type { ReactNode } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "pui/ui/navigation-menu";

type PuiNavLink = { title: ReactNode; href: string; description?: ReactNode };

type PuiNavigationMenuProps = {
  // A plain link (href) or a dropdown of links (items)
  items: { label: ReactNode; href?: string; items?: PuiNavLink[] }[];
  className?: string;
};

export function PuiNavigationMenu({ items, className }: PuiNavigationMenuProps) {
  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        {items.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.items ? (
              <>
                <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2">
                    {item.items.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <NavigationMenuLink asChild>
                          <a href={link.href}>
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            {link.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            )}
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <a href={item.href}>{item.label}</a>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
