import Link from 'next/link';
import { ArrowRight, BookOpenText, Bug, FolderTree, MessageSquareText, Sparkles } from 'lucide-react';

import { featuredCourse, siteConfig, toolCatalog } from '@devagentshub/config';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

const pillars = [
  {
    title: 'Tools',
    description: 'Structured utilities for prompt writing, project scaffolding, and debugging workflows.',
    href: '/tools',
    icon: Sparkles,
  },
  {
    title: 'Guides',
    description: 'Practical articles focused on AI-assisted development with a production bar.',
    href: '/guides',
    icon: BookOpenText,
  },
  {
    title: 'Learning',
    description: 'A compact course path for briefing agents, reviewing output, and preserving architecture.',
    href: '/formations',
    icon: FolderTree,
  },
  {
    title: 'Community',
    description: 'Discussion threads where developers share prompts, reviews, and delivery patterns.',
    href: '/community',
    icon: MessageSquareText,
  },
];

export default function HomePage() {
  return (
    <>
      <Section className="relative overflow-hidden pt-20 md:pt-24">
        <div className="hero-grid absolute inset-x-4 top-6 -z-10 h-[420px] rounded-[2rem] border border-[rgba(19,34,56,0.08)] opacity-70 md:inset-x-6" />
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <Badge>Production-ready MVP foundation</Badge>
            <div className="space-y-5">
              <h1 className="headline max-w-4xl text-5xl font-bold leading-[0.95] md:text-7xl">
                Developer tools, learning content, and community workflows in one durable platform.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
                {siteConfig.tagline} DevAgentsHub starts with a clean monorepo, real backend behavior,
                typed contracts, and local-first infrastructure.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/tools">
                  Explore tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Create a local account</Link>
              </Button>
            </div>
          </div>
          <Card className="relative overflow-hidden bg-[linear-gradient(160deg,rgba(15,118,110,0.96),rgba(19,34,56,0.98))] text-white">
            <CardHeader>
              <Badge className="w-fit bg-white/10 text-white">Featured learning path</Badge>
              <CardTitle className="text-white">{featuredCourse.title}</CardTitle>
              <CardDescription className="text-white/80">
                {featuredCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 rounded-3xl bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <Bug className="h-5 w-5 text-[var(--color-warm)]" />
                  <p className="font-semibold">3 real tools</p>
                </div>
                <p className="text-sm leading-7 text-white/80">
                  Prompt generation, architecture scaffolding, and debugging plans backed by the API.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/formations/${featuredCourse.slug}`}>Open the course</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <Card key={pillar.title}>
            <CardHeader>
              <pillar.icon className="h-6 w-6 text-[var(--color-accent)]" />
              <CardTitle>{pillar.title}</CardTitle>
              <CardDescription>{pillar.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="text-sm font-semibold text-[var(--color-accent)]" href={pillar.href}>
                Open section
              </Link>
            </CardContent>
          </Card>
        ))}
      </Section>

      <Section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge>Toolset</Badge>
            <h2 className="headline text-4xl font-bold">Three focused tools for the MVP</h2>
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
                <Link className="text-sm font-semibold text-[var(--color-accent)]" href={`/tools/${tool.slug}`}>
                  Launch tool
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
