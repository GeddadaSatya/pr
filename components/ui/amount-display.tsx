import React from 'react';

export interface AmountDisplayProps {
  amount: number;
  privacyMode?: boolean;
  prefix?: string; // e.g. '₹', '+₹', '-₹'
  suffix?: string; // e.g. '/mo', ' Due'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: string; // e.g. 'text-slate-900', 'text-[#0f172a]', 'text-red-700', 'text-[#9a761e]'
  decimalColor?: string; // e.g. 'text-slate-500', 'text-slate-400'
  showDecimals?: boolean;
  className?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export function AmountDisplay({
  amount,
  privacyMode = false,
  prefix = '₹',
  suffix,
  size = 'base',
  color = 'text-[#0f172a]',
  decimalColor = 'text-slate-500',
  showDecimals = true,
  className = '',
  weight = 'bold',
}: AmountDisplayProps) {
  if (privacyMode) {
    return <span className={`font-serif ${color} font-${weight} select-none`}>••••••</span>;
  }

  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const integerStr = Math.floor(abs).toLocaleString('en-IN');
  const decimalStr = (abs % 1).toFixed(2).split('.')[1] || '00';

  let displayPrefix = prefix;
  if (isNeg && !prefix.includes('-')) {
    displayPrefix = `-${prefix}`;
  }

  const sizeClasses: Record<string, { integer: string; decimal: string }> = {
    xs: { integer: 'text-xs', decimal: 'text-[10px]' },
    sm: { integer: 'text-sm', decimal: 'text-[11px]' },
    base: { integer: 'text-base', decimal: 'text-xs' },
    lg: { integer: 'text-lg', decimal: 'text-xs' },
    xl: { integer: 'text-xl', decimal: 'text-xs' },
    '2xl': { integer: 'text-xl md:text-2xl', decimal: 'text-xs' },
    '3xl': { integer: 'font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl', decimal: 'text-xs' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.base;
  const weightClass = `font-${weight}`;

  return (
    <div className={`inline-flex items-baseline gap-0.5 ${className}`}>
      <span className={`font-serif ${currentSize.integer} ${color} ${weightClass} tracking-tight`}>
        {displayPrefix}{integerStr}
      </span>
      {showDecimals && (
        <span className={`font-label-numeric ${currentSize.decimal} ${decimalColor} font-medium`}>
          .{decimalStr}
        </span>
      )}
      {suffix && (
        <span className="text-xs text-slate-500 font-normal ml-0.5">
          {suffix}
        </span>
      )}
    </div>
  );
}
