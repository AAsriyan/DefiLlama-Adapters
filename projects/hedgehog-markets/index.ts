const ADDRESSES = require('./helper/coreAssets.json')
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");
const NATIVE_MINT = ADDRESSES.solana.SOL;
const QUOTE_TOKEN = ADDRESSES.solana.USDC;

async function tvl() {
  const provider = getProvider();
  const classicBalances = await fetchClassicMarketsBalances(provider);
  //const par2Balances = await fetchPar2MarketsBalances(provider);

}

async function fetchClassicMarketsBalances(provider) {
  const HH_AMM_PROGRAM = new PublicKey(
    'Hr4whNgXr3yZsJvx3TVSwfsFgXuSEPB1xKmvgrtLhsrM',
  );
  const HH_OUTCOME_TOKENS_PROGRAM = new PublicKey(
    'D8vMVKonxkbBtAXAxBwPPWyTfon8337ARJmHvwtsF98G',
  );

  const HhAmmIDL = await Program.fetchIdl(HH_AMM_PROGRAM, provider);
  const HhOutcomeTokensIDL = await Program.fetchIdl(
    HH_OUTCOME_TOKENS_PROGRAM,
    provider,
  );

  if (!HhAmmIDL || !HhOutcomeTokensIDL) return;

  const ammProgram = new Program(HhAmmIDL, HH_AMM_PROGRAM, provider);
  const outcomeProgram = new Program(
    HhOutcomeTokensIDL,
    HH_OUTCOME_TOKENS_PROGRAM,
    provider,
  );

  const swaps = await ammProgram.account.swap.all();
  const marketKeys = swaps
    .map((swap) => swap.account.market)
    .filter((key) => key !== undefined);
  const markets = await outcomeProgram.account.market.fetchMultiple(
    marketKeys
  );

  const filteredMarkets = markets.filter((market) => market);

  let allClassicMarketBalances = 0;
  for (const market of filteredMarkets) {
    if (!market) continue;

    // Market collateral balances are numbers in USDC
    const marketBalance = await connection.getTokenAccountBalance(
      market.marketCollateral,
    );
    if (marketBalance) {
      console.log(marketBalance.value.uiAmount);
      allClassicMarketBalances += marketBalance.value.uiAmount;
    }
  }
  return allClassicMarketBalances;
}

async function fetchPar2MarketsBalances(provider) {
    // Step 1: Fetch all par2 markets deserialized
    // To deserialize - look at utils/solana/layout.js to add our programs decoder
    const par2Markets = await provider.connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID
    );
    // Step 2: Loop over markets and calculate volume from market deposits/amounts
}

module.exports = {
  solana: {
    tvl: sumTokens2({ tokens: [ADDRESSES.solana.USDC]})
  },
  methodology: `TODO: Add methodology description`
}