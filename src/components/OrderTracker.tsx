import React from 'react';
import { Check, Clock, ChefHat, Bike, CheckCircle2, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatDateTime } from '../lib/utils';

interface OrderTrackerProps {
  order: Order;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Order Placed', label: 'Order Placed', icon: Clock },
  { status: 'Confirmed', label: 'Order Confirmed', icon: Check },
  { status: 'Preparing', label: 'Kitchen Preparing', icon: ChefHat },
  { status: 'Out for Delivery', label: 'On The Way', icon: Bike },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTracker({ order }: OrderTrackerProps) {
  if (order.status === 'Cancelled') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-800">
        <XCircle className="w-8 h-8 text-red-600 shrink-0" />
        <div>
          <div className="font-bold text-lg">Order Cancelled</div>
          <p className="text-sm text-red-600">
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
    <div className="py-4">
      {/* Stepper bar */}
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-200 z-0">
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
            <div key={step.status} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                  isCompleted
                    ? 'bg-primary-600 border-white text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}
              >
                <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="mt-2 text-center">
                <span
                  className={`block text-[11px] sm:text-xs font-bold ${
                    isCompleted ? 'text-primary-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="inline-block mt-0.5 px-2 py-0.2 bg-primary-100 text-primary-700 text-[10px] font-semibold rounded-full animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
