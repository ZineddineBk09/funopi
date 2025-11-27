import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Funopi",
  description:
    "Learn how Funopi curates random, iframe-friendly web toys and experiences that deliver instant boredom relief with every press.",
};

export default function AboutPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
