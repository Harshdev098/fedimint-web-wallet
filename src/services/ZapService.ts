import type { NDKEvent as NDKEventTYpe, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import NDK,{NDKEvent} from "@nostr-dev-kit/ndk";
import type { Wallet } from "../hooks/wallet.type";
import logger from "../utils/logger";

export async function handleZapRequest(
  event: NDKEventTYpe,
  wallet: Wallet,
  ndk: NDK,
  signer: NDKPrivateKeySigner,
  walletNostrPubKey: string,
): Promise<{ result?: any; error?: any }> {
  try {
    const pTag = event.tags.find((tag) => tag[0] === 'p'); // Recipient pubkey
    const eTag = event.tags.find((tag) => tag[0] === 'e'); // Event being zapped
    const amountTag = event.tags.find((tag) => tag[0] === 'amount'); // Amount
    const lnurlTag = event.tags.find((tag) => tag[0] === 'lnurl'); // LNURL

    if (!pTag || !pTag[1]) {
      return { error: { code: "INVALID_ZAP_REQUEST", message: "Missing or invalid 'p' tag" } };
    }
    if (!amountTag || !amountTag[1]) {
      return { error: { code: "INVALID_ZAP_REQUEST", message: "Missing or invalid 'amount' tag" } };
    }
    if (!lnurlTag || !lnurlTag[1]) {
      return { error: { code: "INVALID_ZAP_REQUEST", message: "Missing or invalid 'lnurl' tag" } };
    }

    const recipientPubkey = pTag[1];
    const lnurl = lnurlTag[1];

    let invoice: string;
    try {
      invoice = await fetchInvoiceFromLnurl(lnurl); // fix: LNURL
      if (!invoice) {
        return { error: { code: "LNURL_ERROR", message: "Failed to fetch invoice from LNURL" } };
      }
    } catch (error) {
      logger.error('Error fetching invoice from LNURL:', error);
      return { error: { code: "LNURL_ERROR", message: "Failed to fetch invoice from LNURL" } };
    }

    const paymentResult = await wallet.lightning.payInvoice(invoice);

    const zapReceipt = new NDKEvent(ndk);
    zapReceipt.kind = 9735;
    zapReceipt.pubkey = walletNostrPubKey;
    zapReceipt.created_at = Math.floor(Date.now() / 1000);
    zapReceipt.tags = [
      ['p', recipientPubkey],
      ['e', eTag ? eTag[1] : ''],
      ['bolt11', invoice],
    //   ['preimage', paymentResult?.preimage || ''],
    ];
    zapReceipt.content = event.content || '';

    await zapReceipt.sign(signer);
    await zapReceipt.publish();
    logger.log('Published zap receipt for invoice:', invoice);

    return { result: { preimage: paymentResult?.payment_type, success: true } };
  } catch (error) {
    logger.error('Error handling zap request:', error);
    return { error: { code: "ZAP_PROCESSING_ERROR", message: "Failed to process zap request" } };
  }
}

async function fetchInvoiceFromLnurl(lnurl: string): Promise<string> {
  try {
    const response = await fetch(lnurl); 
    const data = await response.json();
    if (data.pr) {
      return data.pr;
    }
    throw new Error('No invoice returned from LNURL');
  } catch (error) {
    logger.error('Error fetching LNURL invoice:', error);
    throw error;
  }
}