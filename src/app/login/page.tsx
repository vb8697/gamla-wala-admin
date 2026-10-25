import { ShieldCheck, Sprout } from 'lucide-react';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-hero relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="bg-dots pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700"><Sprout className="h-5 w-5" /></span>
          <span className="font-heading text-2xl font-semibold">Gamla<span className="text-gold-300">Wala</span></span>
        </div>
        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Har Ghar Hariyali</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight">Run your nursery with calm, clarity and care.</h2>
          <p className="mt-4 text-brand-100/80">Manage plants, gamlas, orders and deliveries from one beautiful workspace.</p>
        </div>
        <p className="relative text-xs text-brand-100/60">© GamlaWala · Nursery operations</p>
      </div>

      <div className="flex items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-[13.5px] text-ink-500">Sign in with your registered Google account to open the admin dashboard.</p>
          <div className="mt-8">
            <GoogleSignInButton label="Continue with Google" className="!h-12 w-full !text-[13px]" />
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-ink-400"><ShieldCheck className="h-4 w-4 text-brand-600" />Secured with Supabase OAuth 2.0</p>
        </div>
      </div>
    </div>
  );
}
