import { Account, Chain } from "./deps.ts";
import { CCD001DirectExecute } from "../models/extensions/ccd001-direct-execute.model.ts";
import { BaseDao } from "../models/base-dao.model.ts";

export const ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const BASE_DAO = ADDRESS.concat(".base-dao");

export const EXTENSIONS = {
  CCD001_DIRECT_EXECUTE: ADDRESS.concat(".ccd001-direct-execute"),
  CCD002_TREASURY_MIA: ADDRESS.concat(".ccd002-treasury-mia"),
  CCD002_TREASURY_NYC: ADDRESS.concat(".ccd002-treasury-nyc"),
  CCD003_USER_REGISTRY: ADDRESS.concat(".ccd003-user-registry"),
};

export const PROPOSALS = {
  CCIP_012: ADDRESS.concat(".ccip012-bootstrap"),
  TEST_CCD001_DIRECT_EXECUTE_001: ADDRESS.concat(
    ".ccip-test-direct-execute-001"
  ),
  TEST_CCD001_DIRECT_EXECUTE_002: ADDRESS.concat(
    ".ccip-test-direct-execute-002"
  ),
  TEST_CCD001_DIRECT_EXECUTE_003: ADDRESS.concat(
    ".ccip-test-direct-execute-003"
  ),
  TEST_CCD002_TREASURY_001: ADDRESS.concat(".ccip-test-treasury-001"),
  TEST_CCD002_TREASURY_002: ADDRESS.concat(".ccip-test-treasury-002"),
  TEST_CCD002_TREASURY_003: ADDRESS.concat(".ccip-test-treasury-003"),
  TEST_CCD002_TREASURY_004: ADDRESS.concat(".ccip-test-treasury-004"),
  TEST_CCD002_TREASURY_005: ADDRESS.concat(".ccip-test-treasury-005"),
  TEST_CCD002_TREASURY_006: ADDRESS.concat(".ccip-test-treasury-006"),
  TEST_CCD002_TREASURY_007: ADDRESS.concat(".ccip-test-treasury-007"),
  TEST_CCD002_TREASURY_008: ADDRESS.concat(".ccip-test-treasury-008"),
  TEST_CCD002_TREASURY_009: ADDRESS.concat(".ccip-test-treasury-009"),
  TEST_CCD002_TREASURY_010: ADDRESS.concat(".ccip-test-treasury-010"),
  TEST_CCD003_USER_REGISTRY_001: ADDRESS.concat(".ccip-test-user-registry-001"),
  TEST_CCD003_USER_REGISTRY_002: ADDRESS.concat(".ccip-test-user-registry-002"),
  TEST_CCD003_USER_REGISTRY_003: ADDRESS.concat(".ccip-test-user-registry-003"),
  TEST_CCD004_CITY_REGISTRY_001: ADDRESS.concat(".ccip-test-city-registry-001"),
};

export const EXTERNAL = {
  FT_MIA: ADDRESS.concat(".ccext-governance-token-mia"),
  FT_NYC: ADDRESS.concat(".ccext-governance-token-nyc"),
  NFT_MIA: ADDRESS.concat(".ccext-nft-mia"),
  NFT_NYC: ADDRESS.concat(".ccext-nft-nyc"),
};

export const passProposal = (
  chain: Chain,
  accounts: Map<string, Account>,
  proposal: string
): any => {
  const sender = accounts.get("deployer")!;
  const ccd001DirectExecute = new CCD001DirectExecute(chain, sender);
  const approver1 = accounts.get("wallet_1")!;
  const approver2 = accounts.get("wallet_2")!;
  const approver3 = accounts.get("wallet_3")!;
  const { receipts } = chain.mineBlock([
    ccd001DirectExecute.directExecute(approver1, proposal),
    ccd001DirectExecute.directExecute(approver2, proposal),
    ccd001DirectExecute.directExecute(approver3, proposal),
  ]);
  return receipts;
};

export const constructAndPassProposal = (
  chain: Chain,
  accounts: Map<string, Account>,
  proposal: string
): any => {
  const sender = accounts.get("deployer")!;
  const baseDao = new BaseDao(chain, sender);
  const ccd001DirectExecute = new CCD001DirectExecute(chain, sender);
  const approver1 = accounts.get("wallet_1")!;
  const approver2 = accounts.get("wallet_2")!;
  const approver3 = accounts.get("wallet_3")!;
  const { receipts } = chain.mineBlock([
    baseDao.construct(sender, PROPOSALS.CCIP_012),
    ccd001DirectExecute.directExecute(approver1, proposal),
    ccd001DirectExecute.directExecute(approver2, proposal),
    ccd001DirectExecute.directExecute(approver3, proposal),
  ]);
  // console.log(receipts);
  return receipts;
};
