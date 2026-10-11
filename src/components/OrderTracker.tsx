import React from 'react';
import { Check, Clock, ChefHat, Bike, CheckCircle2, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatDateTime } from '../lib/utils';

interface OrderTrackerProps {
  order: Order;
}

const STEPS: { status: OrderStatus; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { status: 'Order Placed', label: 'Order Placed', shortLabel: 'Placed', icon: Clock },
  { status: 'Confirmed', label: 'Order Confirmed', shortLabel: 'Confirmed', icon: Check },
  { status: 'Preparing', label: 'Kitchen Preparing', shortLabel: 'Preparing', icon: ChefHat },
  { status: 'Out for Delivery', label: 'On The Way', shortLabel: 'On Way', icon: Bike },
  { status: 'Delivered', label: 'Delivered', shortLabel: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTracker({ order }: OrderTrackerProps) {
  if (order.status === 'Cancelled') {
    return (
      <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 sm:gap-4 text-red-800">
        <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 shrink-0" />
        <div>
          <div className="font-bold text-base sm:text-lg">Order Cancelled</div>
          <p className="text-xs sm:text-sm text-red-600">
            This order was cancelled on{' '}
            {order.statusTimestamps.cancelled
              ? formatDateTime(order.statusTimestamps.cancelled)
              : 'Recently'}
            .
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="py-3 sm:py-4 overflow-hidden">
      {/* Stepper bar */}
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-4 sm:top-6 left-4 right-4 -translate-y-1/2 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center group max-w-[65px] sm:max-w-none">
              <div
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 transition-all ${
                  isCompleted
                    ? 'bg-primary-600 border-white text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-2 sm:ring-4 ring-primary-100 scale-105 sm:scale-110' : ''}`}
              >
                <StepIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>

              <div className="mt-1.5 sm:mt-2 text-center">
                <span
                  className={`block text-[10px] sm:text-xs font-bold leading-tight ${
                    isCompleted ? 'text-primary-900' : 'text-gray-400'
                  }`}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
                {isCurrent && (
                  <>
                    <span className="hidden sm:inline-block mt-0.5 px-2 py-0.2 bg-primary-100 text-primary-700 text-[10px] font-semibold rounded-full animate-pulse">
                      In Progress
                    </span>
                    <span className="sm:hidden inline-block w-1.5 h-1.5 rounded-full bg-primary-600 mt-1 animate-pulse" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
