import React, { createContext, useContext, useState, useEffect } from 'react';

export type FinancialUnit = 'hundred-million' | 'million';

interface UnitPreferenceContextType {
  financialUnit: FinancialUnit;
  setFinancialUnit: (unit: FinancialUnit) => void;
  getUnitDivider: () => number;
  getUnitLabel: (language: 'zh' | 'en') => string;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextType | undefined>(undefined);

export function UnitPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [financialUnit, setFinancialUnitState] = useState<FinancialUnit>(() => {
    const stored = localStorage.getItem('financialUnit');
    return (stored as FinancialUnit) || 'hundred-million';
  });

  useEffect(() => {
    localStorage.setItem('financialUnit', financialUnit);
  }, [financialUnit]);

  const setFinancialUnit = (unit: FinancialUnit) => {
    setFinancialUnitState(unit);
  };

  const getUnitDivider = () => {
    return financialUnit === 'hundred-million' ? 1e8 : 1e6;
  };

  const getUnitLabel = (language: 'zh' | 'en') => {
    if (financialUnit === 'hundred-million') {
      return language === 'zh' ? '亿' : 'hundred million';
    } else {
      return language === 'zh' ? '百万' : 'million';
    }
  };

  return (
    <UnitPreferenceContext.Provider
      value={{
        financialUnit,
        setFinancialUnit,
        getUnitDivider,
        getUnitLabel
      }}
    >
      {children}
    </UnitPreferenceContext.Provider>
  );
}

export function useUnitPreference() {
  const context = useContext(UnitPreferenceContext);
  if (context === undefined) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider');
  }
  return context;
}
