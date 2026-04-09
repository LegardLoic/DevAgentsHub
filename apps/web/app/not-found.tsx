import Link from 'next/link';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

export default function NotFoundPage() {
  return (
    <Section>
      <Card className="mx-auto max-w-xl text-center">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The route does not exist in the current MVP surface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </Section>
  );
}
