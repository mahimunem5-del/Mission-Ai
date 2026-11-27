import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import { useAuthProfile } from '../../context/AuthProfileContext';

export const PlanSelectionModal: React.FC = () => {
  const { activeModal, openModal } = useAppShell();
  const { planLabel, setPlanLabel } = useAuthProfile();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const isOpen = activeModal === 'upgrade';

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openModal(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, openModal]);

  if (!isOpen) return null;

  const isAnnual = billing === 'annual';
  const proPrice = isAnnual ? '$16' : '$20';
  const maxPrice = isAnnual ? '$48' : '$60';
  const billingText = isAnnual ? 'Billed annually' : 'Billed monthly';

  const handleSelectPlan = (plan: 'Pro' | 'Max') => {
    setPlanLabel(plan);
    openModal(null);
  };

  return (
    <div
      id="plan-selection-modal"
      onClick={() => openModal(null)}
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-auto flex flex-col items-center max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          id="close-upgrade-modal-btn"
          onClick={() => openModal(null)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close upgrade modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-lg mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Choose your plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Upgrade to unlock frontier AI models, higher rate limits, and professional creative
            studio tools.
          </p>

          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-200/70 dark:border-neutral-700 mt-5 text-xs">
            <button
              type="button"
              id="upgrade-toggle-monthly"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-white dark:bg-neutral-900 shadow-xs text-slate-900 dark:text-neutral-100 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              id="upgrade-toggle-annual"
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-white dark:bg-neutral-900 shadow-xs text-slate-900 dark:text-neutral-100 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {/* Pro Plan */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border-2 border-blue-600 shadow-md relative">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Popular
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3">Pro</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Advanced reasoning and top-tier frontier models for daily productivity
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900" id="plan-pro-price">
                  {proPrice}
                </span>
                <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{billingText}</p>

              <div className="border-t border-slate-100 dark:border-neutral-800 my-4" />

              <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mb-3">
                Everything in Free, plus:
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-neutral-300">
                {[
                  'Unlimited access to frontier reasoning & coding models',
                  'Deep Research mode with cited multi-step reports',
                  'Image Studio with high-resolution generation',
                  'Interactive Code Studio & Slide Deck creator',
                  'Standard rate limits with peak priority processing'
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('Pro')}
              className="btn-select-plan w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              {planLabel.toLowerCase().includes('pro') ? 'Current Plan (Pro)' : 'Get Pro'}
            </button>
          </div>

          {/* Max Plan */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm relative transition-all">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Unlimited
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3">Max</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Maximum speed, unlimited usage, and frontier model intelligence
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900" id="plan-max-price">
                  {maxPrice}
                </span>
                <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{billingText}</p>

              <div className="border-t border-slate-100 dark:border-neutral-800 my-4" />

              <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mb-3">
                Everything in Pro, plus:
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-neutral-300">
                {[
                  'Highest usage limits on all reasoning models',
                  'Extended context windows (up to 1M tokens)',
                  'Early access to experimental frontier models',
                  'Collaborative shared project workspaces',
                  'Dedicated priority customer support 24/7'
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-slate-700 dark:text-neutral-300 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan('Max')}
              className="btn-select-plan w-full mt-6 py-2.5 px-4 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-50 text-slate-900 dark:text-neutral-100 border border-slate-300 dark:border-neutral-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer"
            >
              {planLabel.toLowerCase().includes('max') ? 'Current Plan (Max)' : 'Get Max'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          Subscriptions renew automatically. Cancel anytime in workspace settings.
        </p>
      </div>
    </div>
  );
};
