export interface InviteCode {
    code: string
}
export type Federation = {
    inviteCode: string
    federationId: string
    federationName?:string
    iconUrl?:string
}

export type FederationMeta = {
    federation_name: string;
    meta_external_url?: string;
};

export type FederationMetaData = {
    federation_name: string;
    welcome_message?: string;
    invite_code?: string;
    pinned_message?:string;
    onchain_deposits_disabled?:string;
    federation_icon_url?:string;
    max_stable_balance_msats?:string;
    federation_expiry_timestamp?:number | null;
}

export type FederationConfig = {
    api_endpoints: Record<number, any>;
    broadcast_public_keys: Record<number, string>;
    consensus_version: { major: number; minor: number };
    meta: FederationMeta;
    modules: Record<number, any>;
};

export type FederationDetailResponse = {
    details: FederationConfig,
    meta: FederationMetaData
}

export type FederationID = string

export type JoinFedResponse = {
    success: boolean,
    message: string,
    federationID: FederationID
}

export type PreviewFederationResponse={
    fedName:string,
    iconUrl?:string,
    consensousVersion:{ major: number; minor: number }
    federationID:string,
}

export type EpochTime = {
  secs_since_epoch: number;
  nanos_since_epoch: number;
};

export type GuardianStatus={
    status:Record<number,string>
}