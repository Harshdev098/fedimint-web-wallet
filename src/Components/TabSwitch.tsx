import { useState } from 'react'
import Ecash from './Ecash'
import OnChain from '../pages/OnChain'
import Activities from './Activities'

export default function TabSwitch() {
    const [tab, setTab] = useState<number>(1)
    
    function renderContent() {
        if (tab === 1) {
            return (
                <>
                    <Activities />
                </>
            )
        }
        if (tab === 2) {
            return <Ecash />
        }
        if (tab === 3) {
            return <OnChain />
        }
        return null
    }
    
    return (
        <>
            <div className='tab-switcher'>
                <button
                    className={`tooltip-btn ${tab === 1 ? 'active-tab' : ''}`}
                    onClick={() => setTab(1)}
                >
                    <i className="fa-solid fa-bolt"></i>
                    <span className="btn-text"> Lightning</span>
                    <span className="tooltip-text">Lightning Activity</span>
                </button>
                <button
                    className={`tooltip-btn ${tab === 2 ? 'active-tab' : ''}`}
                    onClick={() => setTab(2)}
                >
                    <i className="fa-solid fa-money-bills"></i>
                    <span className="btn-text"> Ecash</span>
                    <span className="tooltip-text">Ecash transactions</span>
                </button>
                <button
                    className={`tooltip-btn ${tab === 3 ? 'active-tab' : ''}`}
                    onClick={() => setTab(3)}
                >
                    <i className="fa-brands fa-bitcoin"></i>
                    <span className="btn-text"> Onchain</span>
                    <span className="tooltip-text">On-chain Bitcoin Transactions</span>
                </button>
            </div>
            {renderContent()}
        </>
    )
}