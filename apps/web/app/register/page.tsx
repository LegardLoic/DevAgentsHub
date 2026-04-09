import { Badge, Section } from '@devagentshub/ui';

import { AuthForm } from '@/src/components/features/auth/auth-form';

export default function RegisterPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3 text-center">
        <Badge>Authentication</Badge>
        <h1 className="headline text-5xl font-bold">Create a local account for the full MVP flow</h1>
      </div>
      <AuthForm mode="register" />
    </Section>
  );
}
