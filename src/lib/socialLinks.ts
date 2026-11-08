import type { IconType } from "react-icons";
import { LuGithub, LuInstagram, LuLinkedin, LuTwitter } from "react-icons/lu";

export interface SocialLink {
    label: string;
    href: string;
    Icon: IconType;
}

// Lucide only. Lucide has no X wordmark, so X uses its Twitter glyph.
export const SOCIAL_LINKS: SocialLink[] = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mbugua-kamande-a796bb156/", Icon: LuLinkedin },
    { label: "GitHub", href: "https://github.com/blackswanalpha", Icon: LuGithub },
    { label: "X", href: "https://x.com/mbugua_kamande", Icon: LuTwitter },
    { label: "Instagram", href: "https://www.instagram.com/mbugua_kamande/", Icon: LuInstagram },
];
