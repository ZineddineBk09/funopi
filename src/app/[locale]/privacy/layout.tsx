import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funopi Privacy Policy",
  description:
    "Understand how Funopi uses cookies, analytics, and security best practices to protect your instant-play sessions.",
};

export default function PrivacyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return { children };
}
