import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Extracts the raw number and the surrounding text prefix/suffix from a
 * formatted value string like "14", "5 000,00 DA", or "0 DA".
 *
 * Returns { prefix, rawNumber, suffix }
 */
function parseValue(str) {
  if (str === null || str === undefined) return { prefix: '0', rawNumber: 0, suffix: '' };
  const s = String(str);

  // Match an optional leading non-digit, then a number (with spaces/commas as separators), then optional trailing text
  // e.g. "5 000,00 DA"  → rawNumber = 5000.00, suffix = " DA"
  // e.g. "14"           → rawNumber = 14,       suffix = ""
  const match = s.match(/^([^0-9]*)([0-9][\d\s.,]*)(.*)$/);
  if (!match) return { prefix: s, rawNumber: 0, suffix: '' };

  const prefix = match[1];
  // Normalise French number format: remove spaces (thousands sep), replace comma with dot
  const normalised = match[2].replace(/\s/g, '').replace(',', '.');
  const rawNumber = parseFloat(normalised) || 0;
  const suffix = match[3];

  return { prefix, rawNumber, suffix };
}

/**
 * Re-formats a live numeric value respecting French locale formatting
 * (spaces as thousands separators, comma as decimal separator).
 */
function formatLive(value, originalStr) {
  const { prefix, rawNumber, suffix } = parseValue(originalStr);
  const isDecimal = String(rawNumber).includes('.') || originalStr.includes(',');

  let formatted;
  if (isDecimal) {
    formatted = value.toLocaleString('fr-DZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = Math.round(value).toLocaleString('fr-DZ');
  }

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Easing function: easeOutExpo
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const DURATION = 1400; // ms

/**
 * useCountUp – animates a number from 0 → target whenever `target` changes
 */
function useCountUp(target) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    fromRef.current = 0; // always start from 0 on new visits
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutExpo(progress);

      setDisplay(fromRef.current + (target - fromRef.current) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target); // snap to exact value at end
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return display;
}

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  const { t } = useLanguage();

  const { rawNumber } = parseValue(value);
  const animatedValue = useCountUp(rawNumber);
  const displayValue = formatLive(animatedValue, value);

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-600 text-sm mb-1">{title}</p>
            <p
              className="text-2xl mb-2 tabular-nums"
              style={{ color: '#1b1b1b', fontVariantNumeric: 'tabular-nums' }}
            >
              {displayValue}
            </p>
            {trend && (
              <div className="flex items-center space-x-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${trend.isPositive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}
                </span>
                <span className="text-xs text-slate-500">{t('dashboard.vsLastMonth')}</span>
              </div>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
