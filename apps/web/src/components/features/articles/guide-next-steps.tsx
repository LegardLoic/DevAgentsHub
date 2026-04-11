'use client';

import { getGuideContextualLinks, getRelatedGuideLinks } from '../../../lib/contextual-links';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';

export const GuideNextSteps = ({ currentSlug }: { currentSlug: string }) => (
  <div className="space-y-8">
    <ContextualLinkCards
      description="Use the article as a starting point, then move into the most relevant tool, lesson, or discussion path."
      eyebrow="Next steps"
      links={getGuideContextualLinks(currentSlug)}
      title="Turn this guide into action"
    />
    <ContextualLinkCards
      description="Keep the editorial flow connected without adding a recommendation engine."
      eyebrow="Related guides"
      links={getRelatedGuideLinks(currentSlug)}
      title="Read the adjacent context"
    />
  </div>
);
