import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, MousePointerClick, ArrowUpRight, ArrowDownRight, Calendar 
} from 'lucide-react';

// --- STATIC DATA ---

const kpiData = [
  { id: 1, title: 'Total Revenue', value: '$84,502', change: '+12.5%', isPositive: true, icon: DollarSign },
  { id: 2, title: 'Ad Spend', value: '$12,340', change: '-2.4%', isPositive: true, icon: TrendingUp }, // Less spend is good here
  { id: 3, title: 'Total Clicks', value: '142.8k', change: '+18.2%', isPositive: true, icon: MousePointerClick },
  { id: 4, title: 'New Leads', value: '1,204', change: '-4.1%', isPositive: false, icon: Users },
];

const chartData = [
  { month: 'Jan', revenue: 4000, spend: 2400 },
  { month: 'Feb', revenue: 3000, spend: 1398 },
  { month: 'Mar', revenue: 5000, spend: 3800 },
  { month: 'Apr', revenue: 6780, spend: 3908 },
  { month: 'May', revenue: 5890, spend: 4800 },
  { month: 'Jun', revenue: 8390, spend: 3800 },
  { month: 'Jul', revenue: 9490, spend: 4300 },
];

const trafficSources = [
  { name: 'Organic Search', value: 4500, color: '#3b82f6' },
  { name: 'Social Media', value: 3200, color: '#8b5cf6' },
  { name: 'Paid Ads', value: 2800, color: '#f59e0b' },
  { name: 'Direct', value: 1500, color: '#10b981' },
];

const recentCampaigns = [
  { id: 1, name: 'Summer Sale 2026', status: 'Active', spend: '$3,400', conversions: 432 },
  { id: 2, name: 'Q2 Retargeting', status: 'Paused', spend: '$1,200', conversions: 112 },
  { id: 3, name: 'Brand Awareness', status: 'Active', spend: '$5,600', conversions: 890 },
  { id: 4, name: 'Email Newsletter Promo', status: 'Completed', spend: '$450', conversions: 65 },
];

// --- COMPONENT ---

const MarketingIndex = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Overview</h1>
          <p className="text-sm text-gray-500">Track your campaign performance and ROI.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Last 7 Months</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {kpi.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${kpi.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue vs Spend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue vs Ad Spend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, undefined]}
                />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="spend" name="Ad Spend" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficSources} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {trafficSources.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Campaign Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Spend</th>
                <th className="px-6 py-4 font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                        campaign.status === 'Paused' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{campaign.spend}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{campaign.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MarketingIndex;