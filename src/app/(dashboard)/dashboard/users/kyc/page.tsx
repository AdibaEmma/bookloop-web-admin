'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  ShieldCheck,
  Check,
  X,
  Phone,
  Clock,
  Loader2,
  RefreshCw,
  IdCard,
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Ghana Card KYC
            </h1>
            <p className="text-sm text-gray-500">
              Review and approve pending identity verifications
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Count */}
      {!isLoading && (
        <div className="mb-4 text-sm text-gray-500">
          {pending.length} submission{pending.length === 1 ? '' : 's'} awaiting review
        </div>
      )}

      {/* States */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">All caught up</h3>
          <p className="text-sm text-gray-500 mt-1">No Ghana Card submissions are pending review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((u) => {
            const busy = decide.isPending && decide.variables?.id === u.id;
            return (
              <div
                key={u.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              >
                {/* Avatar */}
                {u.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.profile_picture} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">
                    {u.full_name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
                  </div>
                )}

                {/* Card image */}
                {u.ghana_card_image && (
                  <a
                    href={u.ghana_card_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    title="Open full Ghana Card image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.ghana_card_image}
                      alt="Ghana Card"
                      className="w-24 h-16 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                    />
                  </a>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {u.full_name || 'Unnamed user'}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      <span className="font-mono">{u.ghana_card_number}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {u.phone_number}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(u.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={busy}
                    onClick={() => decide.mutate({ id: u.id, action: 'reject' })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => decide.mutate({ id: u.id, action: 'approve' })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
