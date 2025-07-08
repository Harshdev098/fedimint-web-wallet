
export default function Faq() {
    return (
        <div className="settings-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            
            <div className="settings-grid">
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>What is Fedimint?</h3>
                        <p>Fedimint is a federated protocol that enables community-based custody and management of Bitcoin, providing privacy and scalability through a trusted group of guardians.</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>How do I join a federation?</h3>
                        <p>To join a federation, you typically need an invitation from an existing member or guardian. Navigate to the Federations section and follow the link to explore available groups.</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>What happens if guardians go offline?</h3>
                        <p>Fedimint is designed to be fault-tolerant. As long as a threshold number of guardians remain online, the federation can continue to operate normally.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}