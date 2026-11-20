import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Percent,
  Megaphone,
  Mail,
  MessageSquare,
  Share2,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Wand2,
  Clock,
  Layers,
  Sparkle,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CHANNELS = [
  { id: 'email', name: 'Email Marketing', icon: Mail, cost: '$0.05 / contact' },
  { id: 'sms', name: 'SMS Blast', icon: MessageSquare, cost: '$0.15 / contact' },
  { id: 'social_ads', name: 'Social Ads (Meta/IG)', icon: Share2, cost: '$0.75 / click' },
  { id: 'vip_concierge', name: 'VIP Concierge / Mailer', icon: Award, cost: '$8.50 / client' },
];

const OBJECTIVES = [
  { id: 'vip_showcase', label: 'Luxury & Private Preview', desc: 'Focus on exclusivity, early access, and premier styling.' },
  { id: 'flash_sale', label: 'Flash Sale & Urgency', desc: 'Limited-time discount and high-conversion urgency.' },
  { id: 'winback', label: 'Customer Win-Back', desc: 'Reactivate dormant high-potential or past customers.' },
  { id: 'cross_sell', label: 'Curated Bundles & Upsell', desc: 'Recommend trending pairings to boost average order value.' },
];

const TONES = [
  { id: 'luxury', label: 'Prestige & Exclusive' },
  { id: 'urgent', label: 'High Urgency & Fast-Action' },
  { id: 'trendy', label: 'Vibrant & Trend-Forward' },
  { id: 'friendly', label: 'Warm & Community-Driven' },
];

export default function CampaignSimulatorPage() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [budget, setBudget] = useState(2500);
  const [discountPct, setDiscountPct] = useState(15);
  const [channel, setChannel] = useState('email');
  const [simResult, setSimResult] = useState(null);
  const [clvData, setClvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // AI Copywriter Studio State
  const [objective, setObjective] = useState('vip_showcase');
  const [brandTone, setBrandTone] = useState('luxury');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [summaryRes, clvRes] = await Promise.all([
          apiService.getClusterSummary(),
          apiService.getClvAnalysis(),
        ]);
        setClusters(summaryRes);
        setClvData(clvRes);
        // Run initial simulation
        const initialSim = await apiService.simulateCampaign({
          cluster_id: 0,
          budget: 2500,
          discount_pct: 15,
          channel: 'email',
        });
        setSimResult(initialSim);
      } catch (err) {
        console.error('Failed to initialize simulator:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const runSimulation = async (cId, bgt, disc, ch) => {
    try {
      setSimulating(true);
      const res = await apiService.simulateCampaign({
        cluster_id: Number(cId),
        budget: Number(bgt),
        discount_pct: Number(disc),
        channel: ch,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation calculation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleClusterChange = (cId) => {
    setSelectedCluster(cId);
    // Auto-align objective to persona
    if (cId === 1) {
      setObjective('vip_showcase');
      setBrandTone('luxury');
    } else if (cId === 2) {
      setObjective('flash_sale');
      setBrandTone('trendy');
    } else if (cId === 3) {
      setObjective('winback');
      setBrandTone('luxury');
    } else if (cId === 4) {
      setObjective('flash_sale');
      setBrandTone('urgent');
    } else {
      setObjective('cross_sell');
      setBrandTone('friendly');
    }
    runSimulation(cId, budget, discountPct, channel);
  };

  const handleBudgetChange = (val) => {
    setBudget(val);
    runSimulation(selectedCluster, val, discountPct, channel);
  };

  const handleDiscountChange = (val) => {
    setDiscountPct(val);
    runSimulation(selectedCluster, budget, val, channel);
  };

  const handleChannelChange = (ch) => {
    setChannel(ch);
    runSimulation(selectedCluster, budget, discountPct, ch);
  };

  // Dynamic AI Marketing Copy Generation Engine
  const generateCampaignCopy = () => {
    const currentPersona =
      clusters.find((c) => c.cluster === selectedCluster)?.persona || 'Target Audience';

    if (selectedCluster === 1) {
      // VIP / Premium Customer
      if (channel === 'vip_concierge') {
        return {
          subject: 'Private Invitation: An Exclusive Salon for Platinum Members',
          altSubject: 'Reserved for You: Private Atelier Preview & Bespoke Styling',
          body: `Dear Valued Guest,\n\nBecause of your distinguished patronage, our Private Client Suite is pleased to reserve priority access for you to preview our upcoming Haute Couture & Fine Watchmaking capsule before general debut.\n\nEnjoy a dedicated styling consultant, champagne reception, and a complimentary $150 private credit applied toward your bespoke selections.\n\nPlease confirm your preferred consultation appointment through your personal concierge at your earliest convenience.`,
          cta: 'Reserve Private Consultation',
          incentive: '$150 Private Credit on Purchases >$500 + Bespoke Styling',
          timing: 'Thursday 6:00 PM – Peak evening leisure for affluent executives',
        };
      } else if (channel === 'sms') {
        return {
          subject: 'SMS: Exclusive Platinum Pass',
          altSubject: 'SMS: VIP Private Access',
          body: `Private Client Alert: Platinum Member preview is live. Enjoy early-access luxury capsule + champagne styling pass: mall.luxury/vip-pass`,
          cta: 'Unlock Platinum Pass',
          incentive: 'Early-Access Pass + Double Tier Points',
          timing: 'Friday 4:30 PM – Ahead of weekend appointments',
        };
      } else if (channel === 'social_ads') {
        return {
          subject: 'Ad Headline: Rare. Refined. Reserved for the Discerning.',
          altSubject: 'Ad Headline: Where Precision Meets Exceptional Luxury.',
          body: `Step into an atelier curated exclusively for modern visionaries. Experience uncompromising craftsmanship and private salon appointments.\n\n✨ Priority Access to Vault Collections\n✨ Bespoke Personal Shopper Pairing\n✨ Complimentary Valet & Private Suite`,
          cta: 'Explore Private Collections',
          incentive: 'Complimentary Concierge Styling Session',
          timing: 'Evenings 7:00 PM – 10:00 PM on Instagram/Meta',
        };
      } else {
        return {
          subject: 'Exclusive Invitation: The Annual Haute Horlogerie & Fashion Salon',
          altSubject: 'Your Personal Preview: New Season Luxury Arrivals',
          body: `Dear {{Customer_Name}},\n\nAs one of our most valued clientele, you are cordially invited to an intimate evening celebrating our finest new arrivals.\n\nWe have set aside exclusive allocations in limited-edition designer apparel and prestige timepieces, with your ${discountPct}% private patron discount credited on checkout.\n\nWe look forward to welcoming you to the Private Salon.`,
          cta: 'Access Private Collection',
          incentive: `${discountPct}% Private Patron Allowance + Priority Delivery`,
          timing: 'Wednesday 11:30 AM – Executive coffee break dispatch',
        };
      }
    } else if (selectedCluster === 2) {
      // Low Income, High Spending (Carefree Trend Spenders)
      if (channel === 'sms') {
        return {
          subject: 'SMS: ⚡ 24-Hour Trend Drop Alert!',
          altSubject: 'SMS: Don’t sleep on this viral drop 🔥',
          body: `🔥 FLASH DROP: Viral streetwear & beauty sets just dropped! Take ${discountPct}% OFF with code TREND${discountPct} before it sells out: mall.shop/drop`,
          cta: 'Shop Trend Drop',
          incentive: `${discountPct}% Flash Voucher + 0% Interest Split Pay`,
          timing: 'Friday 6:00 PM – Weekend leisure kickoff',
        };
      } else if (channel === 'social_ads') {
        return {
          subject: 'Ad: The Season’s Most Viral Drops Are Here 💥',
          altSubject: 'Ad: Upgrade Your Look for Less. Limited Stock!',
          body: `Turn heads without breaking the bank. Discover the trendiest streetwear, sneaker silhouettes, and beauty capsules with an extra ${discountPct}% off!\n\n⚡ Instant ${discountPct}% Off Checkout Code\n⚡ Buy Now, Split in 4 Easy Payments\n⚡ Same-Day Mall Delivery Available`,
          cta: 'Grab Yours Now',
          incentive: `Extra ${discountPct}% Off code + Free Sticker Pack`,
          timing: 'Daily 5:00 PM – 11:00 PM (TikTok & Instagram Reels)',
        };
      } else {
        return {
          subject: `⚡ Drop Alert: Save ${discountPct}% on This Weekend’s Hottest Fits!`,
          altSubject: `Ready to turn heads? Your ${discountPct}% discount code is waiting 🔥`,
          body: `Hey {{Customer_Name}},\n\nThe latest viral drop has officially arrived, and it's already flying off the shelves!\n\nFrom trending oversized silhouettes to must-have footwear, get the styles everyone is talking about with an exclusive ${discountPct}% off for the next 24 hours.\n\nUse code TREND${discountPct} at checkout. Don't wait—once they're gone, they're gone!`,
          cta: 'Shop the Drop Now',
          incentive: `${discountPct}% Off Flash Promo + Free Express Shipping`,
          timing: 'Saturday 10:30 AM – Morning browsing rush',
        };
      }
    } else if (selectedCluster === 3) {
      // High Income, Low Spending (Under-Engaged / Potential Target)
      return {
        subject: `Crafted for Enduring Quality: Discover What Sets Us Apart`,
        altSubject: `A Special Re-Introduction: Experience True Value & Craftsmanship`,
        body: `Dear {{Customer_Name}},\n\nWe appreciate that true quality speaks for itself. That's why we invite you to re-discover our curated catalog of timeless essentials, artisan leather goods, and premium home accents.\n\nTo thank you for your ongoing consideration, enjoy ${discountPct}% off your next order, accompanied by a 100-day satisfaction guarantee and complimentary premium return service.\n\nInvest in items designed to last a lifetime.`,
        cta: 'Discover Timeless Pieces',
        incentive: `${discountPct}% Quality Showcase Voucher + 100-Day Guarantee`,
        timing: 'Tuesday 8:30 AM – Professional commute & morning focus window',
      };
    } else if (selectedCluster === 4) {
      // Low Income, Low Spending (Budget-Conscious / Cautious Shopper)
      return {
        subject: `Big Savings on Everyday Essentials: Extra ${discountPct}% Off Today!`,
        altSubject: `Stock Up & Save: Unbeatable Clearance & Bulk Deals Inside`,
        body: `Hello {{Customer_Name}},\n\nStretch your budget further with this week's smart savings! Save up to ${discountPct}% across our entire grocery, household staples, and seasonal clearance collections.\n\nCombine discounts with our Loyalty Rewards to earn double cashback on every dollar spent.\n\nShop smart and save more today!`,
        cta: 'View Clearance Deals',
        incentive: `Extra ${discountPct}% Off Bulk Orders + Double Cashback Points`,
        timing: 'Thursday 10:00 AM – Grocery & weekend planning period',
      };
    } else {
      // Moderate Income, Moderate Spending (Mainstream / Core Customer)
      return {
        subject: `Seasonal Refresh: Hand-Picked Styles Just for You (Take ${discountPct}% Off)`,
        altSubject: `Your Seasonal Favorites Are In Stock! Plus a Special Perk Inside`,
        body: `Hi {{Customer_Name}},\n\nReady for a fresh update? We've curated a personalized selection of everyday favorites and new arrivals matching your taste.\n\nAs a valued Core Member, take ${discountPct}% off your favorite category this week, plus earn 2x bonus points toward your next shopping tier.\n\nThank you for being part of our community!`,
        cta: 'Shop Your Curated Picks',
        incentive: `${discountPct}% Category Reward Voucher + 2x Loyalty Points`,
        timing: 'Sunday 4:00 PM – Sunday evening relaxation browsing',
      };
    }
  };

  const copyBrief = () => {
    const copy = generateCampaignCopy();
    const briefText = `=== CAMPAIGN CREATIVE BRIEF ===
Target Segment: ${clusters.find((c) => c.cluster === selectedCluster)?.persona || 'Segment'} (Cluster ${selectedCluster})
Channel: ${channel}
Campaign Objective: ${objective}
Brand Tone: ${brandTone}
Budget Allocated: $${budget.toLocaleString()}
Discount Offered: ${discountPct}%

Projected ROAS: ${simResult?.metrics?.roas || 0}x
Estimated Revenue: $${Number(simResult?.metrics?.gross_revenue || 0).toLocaleString()}
Projected Net Profit: $${Number(simResult?.metrics?.net_profit || 0).toLocaleString()}

--- CREATIVE ASSETS ---
Primary Subject / Headline:
${copy.subject}

A/B Test Variant:
${copy.altSubject}

Call to Action (CTA):
${copy.cta}

Incentive Offer:
${copy.incentive}

Optimal Dispatch Window:
${copy.timing}

Body Copy:
${copy.body}
================================`;

    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadBrief = () => {
    const copy = generateCampaignCopy();
    const briefText = `=== CAMPAIGN CREATIVE BRIEF ===\nTarget Segment: ${clusters.find((c) => c.cluster === selectedCluster)?.persona || 'Segment'} (Cluster ${selectedCluster})\nChannel: ${channel}\nBudget: $${budget}\nDiscount: ${discountPct}%\nROAS: ${simResult?.metrics?.roas}x\n\nSubject: ${copy.subject}\nAlt Subject: ${copy.altSubject}\nCTA: ${copy.cta}\nIncentive: ${copy.incentive}\nTiming: ${copy.timing}\n\nBody Copy:\n${copy.body}\n`;
    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Campaign_Brief_Cluster_${selectedCluster}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Calibrating marketing simulation economics..." />;
  }

  const metrics = simResult?.metrics || {};
  const inputs = simResult?.simulation_inputs || {};
  const currentPersona = clusters.find((c) => c.cluster === selectedCluster);
  const copyAsset = generateCampaignCopy();

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-4 h-4" />
              Strategic Growth & Decision Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Marketing Campaign ROI & Creative Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 max-w-2xl">
              Model audience reach, unit economics, and return on ad spend (ROAS) across cohorts, and generate tailored marketing copy on the fly.
            </p>
          </div>

          {currentPersona && (
            <div className="flex items-center gap-3 bg-purple-50/50 border border-purple-100 p-3 rounded-2xl">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: currentPersona.color }}
              >
                C{currentPersona.cluster}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {currentPersona.persona}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentPersona.customer_count} shoppers ({currentPersona.percentage}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs Control Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="analytics-card p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-purple-50 pb-3">
              <Target className="w-4 h-4 text-[#7c3aed]" />
              Campaign Parameters
            </h3>

            {/* Target Segment Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                1. Target Customer Segment
              </label>
              <div className="space-y-1.5">
                {clusters.map((c) => {
                  const isSelected = selectedCluster === c.cluster;
                  return (
                    <button
                      key={c.cluster}
                      onClick={() => handleClusterChange(c.cluster)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#7c3aed] bg-purple-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-purple-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Cluster {c.cluster}: {c.persona}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Avg Spend: ${c.average_income}k · Index: {c.average_spending_score}/100
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {c.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Marketing Channel Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                2. Marketing Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleChannelChange(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#7c3aed] bg-purple-50/60 shadow-xs ring-1 ring-purple-300'
                          : 'border-slate-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#7c3aed]' : 'text-slate-400'}`} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{ch.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ch.cost}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  3. Marketing Budget Allocation
                </label>
                <span className="font-mono text-xs font-extrabold text-[#7c3aed]">
                  ${budget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={budget}
                onChange={(e) => handleBudgetChange(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$500</span>
                <span>$5,000</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Promotional Discount Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  4. Promotional Discount Offered
                </label>
                <span className="font-mono text-xs font-extrabold text-[#7c3aed]">
                  {discountPct}% OFF
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={discountPct}
                onChange={(e) => handleDiscountChange(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Full Price)</span>
                <span>20% (Standard)</span>
                <span>40% (Aggressive Clearance)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial ROAS Projections & Unit Economics */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Projection KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Projected ROAS */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-purple-50/40 border-l-4 border-l-[#7c3aed]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PROJECTED ROAS
              </span>
              <div className="text-3xl font-extrabold text-[#7c3aed] font-display mt-1">
                {metrics.roas}x
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                Return on Ad Spend
              </span>
            </div>

            {/* Net Profit Card */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-emerald-50/30">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ESTIMATED NET PROFIT
              </span>
              <div
                className={`text-3xl font-extrabold font-display mt-1 ${
                  metrics.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                ${Number(metrics.net_profit || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block mt-1">
                ROI: {metrics.roi_percentage}%
              </span>
            </div>

            {/* Projected Conversions */}
            <div className="analytics-card p-5 bg-gradient-to-br from-white to-blue-50/30">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                EST. ORDERS
              </span>
              <div className="text-3xl font-extrabold text-blue-700 font-display mt-1">
                {Number(metrics.estimated_conversions || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block mt-1">
                Conv Rate: {metrics.conversion_rate_pct}%
              </span>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              metrics.roas >= 2.5
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : metrics.roas >= 1.0
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {metrics.roas >= 2.5 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <h4 className="text-xs font-bold tracking-tight">
                  {metrics.verdict}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Audience size reached: {Number(metrics.contacts_reached || 0).toLocaleString()} shoppers
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 shadow-xs uppercase">
              {metrics.verdict_badge}
            </span>
          </div>

          {/* Financial Breakdown Table */}
          <div className="analytics-card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Financial Breakdown & Unit Economics
            </h3>
            <div className="divide-y divide-purple-50 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Target Segment</span>
                <span className="font-bold text-slate-800">{inputs.persona}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Marketing Channel</span>
                <span className="font-bold text-slate-800">{inputs.channel}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Discount Offered</span>
                <span className="font-mono font-bold text-slate-800">{inputs.discount_pct}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Effective Average Order Value (AOV)</span>
                <span className="font-mono font-bold text-slate-800">
                  ${metrics.discounted_aov} (Base: ${metrics.undiscounted_aov})
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Estimated Gross Revenue</span>
                <span className="font-mono font-extrabold text-[#7c3aed]">
                  ${Number(metrics.gross_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Cost of Goods & Fulfillment (COGS)</span>
                <span className="font-mono text-slate-700">
                  -${Number(metrics.total_cogs || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Campaign Marketing Spend</span>
                <span className="font-mono text-slate-700">
                  -${Number(inputs.budget || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-3 flex justify-between text-sm font-bold bg-purple-50/40 -mx-6 px-6 mt-2 rounded-xl">
                <span className="text-slate-900">Projected Net Contribution Profit</span>
                <span
                  className={`font-mono ${
                    metrics.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  ${Number(metrics.net_profit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW FEATURE: AI Marketing Copywriter & Creative Studio */}
      <div className="analytics-card p-6 sm:p-8 border-2 border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-purple-100">
          <div>
            <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              AI Creative Studio
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Personalized Campaign Copy Generator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generates high-converting marketing copy and subject lines dynamically calibrated to the target cluster persona ({currentPersona?.persona}) and channel ({channel}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyBrief}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Brief!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={downloadBrief}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Export .txt</span>
            </button>
          </div>
        </div>

        {/* Objective & Tone Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Campaign Objective
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    objective === obj.id
                      ? 'border-[#7c3aed] bg-white text-[#7c3aed] ring-1 ring-purple-300 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <p className="font-bold">{obj.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Brand Voice & Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBrandTone(t.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    brandTone === t.id
                      ? 'border-[#7c3aed] bg-white text-[#7c3aed] ring-1 ring-purple-300 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <p className="font-bold">{t.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Creative Kit Box */}
        <div className="space-y-4">
          {/* Subject Lines */}
          <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider block">
                  PRIMARY SUBJECT LINE / AD HOOK
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  High Open Rate
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mt-1 select-all font-mono">
                {copyAsset.subject}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                A/B TEST VARIANT
              </span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 select-all font-mono">
                {copyAsset.altSubject}
              </p>
            </div>
          </div>

          {/* Copy Body */}
          <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider block mb-2">
              PERSONA-TAILORED CREATIVE COPY ({channel.toUpperCase()})
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-sans leading-relaxed whitespace-pre-line border border-slate-200/60 select-all">
              {copyAsset.body}
            </div>
          </div>

          {/* Ancillary Metadata Cards: CTA, Offer, Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CALL TO ACTION (CTA)
              </span>
              <p className="text-xs font-extrabold text-[#7c3aed] mt-1">
                {copyAsset.cta}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                OPTIMAL INCENTIVE
              </span>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                {copyAsset.incentive}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#7c3aed]" />
                DISPATCH WINDOW
              </span>
              <p className="text-xs font-medium text-slate-700 mt-1">
                {copyAsset.timing}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
