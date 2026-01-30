"use client";

import { useState } from "react";
import { Building2, Package } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import CompanySettingsForm from "./CompanySettingsForm";
import ProductsManager from "./ProductsManager";
import type { SettingsTab } from "@/types";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function SettingsSheet({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: SettingsSheetProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  const tabs = [
    { id: "company" as const, label: "Company", icon: Building2 },
    { id: "products" as const, label: "Products", icon: Package },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      height="full"
    >
      {/* Tab Navigation */}
      <div className="tab-nav mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item flex items-center justify-center gap-2 ${
              activeTab === tab.id ? "active" : ""
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "company" ? (
        <CompanySettingsForm
          onSave={onClose}
          onSuccess={onSuccess}
          onError={onError}
        />
      ) : (
        <ProductsManager onSuccess={onSuccess} onError={onError} />
      )}
    </BottomSheet>
  );
}
