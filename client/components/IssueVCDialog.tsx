import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarDays, X, Fingerprint } from 'lucide-react';

export interface IssueVCDialogProps {
  doc: any;
  credentialType: string;
  authorityLabel: string;
  accentColor?: string; // tailwind color key e.g. 'indigo' | 'emerald' | 'red' | 'purple'
  defaultExpiryYears?: number;
  onClose: () => void;
  onIssue: (docId: string, userId: string, expiryDate: string) => Promise<void>;
  isLoading: boolean;
}

export function IssueVCDialog({
  doc,
  credentialType,
  authorityLabel,
  accentColor = 'indigo',
  defaultExpiryYears = 10,
  onClose,
  onIssue,
  isLoading,
}: IssueVCDialogProps) {
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + defaultExpiryYears);
  const [expiryDate, setExpiryDate] = useState(defaultExpiry.toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];

  const gradientMap: Record<string, string> = {
    indigo: 'from-indigo-600 to-purple-600',
    emerald: 'from-emerald-600 to-teal-600',
    red: 'from-red-600 to-rose-600',
    purple: 'from-purple-600 to-violet-600',
  };
  const gradient = gradientMap[accentColor] || gradientMap.indigo;

  const presets = [
    { label: '6 Months', months: 6 },
    { label: '1 Year', years: 1 },
    { label: '3 Years', years: 3 },
    { label: '5 Years', years: 5 },
    { label: '10 Years', years: 10 },
  ];

  const presetDate = (years?: number, months?: number) => {
    const d = new Date();
    if (years) d.setFullYear(d.getFullYear() + years);
    if (months) d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Issue Verifiable Credential</h2>
                <p className="text-white/70 text-sm">{credentialType} · {authorityLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Subject info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Subject</p>
            <p className="font-semibold text-slate-800">{doc.profiles?.full_name || 'Unknown'}</p>
            <p className="text-sm text-slate-500">{doc.profiles?.email}</p>
            <Badge className="mt-1 bg-slate-100 text-slate-700 hover:bg-slate-100 capitalize border border-slate-200">
              {doc.doc_type?.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Expiry date picker */}
          <div className="space-y-2">
            <Label htmlFor="vc-expiry-date" className="flex items-center gap-2 text-slate-700 font-medium">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Credential Expiry Date
            </Label>
            <Input
              id="vc-expiry-date"
              type="date"
              min={today}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="border-slate-200 focus:ring-2"
            />
            <p className="text-xs text-slate-400">
              The user will see an expiry alert 10 days before this date.
            </p>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Quick select</p>
            <div className="flex flex-wrap gap-2">
              {presets.map(({ label, years, months }) => {
                const val = presetDate(years, months);
                const isActive = expiryDate === val;
                return (
                  <button
                    key={label}
                    onClick={() => setExpiryDate(val)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? `bg-${accentColor}-600 text-white border-${accentColor}-600 shadow-sm`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--preset-active)', borderColor: 'var(--preset-active)' } : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className={`flex-1 bg-gradient-to-r ${gradient} text-white hover:opacity-90`}
            onClick={() => onIssue(doc.id, doc.user_id, expiryDate)}
            disabled={isLoading || !expiryDate}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Issuing...</>
            ) : (
              <><Fingerprint className="h-4 w-4 mr-2" />Issue VC</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
