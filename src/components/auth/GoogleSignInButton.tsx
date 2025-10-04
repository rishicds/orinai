'use client';

interface GoogleSignInButtonProps {
  label?: string;
  redirectTo?: string;
}

function buildHref(redirectTo?: string) {
  if (!redirectTo) return '/auth/oauth/google';
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/auth/oauth/google';
  }
  const params = new URLSearchParams({ redirect: redirectTo });
  return `/auth/oauth/google?${params.toString()}`;
}

export function GoogleSignInButton({ label, redirectTo }: GoogleSignInButtonProps) {
  const href = buildHref(redirectTo);

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-blue-500 hover:bg-slate-900/80"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path
          fill="#4285F4"
          d="M488 261.8c0-17.4-1.5-34.1-4.3-50.2H249v95h134.4c-5.8 31.3-23.5 57.8-50 75.6v62h80.7c47.3-43.6 74.9-107.8 74.9-182.4z"
        />
        <path
          fill="#34A853"
          d="M249 492c67.5 0 124-22.4 165.4-60.8l-80.7-62c-22.4 15-51 23.8-84.7 23.8-65 0-120.1-43.9-139.8-102.9H26.6v64.8C68.6 438.8 152.4 492 249 492z"
        />
        <path
          fill="#FBBC05"
          d="M109.2 289.9c-4.9-14.6-7.6-30.2-7.6-46.1s2.7-31.5 7.6-46.1V132H26.6C9.6 167.5 0 206.2 0 243.8s9.6 76.3 26.6 111.8l82.6-65.7z"
        />
        <path
          fill="#EA4335"
          d="M249 97.7c36.7 0 69.7 12.6 95.7 36.2l71.6-71.6C373 24.5 316.5 0 249 0 152.4 0 68.6 53.2 26.6 132l82.6 65.7C128.9 141.6 184 97.7 249 97.7z"
        />
      </svg>
      {label ?? 'Continue with Google'}
    </a>
  );
}
