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
        <>
            {error && <Alerts key={Date.now()} Error={error} Result={''} />}
            <section className="transaction-container">
                <div className="transaction-header">
                    <h2 className="transaction-title">Your Recent Activities</h2>
                    <p className="transaction-subtitle">View and search your recent transactions</p>
                </div>

                <ul className='transaction-list'>
                    <li className="transaction-item">
                        <div className='tx-list-detail' onClick={() => toggleExpanded('dsfsd')}>
                            <div className='tx-detail'>
                                <div className="tx-icon received">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 5v14M5 12l7 7 7-7" />
                                    </svg>
                                </div>
                                <div className="tx-info">
                                    <h4 className="tx-type">Received</h4>
                                    <p className="tx-time">2 hours ago</p>
                                </div>
                            </div>
                            <div className='tx-meta'>
                                <div className="tx-amount-container">
                                    <p className="tx-amount positive">+2000</p>
                                    <span className='tx-status claimed'>Claimed</span>
                                </div>
                                <div className="expand-btn">
                                    <svg
                                        className={`expand-icon ${expandedId === 'dsfsd' ? 'expanded' : ''}`}
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {expandedId === 'dsfsd' && (
                            <div className='transaction-advanced-details'>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Kind</span>
                                        <span className="detail-value">Lightning</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Operation ID</span>
                                        <span className="detail-value">sdfsdfsd</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Outcome</span>
                                        <span className="detail-value">sdfsd</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Fees</span>
                                        <span className="detail-value">23</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Invoice</span>
                                        <span className="detail-value">sdfsdfs</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                </ul>
                <p className='title-span' style={{ cursor: 'pointer',padding:'20px',fontSize:'1.1rem' }} onClick={() => navigate('/wallet/transactions')}>View all payments <i className="fa-solid fa-arrow-right"></i></p>
                <button onClick={()=>navigate('/wallet/invoices')} style={{float:'right',padding:'0.6rem 1.1rem',cursor:'pointer',backgroundColor:'#2176FF',color:'white',fontSize:'1rem',borderRadius:'0.5rem',border:'none',margin:'2rem 1rem 3rem 1rem'}}><i className="fa-solid fa-file-invoice-dollar"></i> Manage Invoices</button>
            </section>
        </>
    );
}
