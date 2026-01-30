"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Phone,
  MapPin,
  Upload,
  Trash2,
  Save,
  Image as ImageIcon,
  Coins,
} from "lucide-react";
import type { CompanySettings } from "@/types";
import { getCompanySettings, saveCompanySettings, uploadLogo } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CurrencySelector from "@/components/ui/CurrencySelector";

interface CompanySettingsFormProps {
  onSave: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function CompanySettingsForm({
  onSave,
  onError,
  onSuccess,
}: CompanySettingsFormProps) {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: "",
    company_address: "",
    phone_number: "",
    logo_url: "",
    footer_note: "Thank you for your business!",
    currency_symbol: "$",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (err) {
      onError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.company_name.trim()) {
      onError("Company name is required");
      return;
    }

    setSaving(true);
    try {
      await saveCompanySettings(settings);
      onSuccess("Settings saved");
      onSave();
    } catch (err) {
      onError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setSettings((prev) => ({ ...prev, logo_url: url }));
      onSuccess("Logo uploaded");
    } catch (err) {
      onError("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setSettings((prev) => ({ ...prev, logo_url: "" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Logo Section */}
      <div className="space-y-3">
        <label className="label">Company Logo</label>

        {settings.logo_url ? (
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={settings.logo_url}
              alt="Company logo"
              className="w-full h-full object-contain rounded-2xl border border-neutral-200 bg-white"
            />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
              aria-label="Remove logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-500 active:bg-neutral-50"
          >
            {uploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm font-medium">Tap to upload logo</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />

        {settings.logo_url && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full btn-secondary text-sm py-3"
            disabled={uploading}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Replace Logo
          </button>
        )}
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Company Name *
        </label>
        <input
          type="text"
          value={settings.company_name}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, company_name: e.target.value }))
          }
          placeholder="Your Business Name"
          className="input-premium"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Company Address
        </label>
        <textarea
          value={settings.company_address}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              company_address: e.target.value,
            }))
          }
          placeholder="Street Address&#10;City, State ZIP&#10;Country"
          rows={3}
          className="input-premium resize-none"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </label>
        <input
          type="tel"
          value={settings.phone_number}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, phone_number: e.target.value }))
          }
          placeholder="+1 (555) 123-4567"
          className="input-premium"
        />
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Currency
        </label>
        <CurrencySelector
          value={settings.currency_symbol}
          onChange={(symbol) =>
            setSettings((prev) => ({
              ...prev,
              currency_symbol: symbol,
            }))
          }
        />
      </div>

      {/* Footer Note */}
      <div className="space-y-2">
        <label className="label">Invoice Footer Note</label>
        <input
          type="text"
          value={settings.footer_note}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, footer_note: e.target.value }))
          }
          placeholder="Thank you for your business!"
          className="input-premium"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {saving ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
