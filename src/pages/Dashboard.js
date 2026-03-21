import React, { useMemo, useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp, LayoutGrid, Palette } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

// HIGHLY PROFESSIONAL ACTIVE SHAPE WITH EXTERNAL LABELS (DESKTOP) AND INTERNAL LABELS (MOBILE)
const renderStatusShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  const isMobileView = window.innerWidth < 768;

  // For Desktop
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 22) * cos;
  const my = cy + (outerRadius + 22) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + (isMobileView ? 4 : 6)}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      
      {!isMobileView ? (
        <>
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#1e293b" style={{ fontSize: '12px', fontWeight: 800 }}>{payload.name}</text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={16} textAnchor={textAnchor} fill="#64748b" style={{ fontSize: '10px', fontWeight: 600 }}>
            {`Orders: ${value}`}
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#1e293b" style={{ fontSize: '12px', fontWeight: 800 }}>{payload.name}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" style={{ fontSize: '10px', fontWeight: 600 }}>
            {`Orders: ${value}`}
          </text>
        </>
      )}
    </g>
  );
};

const Dashboard = ({ orders = [] }) => {
  const [viewType, setViewType] = useState('monthly');
  const [activeSize, setActiveSize] = useState(0); 
  const [activeType, setActiveType] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [mounted, setMounted] = useState(false);

  // Track window size for chart responsiveness
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return {
      total: list.length,
      pending: list.filter(o => o.status === 'Pending').length,
      accepted: list.filter(o => o.status === 'Accepted').length,
      declined: list.filter(o => o.status === 'Declined').length,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (viewType === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const monthlyArray = months.map(name => ({ name, orders: 0, revenue: 0 }));
      list.forEach(order => {
        const date = new Date(order.orderDate || order.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          monthlyArray[monthIndex].orders += 1;
          if (order.status === 'Accepted') monthlyArray[monthIndex].revenue += (Number(order.price) || 0);
        }
      });
      return monthlyArray;
    } 
    const yearsMap = {};
    list.forEach(order => {
      const year = new Date(order.orderDate || order.createdAt).getFullYear();
      if (!yearsMap[year]) yearsMap[year] = { name: year.toString(), orders: 0, revenue: 0 };
      yearsMap[year].orders += 1;
      if (order.status === 'Accepted') yearsMap[year].revenue += (Number(order.price) || 0);
    });
    return Object.values(yearsMap).sort((a,b) => Number(a.name) - Number(b.name));
  }, [orders, viewType]);

  const preferences = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const sizeMap = {};
    const typeMap = {};
    list.forEach(o => {
      if (o.size) sizeMap[o.size] = (sizeMap[o.size] || 0) + 1;
      if (o.drawingType) typeMap[o.drawingType] = (typeMap[o.drawingType] || 0) + 1;
    });
    return {
      sizes: Object.entries(sizeMap).map(([name, value]) => ({ name, value })),
      types: Object.entries(typeMap).map(([name, value]) => ({ name, value }))
    };
  }, [orders]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: isMobile ? '1.25rem' : '2rem',
    width: '100%',
    boxSizing: 'border-box',
    minWidth: 0
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '100%', overflowX: 'hidden' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#1e293b', padding: '0 10px' }}>Welcome to Harsatharts9</h1>
      
      <div className="stats-grid">
        <StatCard label="Total Orders" value={stats.total} icon={ShoppingBag} color="#6366f1" gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="#f59e0b" gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} color="#10b981" gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)" />
        <StatCard label="Declined" value={stats.declined} icon={XCircle} color="#ef4444" gradient="linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)" />
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Performance Analysis</h2>
          </div>
          <div style={{ width: '100%', height: 320, minWidth: '100px', minHeight: '100px', display: 'flex' }}>
            {mounted && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar name="Orders" dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Income" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(Min(100%, 350px), 1fr))', gap: '1.5rem', width: '100%' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <LayoutGrid size={24} color="#6366f1" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Size Distribution</h3>
            </div>
            <div style={{ width: '100%', height: 350, minWidth: '100px', minHeight: '100px', display: 'flex' }}>
              {mounted && preferences.sizes.length > 0 && (
                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                  <PieChart margin={{ left: 40, right: 40 }}> {/* Added lateral margins for mobile labels */}
                    <Pie 
                      activeIndex={activeSize}
                      activeShape={renderStatusShape}
                      data={preferences.sizes} 
                      cx="50%" cy="50%" 
                      innerRadius={isMobile ? 50 : 60} // Smaller inner radius on mobile
                      outerRadius={isMobile ? 70 : 85} // Smaller outer radius on mobile
                      dataKey="value" stroke="none"
                      onMouseEnter={(_, index) => setActiveSize(index)}
                      onClick={(_, index) => setActiveSize(index)}
                    >
                      {preferences.sizes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Palette size={24} color="#ec4899" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Artwork Insights</h3>
            </div>
            <div style={{ width: '100%', height: 350, minWidth: '100px', minHeight: '100px', display: 'flex' }}>
              {mounted && preferences.types.length > 0 && (
                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                  <PieChart margin={{ left: 40, right: 40 }}> {/* Added lateral margins for mobile labels */}
                    <Pie 
                      activeIndex={activeType}
                      activeShape={renderStatusShape}
                      data={preferences.types} 
                      cx="50%" cy="50%" 
                      innerRadius={isMobile ? 50 : 60}
                      outerRadius={isMobile ? 70 : 85}
                      dataKey="value" stroke="none"
                      onMouseEnter={(_, index) => setActiveType(index)}
                      onClick={(_, index) => setActiveType(index)}
                    >
                      {preferences.types.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
