import React from "react";

// Mapeamento de beneficiários para bandeiras (SVG ou emoji)
const flagMap: Record<string, { label: string; flag: React.ReactNode }> = {
  "Euro": {
    label: "União Europeia",
    flag: <span style={{fontSize: 22}}>🇪🇺</span>, // Bandeira da União Europeia
  },
  "USD": {
    label: "Estados Unidos",
    flag: <span style={{fontSize: 22}}>🇺🇸</span>,
  },
  "BRL": {
    label: "Brasil",
    flag: <span style={{fontSize: 22}}>🇧🇷</span>,
  },
  // Adicione outros beneficiários e bandeiras conforme necessário
};

interface BeneficiaryFlagProps {
  beneficiary: string;
  showLabel?: boolean;
  className?: string;
}

const BeneficiaryFlag: React.FC<BeneficiaryFlagProps> = ({ beneficiary, showLabel = false, className }) => {
  const info = flagMap[beneficiary] || { label: beneficiary, flag: null };
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`.trim()}>
      {info.flag}
      <span>{beneficiary}</span>
      {showLabel && (
        <span className="text-xs text-muted-foreground ml-1">({info.label})</span>
      )}
    </span>
  );
};

export default BeneficiaryFlag;
