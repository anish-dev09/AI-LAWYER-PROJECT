import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatPopup from '../components/ChatPopup';
import { BookOpen, BarChart3, Gavel, Brain, Users, Building2, GraduationCap, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

function LegalConsultForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [preferred, setPreferred] = useState("call");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const LAWYER_PHONE = "+911234567890"; // placeholder
  const WHATSAPP_LINK = "https://wa.me/911234567890"; // placeholder
  const CONSULT_COST = 500;

  async function handleSubmit(e?: any, trigger?: string) {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setSuccess("");

    const payload = {
      name,
      phone,
      email,
      message,
      preferred_method: trigger || preferred,
      cost: CONSULT_COST
    };

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      setSuccess("Request submitted — connecting now...");

      // small delay to show success then trigger connection
      setTimeout(() => {
        if ((trigger || preferred) === "call") {
          window.location.href = `tel:${LAWYER_PHONE}`;
        } else {
          window.open(WHATSAPP_LINK, "_blank");
        }
      }, 800);

      setName("");
      setPhone("");
      setEmail("");
      setMessage("");

    } catch (err: any) {
      setSuccess(`Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
      <div>
        <label className="text-sm text-gray-700">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Your full name" required />
      </div>

      <div>
        <label className="text-sm text-gray-700">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Mobile number" required />
      </div>

      <div>
        <label className="text-sm text-gray-700">Email (optional)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="you@example.com" />
      </div>

      <div>
        <label className="text-sm text-gray-700">Brief message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Describe your issue (one-liner)" />
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm text-gray-700">Preferred:</label>
        <select value={preferred} onChange={(e) => setPreferred(e.target.value)} className="p-2 border rounded">
          <option value="call">Call</option>
          <option value="chat">Chat (WhatsApp)</option>
        </select>
      </div>

      <div className="flex gap-3 mt-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#ff9933] text-white rounded hover:bg-[#ff8800]">
          {loading ? "Submitting..." : `Request & ${preferred === 'call' ? 'Call' : 'Chat'}`}
        </button>

        <button type="button" disabled={loading} onClick={() => handleSubmit(undefined, 'call')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Call a Lawyer
        </button>

        <button type="button" disabled={loading} onClick={() => handleSubmit(undefined, 'chat')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Chat with a Lawyer
        </button>
      </div>

      {success && <div className="mt-3 text-sm text-green-700">{success}</div>}
    </form>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a2847] via-[#243a5e] to-[#1a2847] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-1 bg-[#ff9933]"></div>
              <div className="w-24 h-1 bg-white mx-2"></div>
              <div className="w-24 h-1 bg-[#138808]"></div>
            </div>
            
            <h1 className="text-5xl mb-6">
              Understand Indian Laws, Crime Trends, and Court Judgments – Simplified using AI
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-lg">Law made simple for citizens</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-lg">Real crime data analytics</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-lg">Supreme Court judgments explained</p>
              </div>
            </div>
            
            <div className="bg-yellow-100 text-[#1a2847] p-4 rounded-lg mb-8 inline-block">
              <p className="flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5" />
                <span>Responsible AI • Not Legal Advice • Educational Purpose Only</span>
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link to="/onboarding/personal" className="px-8 py-4 bg-[#ff9933] text-white rounded-lg hover:bg-[#ff8800] transition-all transform hover:scale-105">
                Create Account
              </Link>
              <a href="#features" className="px-8 py-4 bg-white text-[#1a2847] rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 text-[#1a2847]">Who Is This Platform For?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: GraduationCap, title: 'Students', desc: 'Learn Indian law in simple terms' },
              { icon: Users, title: 'Citizens', desc: 'Know your rights and duties' },
              { icon: BarChart3, title: 'Researchers', desc: 'Access crime data analytics' },
              { icon: BookOpen, title: 'Legal Aspirants', desc: 'Prepare for legal careers' },
              { icon: Building2, title: 'NGOs & Policy Analysts', desc: 'Data-driven insights' }
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-xl transition-all transform hover:scale-105 border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#1a2847] rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-[#ff9933]" />
                  </div>
                  <h3 className="mb-2 text-[#1a2847]">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 text-[#1a2847]">Key Features Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'IPC Law Assistant',
                desc: 'Search and understand IPC sections in simple language. Know what is bailable and non-bailable.',
                color: 'bg-blue-500'
              },
              {
                icon: Gavel,
                title: 'Supreme Court Judgment Explorer',
                desc: 'AI-powered search through Supreme Court judgments with simplified explanations.',
                color: 'bg-purple-500'
              },
              {
                icon: BarChart3,
                title: 'Crimes Against Women Analytics',
                desc: 'Visualize trends, patterns, and statistics about crimes against women in India.',
                color: 'bg-pink-500'
              },
              {
                icon: Brain,
                title: 'Case Outcome Predictor (Prototype)',
                desc: 'Educational AI model to understand potential case outcomes based on facts.',
                color: 'bg-indigo-500'
              },
              {
                icon: Shield,
                title: 'Legal Awareness Tools',
                desc: 'Know Your Rights, FAQs, and educational content for legal awareness.',
                color: 'bg-green-500'
              },
              {
                icon: BarChart3,
                title: 'Crime Trends (IPC)',
                desc: 'Year-wise crime statistics and trends across different IPC sections.',
                color: 'bg-orange-500'
              }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-xl transition-all border-l-4 border-[#1a2847]">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl mb-3 text-[#1a2847]">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Consulting Section */}
      <section id="legal-consulting" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-6 text-[#1a2847]">Legal Consulting</h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-6">
            Connect directly with a qualified lawyer for a private consultation. Choose a call or chat
            and provide a few details before we connect you. Prices are shown upfront.
          </p>

          <div className="max-w-4xl mx-auto bg-gray-50 border rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl mb-2 text-[#1a2847]">Consultation Details</h3>
                <p className="text-sm text-gray-600 mb-4">30-minute consultation with a licensed lawyer.</p>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">Price</p>
                  <div className="text-2xl font-semibold text-[#1a2847]">₹500</div>
                  <p className="text-xs text-gray-500">Payable before connection. Taxes may apply.</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">Lawyer Credentials</p>
                  <div className="mt-2 text-sm text-gray-600">Name: <span className="font-medium">Adv. [Placeholder]</span></div>
                  <div className="text-sm text-gray-600">Experience: <span className="font-medium">10+ years</span></div>
                  <div className="text-sm text-gray-600">Specialization: <span className="font-medium">Criminal & Civil</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-xl mb-2 text-[#1a2847]">Your Details</h3>
                <LegalConsultForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatPopup />

      {/* Ethics & Disclaimer */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 text-[#1a2847]">Ethics & Disclaimer</h2>
          
          <div className="bg-yellow-50 border-l-4 border-[#ff9933] p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl mb-3 text-[#1a2847]">✓ What This Is</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Educational and decision-support tool</li>
                  <li>• Trusted Indian legal datasets</li>
                  <li>• Transparent AI usage</li>
                  <li>• Free for all citizens</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl mb-3 text-[#1a2847]">✗ What This Is NOT</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Not a replacement for lawyers</li>
                  <li>• Not official legal advice</li>
                  <li>• Not for collecting PII</li>
                  <li>• Not for commercial use</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
