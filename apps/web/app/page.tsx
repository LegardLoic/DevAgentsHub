import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Bookmark,
  BookOpenText,
  Compass,
  FolderTree,
  History,
  Layers3,
  MessageSquareText,
  Search,
  Sparkles,
} from 'lucide-react';

import { featuredCourse, siteConfig, toolCatalog } from '@devagentshub/config';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Section,
} from '@devagentshub/ui';

import { buildSeoMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'AI Developer Tools, Guides, and Workflow Hub',
  description:
    'Use DevAgentsHub to generate better coding prompts, structure AI-assisted projects, debug faster, and save reusable development workflows.',
  path: '/',
  keywords: ['AI developer tools', 'prompt generator', 'coding agents', 'developer workflow'],
});

const workflowSteps = [
  {
    eyebrow: 'Frame',
    title: 'Read a focused guide',
    description: 'Clarify the brief, constraints, and review bar before asking an agent to produce work.',
    href: '/guides',
    action: 'Open guides',
    icon: BookOpenText,
  },
  {
    eyebrow: 'Execute',
    title: 'Run a practical tool',
    description: 'Generate prompts, project structures, or debugging plans from validated product flows.',
    href: '/tools',
    action: 'Open tools',
    icon: Sparkles,
  },
  {
    eyebrow: 'Reinforce',
    title: 'Follow the formation path',
    description: 'Use the course and lessons to turn one-off output into repeatable engineering habits.',
    href: '/formations',
    action: 'Explore formations',
    icon: FolderTree,
  },
  {
    eyebrow: 'Pressure-test',
    title: 'Ask the community',
    description: 'Bring implementation questions, tradeoffs, and review concerns into a focused thread.',
    href: '/community',
    action: 'Open community',
    icon: MessageSquareText,
  },
];

const entryPoints = [
  {
    title: 'Find the right surface',
    description: 'Search across tools, guides, formations, and public community threads from one page.',
    href: '/search',
    action: 'Search DevAgentsHub',
    icon: Search,
  },
  {
    title: 'Start with execution',
    description: 'Open the tool directory when you already know the job: prompt, scaffold, or debug.',
    href: '/tools',
    action: 'Open tools',
    icon: Compass,
  },
  {
    title: 'Save what works',
    description: 'Use an account to keep saved runs, reusable templates, and bookmarked content together.',
    href: '/register',
    action: 'Create account',
    icon: Bookmark,
  },
];

const dashboardBenefits = [
  {
    title: 'Saved runs',
    description: 'Keep real tool outputs available instead of losing useful prompts or debug plans.',
    href: '/dashboard/saved-runs',
    icon: History,
  },
  {
    title: 'Reusable templates',
    description: 'Turn strong tool inputs into editable working assets for recurring tasks.',
    href: '/dashboard/templates',
    icon: Layers3,
  },
  {
    title: 'Bookmarks',
    description: 'Save guides and formations intentionally, then return from one dashboard page.',
    href: '/dashboard/bookmarks',
    icon: Bookmark,
  },
];

export default function HomePage() {
  return (
    <>
      <Section className="relative overflow-hidden pt-20 md:pt-24">
        <div className="hero-grid absolute inset-x-4 top-6 -z-10 h-[520px] rounded-[2rem] border border-[rgba(19,34,56,0.08)] opacity-70 md:inset-x-6" />
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <Badge>AI-assisted development workflow</Badge>
            <div className="space-y-5">
              <h1 className="headline max-w-4xl text-5xl font-bold leading-[0.95] md:text-7xl">
                Turn agent-assisted work into a repeatable developer workflow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
                {siteConfig.tagline} Use focused tools, practical guides, formations, community
                feedback, and a personal dashboard without treating each slice like a separate
                product.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/tools">
                  Open tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/search">Search DevAgentsHub</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/guides">Start with a guide</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['3 focused tools', 'Guides + formations', 'Saved runs + templates'].map((signal) => (
                <div
                  className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--color-ink)]"
                  key={signal}
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden bg-[linear-gradient(160deg,rgba(15,118,110,0.96),rgba(19,34,56,0.98))] text-white">
            <CardHeader>
              <Badge className="w-fit bg-white/10 text-white">Start anywhere</Badge>
              <CardTitle className="text-white">Choose the right next action</CardTitle>
              <CardDescription className="text-white/80">
                Search when you are not sure, open a tool when you need output, or create an
                account when you want to keep and reuse the work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {entryPoints.map((item) => (
                  <Link
                    className="group rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
                    href={item.href}
                    key={item.title}
                  >
                    <div className="flex items-start gap-4">
                      <item.icon className="mt-1 h-5 w-5 text-[var(--color-warm)]" />
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm leading-6 text-white/75">{item.description}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                          {item.action}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <Badge>Connected product loop</Badge>
          <h2 className="headline text-4xl font-bold md:text-5xl">
            DevAgentsHub is not just a tool list.
          </h2>
          <p className="text-lg leading-8 text-[var(--color-subtle)]">
            The product connects the parts of AI-assisted development that usually drift apart:
            framing work, generating output, learning the pattern, saving what works, and getting
            implementation feedback.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <step.icon className="h-5 w-5 text-[var(--color-accent)]" />
                  <Badge>{step.eyebrow}</Badge>
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                  href={step.href}
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge>Find your entry point</Badge>
            <h2 className="headline text-4xl font-bold">Start from the job you need to do.</h2>
            <p className="text-lg leading-8 text-[var(--color-subtle)]">
              Search across the product, run a specific tool, or build a reusable workspace with an
              account. Each entry point links back into the rest of the flow.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/search">
              Search all surfaces
              <Search className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {entryPoints.map((item) => (
            <Card className="h-full" key={item.title}>
              <CardHeader>
                <item.icon className="h-6 w-6 text-[var(--color-accent)]" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                  href={item.href}
                >
                  {item.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[linear-gradient(135deg,rgba(234,88,12,0.14),rgba(255,255,255,0.94))]">
          <CardHeader>
            <Badge>Personal workspace</Badge>
            <CardTitle className="headline text-4xl">
              Create an account when work becomes reusable.
            </CardTitle>
            <CardDescription>
              The dashboard is deliberately practical: it keeps useful tool output, templates, and
              bookmarked learning material close to the next execution step.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {dashboardBenefits.map((benefit) => (
            <Card className="h-full shadow-none" key={benefit.title}>
              <CardHeader>
                <benefit.icon className="h-5 w-5 text-[var(--color-accent)]" />
                <CardTitle>{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link className="text-sm font-semibold text-[var(--color-accent)]" href={benefit.href}>
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge>Toolset</Badge>
            <h2 className="headline text-4xl font-bold">Three focused tools for real MVP work</h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--color-subtle)]">
              Use the tools when you need structured output now. Save the useful results, convert
              them into templates, then come back with better inputs next time.
            </p>
          </div>
          <Link className="text-sm font-semibold text-[var(--color-accent)]" href="/tools">
            See all tools
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {toolCatalog.map((tool) => (
            <Card key={tool.slug}>
              <CardHeader>
                <Badge>{tool.category}</Badge>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                  href={`/tools/${tool.slug}`}
                >
                  Launch tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(19,34,56,0.98),rgba(15,118,110,0.92))] text-white">
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div className="space-y-4">
              <Badge className="w-fit bg-white/10 text-white">Best next step</Badge>
              <h2 className="headline text-4xl font-bold text-white">
                Start with one workflow, then keep the useful parts.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-white/75">
                If you are new here, search for the problem you have. If you already know the task,
                open a tool. If the result is useful, save it and turn it into a reusable template.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row md:flex-col">
              <Button asChild variant="secondary">
                <Link href="/search">Search the product</Link>
              </Button>
              <Button asChild className="bg-white/10 text-white hover:bg-white/15" variant="ghost">
                <Link href={`/formations/${featuredCourse.slug}`}>Follow the starter course</Link>
              </Button>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
