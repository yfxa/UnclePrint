import Link from "next/link";
import { Upload, Eye, Package, Truck, CheckCircle, Settings2, Zap, Shield } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Your Model", description: "Drag and drop your STL, OBJ, or 3MF file. We support files up to 100MB.", color: "bg-blue-100 text-blue-600" },
  { icon: Settings2, title: "Choose Settings", description: "Use our smart defaults, or go advanced to pick your printer, material, and precision.", color: "bg-purple-100 text-purple-600" },
  { icon: Package, title: "We Print It", description: "Our team prepares and prints your model on professional-grade machines.", color: "bg-orange-100 text-orange-600" },
  { icon: Truck, title: "Track & Receive", description: "Follow your order in real-time from our workshop to your doorstep.", color: "bg-green-100 text-green-600" },
];

const printers = [
  {
    name: "Bambu Lab X1C",
    precision: "0.1mm – 0.4mm",
    speed: "Fast",
    materials: [
      { name: "PLA", price: "$0.023/g" },
      { name: "PETG", price: "$0.020/g" },
      { name: "ABS", price: "$0.020/g" },
      { name: "ASA", price: "$0.023/g" },
      { name: "TPU", price: "$0.030/g" },
      { name: "PA", price: "$0.035/g" },
    ],
  },
  {
    name: "Bambu Lab A1",
    precision: "0.1mm – 0.4mm",
    speed: "Standard",
    materials: [
      { name: "PLA", price: "$0.023/g" },
      { name: "PETG", price: "$0.020/g" },
      { name: "TPU", price: "$0.030/g" },
    ],
  },
  {
    name: "Bambu Lab H2D",
    precision: "0.1mm – 0.4mm",
    speed: "Fast",
    materials: [
      { name: "PLA", price: "$0.023/g" },
      { name: "PETG", price: "$0.020/g" },
      { name: "ABS", price: "$0.020/g" },
      { name: "ASA", price: "$0.023/g" },
      { name: "TPU", price: "$0.030/g" },
      { name: "PA", price: "$0.035/g" },
    ],
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Fast turnaround · Real-time tracking
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Professional 3D Printing,<br className="hidden md:block" /> Made Simple
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Upload your 3D model and we'll print it with precision. Track every step from upload to delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-blue-200">
              Upload Your Model
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl text-lg transition-colors border border-gray-200">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-500">Four simple steps from file to finished product</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-100" />
                )}
                <div className={`inline-flex p-4 rounded-2xl ${step.color} mb-4 relative z-10`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Printers */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Printers</h2>
            <p className="text-lg text-gray-500">Choose the right machine for your project</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {printers.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{p.name}</h3>
                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <span>Precision: {p.precision}</span>
                  <span>Speed: {p.speed}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Materials & Pricing</p>
                  <div className="space-y-1.5">
                    {p.materials.map((m) => (
                      <div key={m.name} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{m.name}</span>
                        <span className="text-blue-600 font-medium tabular-nums">{m.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Quality Guarantee</h3>
              <p className="text-sm text-gray-500">Every print is inspected before shipping</p>
            </div>
            <div>
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Real-time Tracking</h3>
              <p className="text-sm text-gray-500">Know exactly where your order is at all times</p>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Secure File Handling</h3>
              <p className="text-sm text-gray-500">Your designs are private and protected</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
