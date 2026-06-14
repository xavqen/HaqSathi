import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Languages,
  Landmark,
  LockKeyhole,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FadeIn,
  MotionLink,
  MotionNumber,
  MotionSurface,
  SpotlightLink,
  SpotlightSurface,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import { Badge } from "@/components/ui/badge";
import { pricingPlans } from "@/lib/constants";
import { InstallPwaCard } from "@/components/layout/install-pwa";
import { getShellDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";
export const revalidate = 86400;

const heroTools = [
  {
    title: "Complaint Generator",
    desc: "Create formal complaint emails, support chat text and follow-up drafts.",
    href: "/complaint",
    icon: FileText,
  },
  {
    title: "UPI & Fraud Help",
    desc: "Get urgent action steps, bank message and evidence checklist.",
    href: "/upi-help",
    icon: ShieldAlert,
  },
  {
    title: "Scheme Finder",
    desc: "Find possible schemes, eligibility hints, documents and next steps.",
    href: "/scheme-finder",
    icon: Landmark,
  },
  {
    title: "Document Checklist",
    desc: "Prepare documents for certificates, scholarships, KYC and applications.",
    href: "/documents",
    icon: WalletCards,
  },
];

const commandCards = [
  {
    title: "Smart Wizard",
    href: "/tools/smart-complaint-wizard",
    icon: ClipboardCheck,
    desc: "Readiness score, missing proof, draft and mobile action plan.",
  },
  {
    title: "Scam Radar",
    href: "/tools/scam-radar",
    icon: ShieldAlert,
    desc: "Check suspicious messages and get safe next steps.",
  },
  {
    title: "Submission Pack",
    href: "/tools/submission-pack",
    icon: MessageCircle,
    desc: "Email, WhatsApp, support chat and call script in one pack.",
  },
  {
    title: "Language Hub",
    href: "/language-hub",
    icon: Languages,
    desc: "Default English with regional and global language support.",
  },
];

export default async function HomePage() {
  const dictionary = getShellDictionary("ENGLISH");
  const startHref = "/login?next=/tools";

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#d1fae5_0,#ffffff_34%,#f8fafc_100%)]">
        <div
          className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-emerald-100 blur-3xl"
          aria-hidden="true"
        />
        <div className="hs-container grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <FadeIn className="relative z-10">
            <Badge className="bg-emerald-100 text-emerald-800">
              {dictionary.home.badge}
            </Badge>
            <h1 className="mt-5 text-[2.45rem] font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {dictionary.home.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
              {dictionary.home.subtitle}
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <MotionLink
                href={startHref}
                hover="glow"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 text-base font-black text-primary-foreground shadow-lg shadow-emerald-900/10 hover:bg-primary/90"
              >
                {dictionary.home.primaryCta}{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </MotionLink>
              <MotionLink
                href="/tools"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-black text-slate-800 shadow-sm hover:bg-slate-50"
              >
                {dictionary.home.secondaryCta}
              </MotionLink>
            </div>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
              {dictionary.home.proofPoints.map((point) => (
                <div key={point} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  {point}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="relative z-10" delay={0.12}>
            <SpotlightSurface className="rounded-[2rem] border border-emerald-100 bg-white/90 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur sm:p-5">
              <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      {dictionary.home.liveBadge}
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      {dictionary.home.liveTitle}
                    </h2>
                  </div>
                  <Sparkles className="h-8 w-8 text-emerald-200" />
                </div>
                <div className="mt-5 grid gap-3">
                  {dictionary.home.liveSteps.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-white/90">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-2xl font-black text-emerald-900"><MotionNumber value={38} suffix="+" /></p>
                  <p className="text-xs font-bold text-emerald-700">
                    {dictionary.home.toolsCountLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-950">Mobile</p>
                  <p className="text-xs font-bold text-slate-600">
                    {dictionary.home.mobileLabel}
                  </p>
                </div>
              </div>
            </SpotlightSurface>
          </FadeIn>
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-container">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge>{dictionary.home.coreBadge}</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {dictionary.home.coreTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                {dictionary.home.coreSubtitle}
              </p>
            </div>
            <MotionLink
              href="/tools"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
            >
              {dictionary.home.allToolsCta}
            </MotionLink>
          </div>
          <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {heroTools.map((tool) => (
              <StaggerItem key={tool.title}>
                <SpotlightLink
                  href={tool.href}
                  hover="glow"
                  className="group block h-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft hover:border-emerald-200"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <tool.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-black text-slate-950">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {tool.desc}
                  </p>
                  <p className="mt-4 text-sm font-black text-emerald-700">
                    {dictionary.home.openTool} →
                  </p>
                </SpotlightLink>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="bg-slate-50 hs-section">
        <div className="hs-container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>{dictionary.home.actionBadge}</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {dictionary.home.actionTitle}
            </h2>
            <p className="mt-3 text-slate-600">
              {dictionary.home.actionSubtitle}
            </p>
          </div>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {commandCards.map((item) => (
              <StaggerItem key={item.href}>
                <SpotlightLink
                  href={item.href}
                  className="block h-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft"
                >
                  <item.icon className="h-7 w-7 text-emerald-700" />
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </SpotlightLink>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-container grid gap-6 lg:grid-cols-2">
          <InstallPwaCard />
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-700">
                  {dictionary.home.trustBadge}
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {dictionary.home.trustTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {dictionary.home.trustSubtitle}
                </p>
                <MotionLink
                  href="/disclaimer"
                  className="mt-4 inline-flex rounded-2xl border px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50"
                >
                  {dictionary.home.disclaimerCta}
                </MotionLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white sm:py-16">
        <div className="hs-container">
          <StaggerContainer className="grid gap-5 md:grid-cols-3">
            {dictionary.home.howSteps.map(([n, title, desc]) => (
              <StaggerItem key={title}>
                <MotionSurface className="h-full rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300 text-lg font-black text-slate-950">
                    {n}
                  </span>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {desc}
                  </p>
                </MotionSurface>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-container">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge>{dictionary.home.pricingBadge}</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {dictionary.home.pricingTitle}
              </h2>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-black text-emerald-700"
            >
              {dictionary.home.fullPricing} →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.name === "Pro"
                    ? "border-emerald-500 ring-2 ring-emerald-100"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-black">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="hs-container">
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-soft sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
                <BadgeCheck className="h-5 w-5" /> {dictionary.home.finalBadge}
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {dictionary.home.finalTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                {dictionary.home.finalSubtitle}
              </p>
            </div>
            <MotionLink
              href={startHref}
              hover="glow"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-base font-black text-primary-foreground shadow-lg shadow-emerald-900/10 lg:mt-0 lg:w-auto"
            >
              {dictionary.home.getStarted}{" "}
              <ArrowRight className="ml-2 h-5 w-5" />
            </MotionLink>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dictionary.home.faqs.map(([q, a]) => (
              <Card key={q}>
                <CardHeader>
                  <CardTitle className="text-lg">{q}</CardTitle>
                  <CardDescription>{a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
