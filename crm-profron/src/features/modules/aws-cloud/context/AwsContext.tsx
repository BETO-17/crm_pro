import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { CloudProposal, CostSimulationItem } from '../types/awsTypes';
import { awsServicesCatalog } from '../data/awsServicesData';
import { demoProposal, demoCostItems, demoSecurityControls } from '../data/awsDemoData';

export interface SecurityControls {
  rootBlocked: boolean;
  mfaEnforced: boolean;
  ec2Roles: boolean;
  tls13: boolean;
  s3EncryptionAndVersioning: boolean;
  complianceAudits: boolean;
  [key: string]: boolean;
}

const DEFAULT_SECURITY_CONTROLS: SecurityControls = {
  rootBlocked: false,
  mfaEnforced: false,
  ec2Roles: false,
  tls13: false,
  s3EncryptionAndVersioning: false,
  complianceAudits: false,
};

export interface AwsContextType {
  // Single Source of Truth State
  proposal: CloudProposal | null;
  services: string[]; // Shared unique array of solution service codeNames (e.g., ['EC2', 'S3'])
  costItems: CostSimulationItem[];
  securityControls: SecurityControls;

  // Derived Values (Never written manually)
  region: string;
  selectedRegion: string;
  deployedServices: string[];
  totalMonthlyCost: number;
  totalAnnualCost: number;
  securityScore: number;
  slaPercent: number;

  // Backward-compatibility aliases
  activeProposal: CloudProposal | null;
  proposals: CloudProposal[];
  activeProposalId: string | null;

  // Primary Actions
  createProposal: (proposalData: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  updateProposal: (partial: Partial<CloudProposal>) => void;
  addService: (codeName: string) => void;
  removeService: (codeName: string) => void;
  toggleService: (codeName: string) => void;
  addCostItem: (item: Omit<CostSimulationItem, 'id'>) => void;
  removeCostItem: (id: string) => void;
  toggleControl: (controlId: string) => void;
  resetAll: () => void;
  loadDemo: () => void;

  // Compatibility Action Aliases
  addProposal: (proposalData: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  deleteProposal: (id: string) => void;
  setActiveProposalId: (id: string | null) => void;
  deleteCostItem: (id: string) => void;
  clearCostItems: () => void;
  setSelectedRegion: (region: string) => void;
  toggleSecurityControl: (key: string) => void;
  setAllSecurityControls: (controls: Partial<SecurityControls>) => void;
  addServiceToArchitecture: (codeName: string) => void;
  removeServiceFromArchitecture: (codeName: string) => void;
  syncCostsFromProposal: (proposal: CloudProposal) => void;
  resetAllToEmpty: () => void;
  loadSampleArchitecture: () => void;
}

const STORAGE_KEYS = {
  PROPOSAL: 'crm_aws_proposal',
  SERVICES: 'crm_aws_services',
  COST_ITEMS: 'crm_aws_cost_items',
  SECURITY: 'crm_aws_security',
};

const AwsContext = createContext<AwsContextType | undefined>(undefined);

export const AwsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Proposal (Starts null by default)
  const [proposal, setProposal] = useState<CloudProposal | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPOSAL);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.solutionName) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  // 2. Services (Single shared array of service codeNames)
  const [services, setServices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // 3. Cost Items
  const [costItems, setCostItems] = useState<CostSimulationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COST_ITEMS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // 4. Security Controls
  const [securityControls, setSecurityControls] = useState<SecurityControls>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECURITY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_SECURITY_CONTROLS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SECURITY_CONTROLS;
  });

  // Persist State with try/catch
  useEffect(() => {
    try {
      if (proposal) {
        localStorage.setItem(STORAGE_KEYS.PROPOSAL, JSON.stringify(proposal));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROPOSAL);
      }
    } catch {
      // ignore
    }
  }, [proposal]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch {
      // ignore
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COST_ITEMS, JSON.stringify(costItems));
    } catch {
      // ignore
    }
  }, [costItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(securityControls));
    } catch {
      // ignore
    }
  }, [securityControls]);

  // Derived Values (Calculated strictly from state)
  const region = useMemo(() => {
    return proposal ? proposal.region : 'Sin región';
  }, [proposal]);

  const selectedRegion = region;
  const deployedServices = services;

  const totalMonthlyCost = useMemo(() => {
    if (costItems.length > 0) {
      return +costItems.reduce((acc, curr) => acc + curr.monthlyCost, 0).toFixed(2);
    }
    return 0;
  }, [costItems]);

  const totalAnnualCost = useMemo(() => +(totalMonthlyCost * 12).toFixed(2), [totalMonthlyCost]);

  const securityScore = useMemo(() => {
    let score = 0;
    const hasEc2 = services.some((s) => s.toLowerCase() === 'ec2');
    const hasS3 = services.some((s) => s.toLowerCase() === 's3');

    if (securityControls.rootBlocked) score += 20;
    if (securityControls.mfaEnforced) score += 20;
    if (securityControls.ec2Roles && hasEc2) score += 20;
    if (securityControls.tls13) score += 15;
    if (securityControls.s3EncryptionAndVersioning && hasS3) score += 15;
    if (securityControls.complianceAudits) score += 10;
    return score;
  }, [securityControls, services]);

  const slaPercent = useMemo(() => {
    if (proposal) {
      if (proposal.availabilityLevel.includes('99.99%')) return 99.99;
      if (proposal.availabilityLevel.includes('99.95%')) return 99.95;
      if (proposal.availabilityLevel.includes('99.9%')) return 99.9;
    }
    return 0;
  }, [proposal]);

  // Backward compatibility
  const activeProposal = proposal;
  const proposals = useMemo(() => (proposal ? [proposal] : []), [proposal]);
  const activeProposalId = proposal ? proposal.id : null;

  // Helpers to resolve service codeName
  const resolveCodeName = (nameOrId: string): string => {
    const found = awsServicesCatalog.find(
      (s) => s.codeName.toLowerCase() === nameOrId.toLowerCase() || s.id.toLowerCase() === nameOrId.toLowerCase()
    );
    return found ? found.codeName : nameOrId;
  };

  // Actions
  const createProposal = (proposalData: Omit<CloudProposal, 'id' | 'createdAt'>) => {
    const newId = `prop-${Date.now()}`;
    const newProp: CloudProposal = {
      ...proposalData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProposal(newProp);
    setServices(newProp.selectedServices);

    // Auto-generate cost items if currently empty
    if (costItems.length === 0 && newProp.selectedServices.length > 0) {
      const generatedItems: CostSimulationItem[] = newProp.selectedServices.map((code, idx) => {
        const catalogSvc = awsServicesCatalog.find((s) => s.codeName.toLowerCase() === code.toLowerCase());
        const costPerHour = catalogSvc?.estimatedCostPerHour || 0.0832;
        const monthlyCost = +(costPerHour * 730).toFixed(2);
        return {
          id: `cost-gen-${Date.now()}-${idx}`,
          serviceId: catalogSvc?.id || `srv-${code.toLowerCase()}`,
          serviceName: catalogSvc?.name || `AWS ${code}`,
          category: catalogSvc?.category || 'Cómputo',
          instanceTypeOrTier: `1x ${code} Standard`,
          quantity: 1,
          hoursPerMonth: 730,
          costPerHour,
          monthlyCost: monthlyCost || 15.0,
          annualCost: +(monthlyCost * 12).toFixed(2) || 180.0,
        };
      });
      setCostItems(generatedItems);
    }
  };

  const updateProposal = (partial: Partial<CloudProposal>) => {
    setProposal((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      if (partial.selectedServices) {
        setServices(partial.selectedServices);
      }
      return updated;
    });
  };

  const addService = (nameOrId: string) => {
    const code = resolveCodeName(nameOrId);
    setServices((prev) => {
      if (prev.includes(code)) return prev;
      return [...prev, code];
    });

    setProposal((prev) => {
      if (!prev) return null;
      if (prev.selectedServices.includes(code)) return prev;
      return { ...prev, selectedServices: [...prev.selectedServices, code] };
    });

    // Add cost item if not present
    const catalogSvc = awsServicesCatalog.find(
      (s) => s.codeName.toLowerCase() === code.toLowerCase() || s.shortName.toLowerCase() === code.toLowerCase()
    );
    setCostItems((prev) => {
      const exists = prev.some((ci) => ci.serviceName.toLowerCase().includes(code.toLowerCase()) || (catalogSvc && ci.serviceId === catalogSvc.id));
      if (exists) return prev;
      
      const pricing = catalogSvc?.pricing || { unit: 'hour', price: 0.05, unitLabel: '$0.05 / h' };
      let monthlyCost = 0;
      let formulaText = '';
      let quantity = 1;
      let hoursPerMonth = 730;

      if (pricing.unit === 'hour') {
        quantity = 1;
        hoursPerMonth = 730;
        monthlyCost = +(quantity * hoursPerMonth * pricing.price).toFixed(2);
        formulaText = `$${pricing.price.toFixed(4)} × 1 instancia × 730 h`;
      } else if (pricing.unit === 'free') {
        quantity = 1;
        monthlyCost = 0;
        formulaText = 'Servicio gratuito ($0.00)';
      } else {
        quantity = pricing.unit === 'gb-month' ? 100 : pricing.unit === 'gb-transfer' ? 50 : 1;
        monthlyCost = +(quantity * pricing.price).toFixed(2);
        formulaText = `$${pricing.price.toFixed(4)} × ${quantity}`;
      }

      const newItem: CostSimulationItem = {
        id: `cost-${Date.now()}`,
        serviceId: catalogSvc?.id || `srv-${code.toLowerCase()}`,
        serviceName: catalogSvc?.name || `AWS ${code}`,
        category: catalogSvc?.category || 'Cómputo',
        instanceTypeOrTier: `1x ${catalogSvc?.shortName || code} Standard`,
        quantity,
        hoursPerMonth,
        unit: pricing.unit,
        unitPrice: pricing.price,
        formulaText,
        costPerHour: pricing.unit === 'hour' ? pricing.price : 0,
        monthlyCost,
        annualCost: +(monthlyCost * 12).toFixed(2),
      };
      return [...prev, newItem];
    });
  };

  const removeService = (nameOrId: string) => {
    const code = resolveCodeName(nameOrId);
    setServices((prev) => prev.filter((s) => s.toLowerCase() !== code.toLowerCase()));

    setProposal((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedServices: prev.selectedServices.filter((s) => s.toLowerCase() !== code.toLowerCase()),
      };
    });

    // Remove matching cost items
    setCostItems((prev) =>
      prev.filter(
        (ci) =>
          !ci.serviceName.toLowerCase().includes(code.toLowerCase()) &&
          !ci.instanceTypeOrTier.toLowerCase().includes(code.toLowerCase())
      )
    );
  };

  const toggleService = (nameOrId: string) => {
    const code = resolveCodeName(nameOrId);
    if (services.includes(code)) {
      removeService(code);
    } else {
      addService(code);
    }
  };

  const addCostItem = (item: Omit<CostSimulationItem, 'id'>) => {
    const newItem: CostSimulationItem = {
      ...item,
      id: `cost-${Date.now()}`,
    };
    setCostItems((prev) => [...prev, newItem]);
  };

  const removeCostItem = (id: string) => {
    setCostItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleControl = (controlId: string) => {
    setSecurityControls((prev) => ({
      ...prev,
      [controlId]: !prev[controlId],
    }));
  };

  const resetAll = () => {
    setProposal(null);
    setServices([]);
    setCostItems([]);
    setSecurityControls(DEFAULT_SECURITY_CONTROLS);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROPOSAL);
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.COST_ITEMS);
      localStorage.removeItem(STORAGE_KEYS.SECURITY);
      // Clean legacy keys if any
      localStorage.removeItem('cloudops_proposal_v3');
      localStorage.removeItem('cloudops_services_v3');
      localStorage.removeItem('cloudops_cost_items_v3');
      localStorage.removeItem('cloudops_security_v3');
    } catch {
      // ignore
    }
  };

  const loadDemo = () => {
    setProposal(demoProposal);
    setServices(demoProposal.selectedServices);
    setCostItems(demoCostItems);
    setSecurityControls(demoSecurityControls);
  };

  // Compatibility aliases
  const addProposal = createProposal;
  const deleteProposal = (_id: string) => {
    resetAll();
  };
  const setActiveProposalId = (_id: string | null) => {};
  const deleteCostItem = removeCostItem;
  const clearCostItems = () => setCostItems([]);
  const setSelectedRegion = (newRegion: string) => {
    if (proposal) {
      updateProposal({ region: newRegion });
    }
  };
  const toggleSecurityControl = toggleControl;
  const setAllSecurityControls = (controls: Partial<SecurityControls>) => {
    setSecurityControls((prev) => ({ ...prev, ...(controls as Record<string, boolean>) } as SecurityControls));
  };
  const addServiceToArchitecture = addService;
  const removeServiceFromArchitecture = removeService;
  const syncCostsFromProposal = (prop: CloudProposal) => {
    const newItems: CostSimulationItem[] = prop.selectedServices.map((codeName, idx) => {
      const catalogSvc = awsServicesCatalog.find(
        (s) => s.codeName.toLowerCase() === codeName.toLowerCase() || s.shortName.toLowerCase() === codeName.toLowerCase()
      );
      const pricing = catalogSvc?.pricing || { unit: 'hour', price: 0.05, unitLabel: '$0.05 / h' };
      let monthlyCost = 0;
      let formulaText = '';
      let quantity = 1;
      let hoursPerMonth = 730;

      if (pricing.unit === 'hour') {
        quantity = 1;
        hoursPerMonth = 730;
        monthlyCost = +(quantity * hoursPerMonth * pricing.price).toFixed(2);
        formulaText = `$${pricing.price.toFixed(4)} × 1 instancia × 730 h`;
      } else if (pricing.unit === 'free') {
        quantity = 1;
        monthlyCost = 0;
        formulaText = 'Servicio gratuito ($0.00)';
      } else {
        quantity = pricing.unit === 'gb-month' ? 100 : pricing.unit === 'gb-transfer' ? 50 : 1;
        monthlyCost = +(quantity * pricing.price).toFixed(2);
        formulaText = `$${pricing.price.toFixed(4)} × ${quantity}`;
      }

      return {
        id: `cost-sync-${Date.now()}-${idx}`,
        serviceId: catalogSvc?.id || `srv-${codeName.toLowerCase()}`,
        serviceName: catalogSvc?.name || `AWS ${codeName}`,
        category: catalogSvc?.category || 'Cómputo',
        instanceTypeOrTier: `1x ${catalogSvc?.shortName || codeName} Standard`,
        quantity,
        hoursPerMonth,
        unit: pricing.unit,
        unitPrice: pricing.price,
        formulaText,
        costPerHour: pricing.unit === 'hour' ? pricing.price : 0,
        monthlyCost,
        annualCost: +(monthlyCost * 12).toFixed(2),
      };
    });
    setCostItems(newItems);
  };
  const resetAllToEmpty = resetAll;
  const loadSampleArchitecture = loadDemo;

  return (
    <AwsContext.Provider
      value={{
        proposal,
        services,
        costItems,
        securityControls,
        region,
        selectedRegion,
        deployedServices,
        totalMonthlyCost,
        totalAnnualCost,
        securityScore,
        slaPercent,
        activeProposal,
        proposals,
        activeProposalId,
        createProposal,
        updateProposal,
        addService,
        removeService,
        toggleService,
        addCostItem,
        removeCostItem,
        toggleControl,
        resetAll,
        loadDemo,
        addProposal,
        deleteProposal,
        setActiveProposalId,
        deleteCostItem,
        clearCostItems,
        setSelectedRegion,
        toggleSecurityControl,
        setAllSecurityControls,
        addServiceToArchitecture,
        removeServiceFromArchitecture,
        syncCostsFromProposal,
        resetAllToEmpty,
        loadSampleArchitecture,
      }}
    >
      {children}
    </AwsContext.Provider>
  );
};

export function useAws() {
  const context = useContext(AwsContext);
  if (!context) {
    throw new Error('useAws must be used within an AwsProvider');
  }
  return context;
}
