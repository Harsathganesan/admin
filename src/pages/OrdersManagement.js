import React, { useState } from 'react';
import OrderTable from '../components/OrderTable';
import { Search, Filter } from 'lucide-react';

const OrdersManagement = ({ orders, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem' }}>My Orders</h1>

      <div className="card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1.5rem'
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: '#64748b', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
              style={{ 
                width: '100%', 
                paddingLeft: '2.5rem', 
                minWidth: 0,
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '0.875rem'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <Filter size={16} color="#64748b" />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.625rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>

        <OrderTable orders={filteredOrders} onUpdateStatus={onUpdateStatus} />
      </div>
    </div>
  );
};

export default OrdersManagement;
