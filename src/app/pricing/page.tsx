import Link from "next/link";
import { Upload } from "lucide-react";
import { MATERIAL_RATES, SETUP_FEE } from "@/lib/pricing";

const MATERIAL_DESCRIPTIONS: Record<string, { tagline: string; use: string }> = {
  PLA: { tagline: "Best value", use: "Prototypes, decorative parts, everyday prints" },
  PETG: { tagline: "Durable & flexible", use: "Functional parts, food-safe applications" },
  ABS: { tagline: "Heat resistant", use: "Engineering parts, enclosures, automotive" },
  ASA: { tagline: "UV & weather resistant", use: "Outdoor use, signage, automotive exterior" },
  TPU: { tagline: "Flexible rubber-like", use: "Gaskets, grips, phone cases, wearables" },
  PA: { tagline: "High performance", use: "Mechanical parts, gears, structural components" },
};

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-500">
          Printed on Bambu Lab X1C, A1, and H2D — priced per gram of filament used.
        </p>
      </div>

      {/* How pricing works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
        <h2 className="font-semibold text-blue-900 mb-2">How it works</h2>
        <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
          <li>We slice your file and calculate the exact print weight.</li>
          <li>Price = <strong>weight (g) × material rate/g × quantity</strong>.</li>
          <li>A minimum charge of <strong>${SETUP_FEE.toFixed(2)}</strong> applies per order to cover setup.</li>
          <li>You'll receive an estimated price before we start printing.</li>
        </ul>
      </div>

      {/* Rate card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Material rates</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {Object.entries(MATERIAL_RATES).map(([material, rate]) => {
            const desc = MATERIAL_DESCRIPTIONS[material];
            return (
              <div key={material} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900">{material}</span>
                    {desc && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {desc.tagline}
                      </span>
                    )}
                  </div>
                  {desc && <p className="text-sm text-gray-400">{desc.use}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-bold text-gray-900">${rate.toFixed(2)}</span>
                  <span className="text-sm text-gray-400">/g</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing example */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
        <h2 className="font-semibold text-gray-900 mb-4">Example</h2>
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>50g PLA print</span>
            <span>50 × $0.20 = $10.00</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Quantity: 2</span>
            <span>× 2 = $20.00</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
            <span>Total estimate</span>
            <span>$20.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Minimum order: ${SETUP_FEE.toFixed(2)}. Final price confirmed after slicing.
        </p>
      </div>

      {/* What's included */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12">
        <h2 className="font-semibold text-gray-900 mb-4">What's included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          {[
            "File slicing & print preparation",
            "Support structure removal",
            "Quality inspection",
            "Secure packaging",
            "Your choice of material, color & settings",
            "Order tracking updates",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-base"
        >
          <Upload className="w-5 h-5" />
          Upload your model
        </Link>
        <p className="text-sm text-gray-400 mt-3">No commitment — you'll approve the price before we print.</p>
      </div>
    </div>
  );
}
