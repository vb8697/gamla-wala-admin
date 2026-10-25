import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Field';

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <>
      <PageHeader title="Tasks" subtitle="Live data from your Supabase project." />
      <Card
        className="max-w-3xl"
        title="Supabase connection"
        action={
          <span className={`chip ${error ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-brand-200 bg-brand-50 text-brand-700'}`}>
            {error ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {error ? 'Table missing' : 'Connected'}
          </span>
        }
      >
        {error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
            <p className="font-semibold">{error.message}</p>
            <p className="mt-2 text-xs">Create the table in Supabase to see tasks here:</p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-amber-100/70 p-3 font-mono text-[11px]">
              create table todos (id bigint generated always as identity primary key, name text, inserted_at timestamptz default now() not null);
            </code>
          </div>
        ) : todos && todos.length > 0 ? (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line text-[13px]">
            {todos.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3"><span className="font-semibold">{t.name}</span><span className="font-mono text-[11px] text-ink-400">#{t.id}</span></li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-canvas p-4 text-[13px] text-ink-600"><Database className="h-4 w-4 text-brand-600" />The <code className="font-mono font-bold">todos</code> table is connected and empty.</div>
        )}
      </Card>
    </>
  );
}
