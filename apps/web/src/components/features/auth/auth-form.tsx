'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import type { AuthUser } from '@devagentshub/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@devagentshub/ui';
import { ApiClientError, postJson } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';

const authCopy = {
  login: {
    title: 'Login',
    description: 'Resume your discussions, saved progress, and tool history.',
    endpoint: '/api/auth/login',
    submitLabel: 'Sign in',
    footerLabel: "Don't have an account?",
    footerHref: '/register',
    footerAction: 'Create one',
  },
  register: {
    title: 'Create account',
    description: 'Get a working local account to test the authenticated MVP flows.',
    endpoint: '/api/auth/register',
    submitLabel: 'Create account',
    footerLabel: 'Already have an account?',
    footerHref: '/login',
    footerAction: 'Login',
  },
} as const;

type AuthMode = 'login' | 'register';

type AuthFormValues = {
  displayName: string;
  email: string;
  password: string;
};

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const copy = authCopy[mode];

  const form = useForm<AuthFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const authMutation = useMutation({
    mutationFn: (values: AuthFormValues) =>
      postJson<{ user: AuthUser }, AuthFormValues>(copy.endpoint, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth });
      router.push(mode === 'login' ? '/community' : '/');
      router.refresh();
    },
  });

  const submitHandler = form.handleSubmit(async (values) => {
    if (mode === 'login') {
      await authMutation.mutateAsync({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
      });
      return;
    }

    await authMutation.mutateAsync(values);
  });

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submitHandler}>
          {mode === 'register' ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...form.register('displayName')} />
              {form.formState.errors.displayName ? (
                <p className="text-sm text-[var(--color-warm)]">
                  {form.formState.errors.displayName.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" required type="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" minLength={8} required type="password" {...form.register('password')} />
            {form.formState.errors.password ? (
              <p className="text-sm text-[var(--color-warm)]">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          {authMutation.error instanceof ApiClientError ? (
            <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
              {authMutation.error.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={authMutation.isPending} type="submit">
            {authMutation.isPending ? 'Submitting...' : copy.submitLabel}
          </Button>
          <p className="text-sm text-[var(--color-subtle)]">
            {copy.footerLabel}{' '}
            <Link className="font-semibold text-[var(--color-accent)]" href={copy.footerHref}>
              {copy.footerAction}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
