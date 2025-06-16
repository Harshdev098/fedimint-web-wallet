export interface InviteCode {
    code: string
}

export type FederationMeta = {
    federation_name: string;
    meta_external_url: string;
};
export type FederationMetaData = {
    federation_name: string;
    welcome_message: string;
    invite_code: string;
    pinned_message:string;
    federation_expiry_timestamp:number | null;
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
    config:{global:FederationConfig},
    federationID:string,
}

export type EpochTime = {
  secs_since_epoch: number;
  nanos_since_epoch: number;
};
