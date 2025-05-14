// import QrScanner from "qr-scanner";
import receiveIcon from '../assets/recieve-icon.png'
import sendIcon from '../assets/send-icon.png'

export default function Ecash() {
    return (
        <section className="BalanceSection" style={{ marginTop: "30px" }}>
            <div className="BalanceSectionTag">
                <button>Transact Ecashes</button>
            </div>

            <div className="EcashTransactionWrapper">
                <div className="SendSection">
                    <h3 className="TransactionHeading">Spend Ecash</h3>
                    <form>
                        <input type="text" placeholder="Enter notes" />
                        <div className="ButtonRow">
                            <button type="submit">
                                <img src={sendIcon} alt="Send" width="20px" /> Send
                            </button>
                            <button type="button">
                                <i className="fa-solid fa-qrcode"></i>
                            </button>
                        </div>
                    </form>
                </div>

                <div className="RecieveSection">
                    <h3 className="TransactionHeading">Redeem Ecash</h3>
                    <form>
                        <input type="text" placeholder="Enter the amount" />
                        <button type="submit">
                            <img src={receiveIcon} alt="Receive" width="20px" /> Receive
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
