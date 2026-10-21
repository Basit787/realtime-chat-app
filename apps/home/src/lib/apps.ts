import { serviceUrl } from "ports";
import { Images, Link2, MessageCircle, type LucideIcon } from "lucide-react";

export type AppEntry = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
};

// Every project reachable from home; add new apps here
export const APPS: AppEntry[] = [
  {
    id: "chat",
    name: "Chat Application",
    description: "Messages, groups, file sharing and audio/video calls.",
    // Same host the launcher was opened from (localhost, 192.168.x.x, ...)
    url: serviceUrl("chatAppFrontend"),
    icon: MessageCircle,
  },
  {
    id: "link-shortener",
    name: "Link Shortener",
    description: "Create short links and track their clicks.",
    url: serviceUrl("linkShortener"),
    icon: Link2,
  },
  {
    id: "image-upload",
    name: "Image Upload",
    description: "Upload, browse and delete your images.",
    url: serviceUrl("imageUploadFrontend"),
    icon: Images,
  },
];
