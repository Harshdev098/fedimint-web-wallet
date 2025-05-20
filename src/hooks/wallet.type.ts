import { FedimintWallet } from "@fedimint/core-web"

export type Wallet = FedimintWallet

export type BalanceResponse = number | undefined

export type MintSpendNotesResponse = string

export type MintRedeemStates =
  | 'Created'
  | 'UserCanceledProcessing'
  | 'UserCanceledSuccess'
  | 'UserCanceledFailure'
  | 'Success'
  | 'Refunded'

export type CreateInvoiceResponse = {
  operationId: string
  invoice: string
}

export type InvoicePaymentResponse = {
  success: boolean;
  data?: { preimage: string; feeMsats: number };
  error?: string;
};

export type OutgoingLightningPayment = {
  contract_id: string;
  fee: number;
};

export type LnPayState =
  | { state: 'Pending' }
  | { state: 'Succeeded'; preimage: string; feeMsats: number }
  | { state: 'Failed'; error: string }
  | { state: 'Timeout' };

export type NotesByDenomonationResponse= Record<string,number>

export type TxOutputSummary = {
  outpoint: {
    txid: string;
    vout: number;
  };
  amount: number;
};

export type WalletSummary = {
  spendable_utxos: TxOutputSummary[];
  unsigned_peg_out_txos: TxOutputSummary[];
  unsigned_change_utxos: TxOutputSummary[];
  unconfirmed_peg_out_utxos: TxOutputSummary[];
  unconfirmed_change_utxos: TxOutputSummary[];
};
