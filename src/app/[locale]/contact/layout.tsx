import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Funopi",
  description:
    "Get in touch with the Funopi team to suggest new experiences, report issues, or share feedback about the random play button.",
};

export default function ContactPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return { children };
}
