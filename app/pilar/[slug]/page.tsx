import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPilar, PILARES } from "@/lib/data";
import { PilarPage } from "@/components/PilarPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return PILARES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${getPilar(slug)?.nome ?? "Pilar"} | Mapa Estratégico Cooplivre` };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getPilar(slug)) notFound();
  return <PilarPage slug={slug} />;
}
