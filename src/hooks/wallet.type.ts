import { FedimintWallet } from "@fedimint/core-web"

export type Wallet = FedimintWallet

export type BalanceResponse = number | undefined

export type MintSpendNotesResponse = {
  notes:string,
  operationId:string
}

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
  id:string,
  fee:number,
  payType:string
};

export type OutgoingLightningPayment = {
  contract_id: string;
  fee: number;
};

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

export type PeginResponse={
  deposit_address:string,
  operation_id:string
}

export type ParsedInvoice={
  amount:number,
  expiry:string,
  memo:string
}

export type InvoiceState={
  timestamp:string,
  invoiceId:string,
  operationId:string,
  status:string,
  location?:{longitude:number,latitude:number} | null,
}

export type Nip47Transaction = {
    amount: number;
    created_at: number;
    description: string;
    description_hash: string;
    expires_at: number;
    fees_paid: number;
    invoice: string;
    payment_hash: string;
    preimage: string;
    settle_deadline?: number;
    settled_at: number;
    state: "settled" | "pending" | "failed";
    type: "incoming" | "outgoing";
};

export type Transaction= {
  amountMsats:string
  invoice:string
  gateway:string
  timestamp:string
  operationId:string
  kind:string
  type:string
  outcome:string
}