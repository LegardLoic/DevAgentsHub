import { Badge, Section } from '@devagentshub/ui';

import { AuthForm } from '@/src/components/features/auth/auth-form';

export default function LoginPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3 text-center">
        <Badge>Authentication</Badge>
        <h1 className="headline text-5xl font-bold">Login to unlock posting and lesson progress</h1>
      </div>
      <AuthForm mode="login" />
    </Section>
  );
}
