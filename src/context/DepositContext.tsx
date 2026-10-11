import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { OperationalCity } from '../types';
import { DEFAULT_DEPOSIT, applyDepositToText, resolveCityDeposit } from '../utils/deposit';

interface DepositContextValue {
  /** شهر انتخاب‌شده توسط بازدیدکننده */
  selectedCity: string;
  /** بیعانه شهر انتخاب‌شده (تومان) */
  deposit: number;
  /** بیعانه هر شهر دلخواه (تومان) */
  getDeposit: (cityName?: string) => number;
  /** جایگزینی عدد بیعانه در متن‌های قابل‌ویرایش ادمین بر اساس شهر انتخاب‌شده */
  withDeposit: (text: string) => string;
}

const DepositContext = createContext<DepositContextValue>({
  selectedCity: '',
  deposit: DEFAULT_DEPOSIT,
  getDeposit: () => DEFAULT_DEPOSIT,
  withDeposit: (t) => t,
});

interface DepositProviderProps {
  selectedCity: string;
  cities: OperationalCity[];
  globalDefault?: number;
  children: React.ReactNode;
}

export const DepositProvider: React.FC<DepositProviderProps> = ({ selectedCity, cities, globalDefault, children }) => {
  const getDeposit = useCallback(
    (cityName?: string) => resolveCityDeposit(cityName, cities, globalDefault),
    [cities, globalDefault]
  );
  const value = useMemo<DepositContextValue>(() => {
    const deposit = getDeposit(selectedCity);
    return {
      selectedCity,
      deposit,
      getDeposit,
      withDeposit: (text: string) => applyDepositToText(text, deposit),
    };
  }, [selectedCity, getDeposit]);

  return <DepositContext.Provider value={value}>{children}</DepositContext.Provider>;
};

export const useDeposit = () => useContext(DepositContext);
