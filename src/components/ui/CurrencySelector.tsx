"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check, ChevronDown, Globe2 } from "lucide-react";

// Comprehensive currency list with LKR included
const CURRENCIES = [
  // Popular currencies first
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  // Alphabetically sorted rest
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "🇹🇼" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
];

interface CurrencySelectorProps {
  value: string;
  onChange: (symbol: string) => void;
}

export default function CurrencySelector({
  value,
  onChange,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Find selected currency
  const selectedCurrency = CURRENCIES.find((c) => c.symbol === value) || {
    code: "USD",
    symbol: value || "$",
    name: "Unknown",
    flag: "💰",
  };

  // Filter currencies based on search
  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.code.toLowerCase().includes(search.toLowerCase()) ||
      currency.name.toLowerCase().includes(search.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (currency: (typeof CURRENCIES)[0]) => {
    onChange(currency.symbol);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-4 bg-white border border-neutral-200 rounded-2xl text-left transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedCurrency.flag}</span>
          <div>
            <div className="font-semibold text-neutral-900">
              {selectedCurrency.symbol}{" "}
              <span className="text-neutral-500 font-normal">
                ({selectedCurrency.code})
              </span>
            </div>
            <div className="text-sm text-neutral-500">
              {selectedCurrency.name}
            </div>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-neutral-400" />
      </button>

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-slide-up">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-100 px-4 pt-safe">
            <div className="flex items-center justify-between py-4">
              <h2 className="text-xl font-bold text-neutral-900">
                Select Currency
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative pb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-100 border-0 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-neutral-400"
                style={{ fontSize: "16px" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-300 active:bg-neutral-400"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Currency List */}
          <div
            ref={modalRef}
            className="overflow-y-auto pb-safe"
            style={{ height: "calc(100vh - 160px)" }}
          >
            {filteredCurrencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <Globe2 className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No currencies found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredCurrencies.map((currency) => {
                  const isSelected = currency.symbol === value;
                  return (
                    <button
                      key={currency.code}
                      onClick={() => handleSelect(currency)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all active:bg-neutral-50 ${
                        isSelected ? "bg-primary-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{currency.flag}</span>
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {currency.symbol}{" "}
                            <span className="text-neutral-500 font-normal text-sm">
                              {currency.code}
                            </span>
                          </div>
                          <div className="text-sm text-neutral-500">
                            {currency.name}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-500">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
