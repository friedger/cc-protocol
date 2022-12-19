/**
 * Test class is structured;
 * 0. AUTHORIZATION CHECKS
 * 1. mine
 * 2. claim-mining-reward
 * 3. reward-delay
 */
import { types, Account, Clarinet, Chain, assertEquals } from "../../../utils/deps.ts";
import { constructAndPassProposal, passProposal, PROPOSALS, EXTENSIONS } from "../../../utils/common.ts";
import { CCD006CityMining } from "../../../models/extensions/ccd006-city-mining.model.ts";
import { CCD005CityData } from "../../../models/extensions/ccd005-city-data.model.ts";
import { CCEXTGovernanceToken } from "../../../models/external/test-ccext-governance-token.model.ts";

// =============================
// INTERNAL DATA / FUNCTIONS
// =============================
const rewardDelay = 100;
const miaCityId = 1;
const miaCityName = "mia";
const miaTreasuryName = "ccd002-treasury-mia-mining";

Clarinet.test({
  name: "ccd006-city-mining: is-block-winner() correctly identifies winning miner who has not claimed",
  fn(chain: Chain, accounts: Map<string, Account>) {
    // arrange
    const sender = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;
    const ccd005CityData = new CCD005CityData(chain, sender, "ccd005-city-data");
    const ccd006CityMining = new CCD006CityMining(chain, sender, "ccd006-city-mining");
    const gt = new CCEXTGovernanceToken(chain, sender, "test-ccext-governance-token-mia");
    const totalAmount = 10;
    const totalBlocks = 1;
    const entries: number[] = [10];
    gt.getBalance(user1.address).result.expectOk().expectUint(0);
    gt.getBalance(EXTENSIONS.CCD002_TREASURY_MIA_MINING).result.expectOk().expectUint(0);

    // act
    constructAndPassProposal(chain, accounts, PROPOSALS.TEST_CCD004_CITY_REGISTRY_001);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_001);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_002);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_009);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_010);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_018);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD006_CITY_MINING_002);
    ccd005CityData.getCityTreasuryNonce(miaCityId).result.expectUint(1);

    const miningBlock = chain.mineBlock([ccd006CityMining.mine(user1, miaCityName, entries)]);
    const claimHeight = miningBlock.height - 1;
    const lastBlock = claimHeight + totalBlocks - 1;
    chain.mineEmptyBlock(rewardDelay + 1);

    // assert
    miningBlock.receipts[0].result.expectOk().expectBool(true);


    // Check stx transfer events
    miningBlock.receipts[0].events.expectSTXTransferEvent(10, user1.address, `${sender.address}.${miaTreasuryName}`);

    // Check mining events
    const expectedPrintMsg = `{action: "mining", cityId: u1, cityName: "mia", cityTreasury: ${sender.address}.${miaTreasuryName}, firstBlock: ${types.uint(claimHeight)}, lastBlock: ${types.uint(lastBlock)}, totalAmount: ${types.uint(totalAmount)}, totalBlocks: ${types.uint(totalBlocks)}, userId: ${types.uint(1)}}`;
    miningBlock.receipts[0].events.expectPrintEvent(`${sender.address}.ccd006-city-mining`, expectedPrintMsg);

    gt.getBalance(user1.address).result.expectOk().expectUint(0);
    gt.getBalance(EXTENSIONS.CCD002_TREASURY_MIA_MINING).result.expectOk().expectUint(0);
    const expected = {
      claimed: types.bool(false),
      winner: types.bool(true),
    };
    assertEquals(ccd006CityMining.isBlockWinner(miaCityId, user1.address, claimHeight).result.expectSome().expectTuple(), expected);
    // TODO MJC: is-block-winner calculates the winning status of given user.
    // get-block-winner reads it from the map which is written by claim-mining-reward.
    // so user1 is not returned by the following even though previous lines indicate they won.
    ccd006CityMining.getBlockWinner(miaCityId, claimHeight).result.expectSome().expectUint(1);
  },
});









Clarinet.test({
  name: "ccd006-city-mining: claim-mining-reward() user makes successful claim",
  fn(chain: Chain, accounts: Map<string, Account>) {
    // arrange
    const sender = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;
    const ccd005CityData = new CCD005CityData(chain, sender, "ccd005-city-data");
    const ccd006CityMining = new CCD006CityMining(chain, sender, "ccd006-city-mining");
    const gt = new CCEXTGovernanceToken(chain, sender, "test-ccext-governance-token-mia");
    const totalAmount = 10;
    const totalBlocks = 1;
    const entries: number[] = [10];
    gt.getBalance(user1.address).result.expectOk().expectUint(0);
    gt.getBalance(EXTENSIONS.CCD002_TREASURY_MIA_MINING).result.expectOk().expectUint(0);

    // act
    constructAndPassProposal(chain, accounts, PROPOSALS.TEST_CCD004_CITY_REGISTRY_001);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_001);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_002);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_009);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_010);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD005_CITY_DATA_018);
    passProposal(chain, accounts, PROPOSALS.TEST_CCD006_CITY_MINING_002);
    ccd005CityData.getCityTreasuryNonce(miaCityId).result.expectUint(1);

    const miningBlock = chain.mineBlock([ccd006CityMining.mine(user1, miaCityName, entries), ccd006CityMining.mine(user2, miaCityName, entries)]);
    const claimHeight = miningBlock.height - 1;
    const lastBlock = claimHeight + totalBlocks - 1;
    chain.mineEmptyBlock(rewardDelay + 1);

    const miningClaimBlock = chain.mineBlock([ccd006CityMining.claimMiningReward(user1, miaCityName, claimHeight), ccd006CityMining.claimMiningReward(user2, miaCityName, claimHeight)]);

    // assert
    ccd005CityData.getCityCoinbaseAmounts(miaCityId).result.expectSome().expectTuple();
    ccd005CityData.getCityCoinbaseThresholds(miaCityId).result.expectSome().expectTuple();

    miningBlock.receipts[0].result.expectOk().expectBool(true);
    miningBlock.receipts[1].result.expectOk().expectBool(true);

    /**
     * TODO MJC: Note that the previous test does not set coinbase amounts
     * this one sets the amounts and thresholds via CITY_DATA 009 and 010
     */
    if (miningClaimBlock.receipts[0].result === "(err u6010)") {
      console.log("USER 2 WINS");
      miningClaimBlock.receipts[0].result.expectErr().expectUint(CCD006CityMining.ErrCode.ERR_ALREADY_CLAIMED);
      miningClaimBlock.receipts[1].result.expectOk().expectBool(true);
    } else {
      console.log("USER 1 WINS");
      miningClaimBlock.receipts[0].result.expectOk().expectBool(true);
      miningClaimBlock.receipts[1].result.expectErr().expectUint(CCD006CityMining.ErrCode.ERR_ALREADY_CLAIMED);
    }

    gt.getBalance(user1.address).result.expectOk().expectUint(1000000);
    gt.getBalance(EXTENSIONS.CCD002_TREASURY_MIA_MINING).result.expectOk().expectUint(0);

    // Check stx transfer events
    miningBlock.receipts[0].events.expectSTXTransferEvent(10, user1.address, `${sender.address}.${miaTreasuryName}`);
    miningBlock.receipts[1].events.expectSTXTransferEvent(10, user2.address, `${sender.address}.${miaTreasuryName}`);

    // Check mining events
    let expectedPrintMsg = `{action: "mining", cityId: u1, cityName: "mia", cityTreasury: ${sender.address}.${miaTreasuryName}, firstBlock: ${types.uint(claimHeight)}, lastBlock: ${types.uint(lastBlock)}, totalAmount: ${types.uint(totalAmount)}, totalBlocks: ${types.uint(totalBlocks)}, userId: ${types.uint(1)}}`;
    miningBlock.receipts[0].events.expectPrintEvent(`${sender.address}.ccd006-city-mining`, expectedPrintMsg);
    expectedPrintMsg = `{action: "mining", cityId: u1, cityName: "mia", cityTreasury: ${sender.address}.${miaTreasuryName}, firstBlock: ${types.uint(claimHeight)}, lastBlock: ${types.uint(lastBlock)}, totalAmount: ${types.uint(totalAmount)}, totalBlocks: ${types.uint(totalBlocks)}, userId: ${types.uint(2)}}`;
    miningBlock.receipts[1].events.expectPrintEvent(`${sender.address}.ccd006-city-mining`, expectedPrintMsg);

    // Check print event: mining-claim
    console.log(miningClaimBlock.receipts[0].events[1].contract_event.value);
    expectedPrintMsg = `{action: "mining-claim", cityId: u1, cityName: "mia", claimHeight: ${types.uint(10)}, userId: ${types.uint(1)}}`;
    miningClaimBlock.receipts[0].events.expectPrintEvent(`${sender.address}.ccd006-city-mining`, expectedPrintMsg);

    ccd006CityMining.getRewardDelay().result.expectUint(rewardDelay);
    ccd006CityMining.getBlockWinner(miaCityId, claimHeight).result.expectSome().expectUint(1);
  },
});
