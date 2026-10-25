import { Clock, MapPin, Truck } from 'lucide-react';
import { PARTNERS } from '@/lib/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';

export default function DeliveryPage() {
  return (
    <>
      <PageHeader title="Delivery partners" subtitle="Courier performance and service coverage." />
      <div className="mb-5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] text-gold-600">Sample data — there is no delivery-partner table in your database yet.</div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PARTNERS.map((p) => (
          <div key={p.name} className="card card-pad">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: p.color }}><Truck className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="h-3 w-3" />{p.zones}</p>
                </div>
              </div>
              <Badge tone={p.cod ? 'green' : 'gray'} dot={false}>{p.cod ? 'COD available' : 'Prepaid only'}</Badge>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-canvas py-3"><p className="font-heading text-xl font-semibold">{p.active}</p><p className="text-[11px] text-ink-500">Active shipments</p></div>
              <div className="rounded-xl bg-canvas py-3"><p className="flex items-center justify-center gap-1 font-heading text-xl font-semibold"><Clock className="h-3.5 w-3.5 text-ink-400" />{p.avgDays}d</p><p className="text-[11px] text-ink-500">Avg. transit</p></div>
              <div className="rounded-xl bg-canvas py-3"><p className="font-heading text-xl font-semibold">{p.onTime}%</p><p className="text-[11px] text-ink-500">On-time</p></div>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs text-ink-500"><span>Delivery reliability</span><b className="text-ink-800">{p.onTime}%</b></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full" style={{ width: `${p.onTime}%`, background: p.color }} /></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
