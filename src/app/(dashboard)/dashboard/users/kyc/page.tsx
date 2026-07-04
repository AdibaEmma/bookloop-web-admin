'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Check,
  X,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface PendingKyc {
  id: string;
  full_name: string;
  phone_number: string;
  ghana_card_number: string;
  ghana_card_image?: string;
  submitted_at: string;
  profile_picture?: string;
}

function unwrap<T>(data: any): T {
  return (data?.result ?? data?.data ?? data) as T;
}

export default function GhanaCardKycPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['kyc-pending'],
    queryFn: async () => {
      const res = await apiClient.get('/users/kyc/pending');
      const list = unwrap<PendingKyc[]>(res.data);
      return Array.isArray(list) ? list : [];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      await apiClient.post(`/users/${id}/kyc/${action}`);
      return action;
    },
    onSuccess: (action) => {
      toast.success(action === 'approve' ? 'Ghana Card approved' : 'Submission rejected');
      queryClient.invalidateQueries({ queryKey: ['kyc-pending'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Action failed. Please try again.');
    },
  });

  const pending = data ?? [];

  return (
    <div className="max-w-6xl">
      {/* Breadcrumb + title */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
            Users <ChevronRight className="w-3 h-3" /> Verification
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Ghana Card Verification
          </h1>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[9px] border border-[#ECE6DC] bg-white text-[12.5px] font-semibold text-[#6B6055] hover:bg-background"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs (Pending is the live queue) */}
      <div className="flex gap-1.5 mb-3.5">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3.5 py-2 rounded-[9px] bg-primary text-primary-foreground">
          Pending
          <span className="text-[10px] font-bold bg-white/25 px-1.5 py-px rounded-full">{pending.length}</span>
        </span>
        <span className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[9px] text-[#6B6055] cursor-default opacity-60">Approved</span>
        <span className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[9px] text-[#6B6055] cursor-default opacity-60">Rejected</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#241c16] border border-[#ECE6DC] dark:border-[#33291f] rounded-[14px] overflow-hidden">
        {/* head */}
        <div className="grid grid-cols-[1fr_150px_140px_90px_170px] gap-3.5 px-5 py-3 border-b border-[#F0EBE1] bg-[#FCFAF6] dark:bg-[#2a2118] text-[11px] font-semibold text-[#9A8B79]">
          <span>Applicant</span>
          <span>Card number</span>
          <span>Submitted</span>
          <span>Photo</span>
          <span className="text-right">Status</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">All caught up</h3>
            <p className="text-sm text-muted-foreground mt-1">No Ghana Card submissions are pending review.</p>
          </div>
        ) : (
          pending.map((u) => {
            const busy = decide.isPending && decide.variables?.id === u.id;
            const initials = u.full_name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
            return (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_150px_140px_90px_170px] gap-3.5 px-5 py-3.5 items-center border-b border-[#F0EBE1] dark:border-[#33291f] last:border-0 hover:bg-[#FCFAF6] dark:hover:bg-[#2a2118]"
              >
                {/* Applicant */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.profile_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-foreground truncate">{u.full_name || 'Unnamed'}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.phone_number}</div>
                  </div>
                </div>

                {/* Card number */}
                <span className="font-mono text-[12.5px] text-foreground">{u.ghana_card_number}</span>

                {/* Submitted */}
                <span className="text-[12.5px] text-muted-foreground">{new Date(u.submitted_at).toLocaleDateString()}</span>

                {/* Photo */}
                {u.ghana_card_image ? (
                  <a href={u.ghana_card_image} target="_blank" rel="noopener noreferrer" title="Open full image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.ghana_card_image} alt="Ghana Card" className="w-16 h-11 rounded-md object-cover border border-[#ECE6DC]" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground italic">none</span>
                )}

                {/* Status / actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    disabled={busy}
                    onClick={() => decide.mutate({ id: u.id, action: 'reject' })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => decide.mutate({ id: u.id, action: 'approve' })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
