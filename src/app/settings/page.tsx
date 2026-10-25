'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Field, Toggle } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';

const TABS = ['Store', 'Tax & shipping', 'Notifications'] as const;

export default function SettingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Store');
  const [n, setN] = useState({ order: true, low: true, review: false, digest: true });

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure your nursery, taxes and alerts." actions={<button className="btn btn-primary" onClick={() => toast('Settings saved')}><Save className="h-4 w-4" />Save changes</button>} />
      <div className="mb-6 flex w-fit rounded-xl bg-white p-1 shadow-card">
        {TABS.map((t) => <button key={t} className={`tab ${tab === t ? '!bg-brand-800 !text-white' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="max-w-3xl space-y-6">
        {tab === 'Store' && (
          <Card title="Store profile" subtitle="Shown on invoices and customer emails.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Store name"><input className="input" defaultValue="GamlaWala" /></Field>
              <Field label="Tagline"><input className="input" defaultValue="Har Ghar Hariyali" /></Field>
              <Field label="Support email"><input className="input" defaultValue="hello@gamlawala.in" /></Field>
              <Field label="Support phone"><input className="input" defaultValue="+91 98111 00000" /></Field>
              <Field label="Nursery address" className="sm:col-span-2"><textarea rows={2} className="input" defaultValue="New Delhi Primary Nursery, Chhatarpur, New Delhi 110074" /></Field>
            </div>
          </Card>
        )}
        {tab === 'Tax & shipping' && (
          <>
            <Card title="Tax & currency">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Currency"><input className="input" disabled value="INR (₹)" /></Field>
                <Field label="GST rate on plants"><input className="input" defaultValue="18%" /></Field>
                <Field label="GSTIN" className="sm:col-span-2"><input className="input font-mono" placeholder="07ABCDE1234F1Z5" /></Field>
              </div>
            </Card>
            <Card title="Shipping">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Free delivery above (₹)"><input type="number" className="input" defaultValue={999} /></Field>
                <Field label="Standard shipping fee (₹)"><input type="number" className="input" defaultValue={99} /></Field>
              </div>
            </Card>
          </>
        )}
        {tab === 'Notifications' && (
          <Card title="Email alerts" subtitle="Choose what lands in your inbox.">
            <div className="space-y-3">
              <Toggle checked={n.order} onChange={(v) => setN({ ...n, order: v })} label="New orders" desc="Instant email for every order" />
              <Toggle checked={n.low} onChange={(v) => setN({ ...n, low: v })} label="Low stock" desc="When a product hits its alert level" />
              <Toggle checked={n.review} onChange={(v) => setN({ ...n, review: v })} label="New reviews" desc="Customer reviews awaiting moderation" />
              <Toggle checked={n.digest} onChange={(v) => setN({ ...n, digest: v })} label="Daily digest" desc="Morning summary of sales and tasks" />
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
