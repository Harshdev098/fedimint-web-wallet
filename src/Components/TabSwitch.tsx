import { useState } from 'react'
import Ecash from './Ecash'
import OnChain from '../pages/OnChain'
import Activities from './Activities'
import Tippy from '@tippyjs/react';

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
                <Tippy content='Lightning Activity'>
                    <button className={`${tab === 1 ? 'active-tab' : ''}`} onClick={() => setTab(1)}>
                        <i className="fa-solid fa-bolt"></i>
                        <span className="btn-text"> Lightning</span>
                    </button>
                </Tippy>
                <Tippy content='Ecash Transactions'>
                    <button className={`${tab === 2 ? 'active-tab' : ''}`} onClick={() => setTab(2)}>
                        <i className="fa-solid fa-money-bills"></i>
                        <span className="btn-text"> Ecash</span>
                    </button>
                </Tippy>
                <Tippy content='On-chain Bitcoin Transactions'>
                    <button className={`${tab === 3 ? 'active-tab' : ''}`} onClick={() => setTab(3)}>
                        <i className="fa-brands fa-bitcoin"></i>
                        <span className="btn-text"> Onchain</span>
                    </button>
                </Tippy>
            </div>
            {renderContent()}
        </>
    )
}