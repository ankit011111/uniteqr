import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Store, ChevronDown, Rocket, CheckCircle, ArrowRight, ShieldCheck, Globe, Megaphone } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [form, setForm] = useState({ 
    fullName: '', 
    shopAddress: '', 
    contactNumber: '',
    serviceOfInterest: 'Menu QR'
  });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointment', form);
      toast.success('Success! Our team will contact you shortly.', {
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });
      setForm({ fullName: '', shopAddress: '', contactNumber: '', serviceOfInterest: 'Menu QR' });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      {/* Premium Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <QrCode size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">UniteQR</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 mr-4">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
              >
                Login <ChevronDown size={14} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-2">
                    <Link to="/admin/login" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">👨‍🍳</div>
                      Café Admin
                    </Link>
                    <Link to="/employee/login" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">💼</div>
                      Sales Team
                    </Link>
                    <Link to="/employee/login" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-2xl transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">👑</div>
                      Master Panel
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold animate-fade-in">
              <Rocket size={16} className="animate-bounce" />
              The Future of Smart Ordering
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Build QR for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Table</span> with us.
            </h1>
            
            <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
              UniteQR transforms your physical menu into a lightning-fast digital experience. Instant orders, seamless payments, and smarter analytics.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle size={20} />
                </div>
                <span className="font-bold text-gray-700">Setup in 5 mins</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle size={20} />
                </div>
                <span className="font-bold text-gray-700">Zero App Installs</span>
              </div>
            </div>

            <div className="pt-8">
              <a href="#contact" className="group inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-gray-900 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30">
                Get Started Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Lead Form Container */}
          <div id="contact" className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <div className="relative bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Request a Demo</h2>
                <p className="text-gray-500 font-medium italic">"Get local visit as closing to build trust"</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={e => setForm({...form, fullName: e.target.value})}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Service Needed</label>
                    <div className="relative">
                      <select
                        required
                        value={form.serviceOfInterest}
                        onChange={e => setForm({...form, serviceOfInterest: e.target.value})}
                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all outline-none appearance-none"
                      >
                        <option value="Menu QR">Menu QR System</option>
                        <option value="Web Building">Custom Web Building</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Shop Address</label>
                  <textarea
                    required
                    value={form.shopAddress}
                    onChange={e => setForm({...form, shopAddress: e.target.value})}
                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all outline-none h-32 resize-none"
                    placeholder="Complete address with landmark..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={form.contactNumber}
                    onChange={e => setForm({...form, contactNumber: e.target.value})}
                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                    placeholder="+91 98XXX XXXXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl text-lg hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl active:scale-[0.98] mt-4"
                >
                  {loading ? 'Processing...' : 'Book Your Free Site Visit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-16 underline decoration-blue-500 decoration-8 underline-offset-8">Our Core Services</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <ServiceCard 
              icon={<QrCode size={32} />} 
              title="Menu QR" 
              desc="Seamless digital menus with instant ordering and payment integration." 
              color="text-blue-600"
            />
            <ServiceCard 
              icon={<Globe size={32} />} 
              title="Web Building" 
              desc="Custom high-performance websites built for conversion and growth." 
              color="text-indigo-600"
            />
            <ServiceCard 
              icon={<Megaphone size={32} />} 
              title="Digital Marketing" 
              desc="Targeted campaigns to bring more customers to your doorstep." 
              color="text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-500 font-medium">Choose the plan that fits your business needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              title="Basic Digital Ordering"
              price="500"
              color="bg-green-50 text-green-700"
              badge="🟢 Essential"
              features={[
                "QR Code per table",
                "Scan & Order system",
                "Simple Café Admin Panel",
                "Order notifications (dashboard)"
              ]}
              missing={[
                "No phone number capture",
                "No customer data",
                "No online payment"
              ]}
            />
            <PricingCard 
              title="Customer Data System"
              price="1000"
              color="bg-yellow-50 text-yellow-700"
              badge="🟡 Growth"
              popular={true}
              features={[
                "Everything in Basic Plan",
                "Phone number capture",
                "Customer database list",
                "Order history tracking"
              ]}
              missing={[
                "No online payment"
              ]}
            />
            <PricingCard 
              title="Complete System"
              price="1500"
              color="bg-red-50 text-red-700"
              badge="🔴 Enterprise"
              features={[
                "Everything in Growth Plan",
                "Online payment (Razorpay)",
                "WhatsApp order alerts",
                "Faster dashboard (Optimized UI)",
                "Advanced analytics"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2 font-black text-2xl italic">TRUSTED</div>
          <div className="flex items-center gap-2 font-black text-2xl italic">SECURE</div>
          <div className="flex items-center gap-2 font-black text-2xl italic">GLOBAL</div>
          <div className="flex items-center gap-2 font-black text-2xl italic">LOCAL</div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 font-bold text-sm">© 2026 UniteQR. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 text-left">
    <div className={`mb-6 ${color}`}>{icon}</div>
    <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const PricingCard = ({ title, price, features, missing, color, badge, popular }) => (
  <div className={`relative bg-white p-10 rounded-[40px] border ${popular ? 'border-blue-500 shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-xl'} transition-all hover:scale-[1.02]`}>
    {popular && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
        Most Popular
      </div>
    )}
    <div className="mb-8">
      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 ${color}`}>
        {badge}
      </span>
      <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-gray-900">₹{price}</span>
        <span className="text-gray-400 font-bold">/month</span>
      </div>
    </div>

    <div className="space-y-4 mb-10">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle size={12} />
          </div>
          <span className="text-sm font-bold text-gray-700">{feature}</span>
        </div>
      ))}
      {missing?.map((feature, i) => (
        <div key={i} className="flex items-start gap-3 opacity-40">
          <div className="mt-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
            <div className="w-2 h-[2px] bg-gray-400"></div>
          </div>
          <span className="text-sm font-bold text-gray-500 line-through">{feature}</span>
        </div>
      ))}
    </div>

    <a href="#contact" className={`block w-full text-center py-4 rounded-2xl font-black transition-all ${popular ? 'bg-blue-600 text-white hover:bg-gray-900 shadow-xl shadow-blue-200' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
      Choose Plan
    </a>
  </div>
);

export default HomePage;
