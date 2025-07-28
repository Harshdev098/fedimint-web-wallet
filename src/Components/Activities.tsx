import { useState } from 'react'
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import Alerts from './Alerts';
import { useNavigate } from 'react-router';

export default function Activities() {
    const { error } = useSelector((state: RootState) => state.Alert)
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const navigate = useNavigate()

    const toggleExpanded = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    return (
        <div className="activities-wrapper">
            {error && <Alerts key={Date.now()} Error={error} Result={''} />}
            
            <div className="activities-container">
                {/* Header Section */}
                <div className="activities-header">
                    <div className="tx-">
                        <div className="tx-header-icon">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <h1 className="activities-title">Recent Activities</h1>
                        <p className="activities-subtitle">Track and manage your latest transactions</p>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="transaction-section">
                    <div className="transaction-item">
                        <div className="transaction-main" onClick={() => toggleExpanded('dsfsd')}>
                            <div className="transaction-left">
                                <div className="transaction-icon received">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 5v14M5 12l7 7 7-7" />
                                    </svg>
                                </div>
                                <div className="transaction-info">
                                    <h3 className="transaction-type">Payment Received</h3>
                                    <p className="transaction-time">2 hours ago</p>
                                    <span className="transaction-method">Lightning Network</span>
                                </div>
                            </div>
                            
                            <div className="transaction-right">
                                <div className="transaction-amount-section">
                                    <p className="transaction-amount positive">+2,000 sat</p>
                                <span className="transaction-status success">Claimed</span>
                                </div>
                                <button className="expand-button">
                                    <svg
                                        className={`expand-icon ${expandedId === 'dsfsd' ? 'expanded' : ''}`}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === 'dsfsd' && (
                            <div className="transaction-details">
                                <div className="details-container">
                                    <div className="details-row">
                                        <div className="detail-group">
                                            <span className="detail-label">Transaction Type</span>
                                            <span className="detail-value">Lightning Payment</span>
                                        </div>
                                        <div className="detail-group">
                                            <span className="detail-label">Operation ID</span>
                                            <span className="detail-value">sdfsdfsd</span>
                                        </div>
                                    </div>
                                    
                                    <div className="details-row">
                                        <div className="detail-group">
                                            <span className="detail-label">Status</span>
                                            <span className="detail-value status-success">Claimed</span>
                                        </div>
                                        <div className="detail-group">
                                            <span className="detail-label">Network Fees</span>
                                            <span className="detail-value">23 SAT</span>
                                        </div>
                                    </div>
                                    
                                    <div className="detail-group full-width">
                                        <span className="detail-label">Invoice Hash</span>
                                        <span className="detail-value hash">sdfsdfs...truncated</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="activities-footer">
                    <button 
                        className="tx-link" 
                        onClick={() => navigate('/wallet/transactions')}
                    >
                        View All Transactions
                    </button>
                    
                    <button 
                        className="manage-invoices-btn" 
                        onClick={() => navigate('/wallet/invoices')}
                    >
                        <i className="fa-solid fa-file-lines"></i>
                        Manage Invoices
                    </button>
                </div>
            </div>
        </div>
    );
}