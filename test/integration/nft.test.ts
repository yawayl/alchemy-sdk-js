import {
  Alchemy,
  GetNftSalesResponse,
  GetTransfersForOwnerTransferType,
  NftCollection,
  NftContract,
  NftFilters,
  NftOrdering,
  NftSaleMarketplace,
  NftTokenType,
  OpenSeaSafelistRequestStatus,
  SortingOrder,
  fromHex
} from '../../src';
import { loadAlchemyEnv } from '../test-util';

jest.setTimeout(50000);

// These integration tests check for valid response types and protect against
// regressions in the backend.
// TODO(V3): now that types match, add automated tests to check every single field
// to make sure the schema matches
describe('E2E integration tests', () => {
  let alchemy: Alchemy;
  const ownerEns = 'vitalik.eth';
  const ownerAddress = '0x65d25E3F2696B73b850daA07Dd1E267dCfa67F2D';
  const contractAddress = '0x01234567bac6ff94d7e4f0ee23119cf848f93245';
  const collectionSlug = 'boredapeyachtclub';

  beforeAll(async () => {
    await loadAlchemyEnv();
    alchemy = await new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY
    });

    // Skip all timeouts for testing.
    jest.setTimeout(50000);
  });

  function verifyNftContractMetadata(metadata: NftContract): void {
    expect(typeof metadata.totalSupply).toEqual('string');
    expect(typeof metadata.symbol).toEqual('string');
    expect(metadata.tokenType).toEqual(NftTokenType.ERC721);
    expect(typeof metadata.name).toEqual('string');
    expect(metadata.openSeaMetadata).toBeDefined();
    expect(metadata.openSeaMetadata!.safelistRequestStatus).toBeDefined();
    expect(
      Object.values(OpenSeaSafelistRequestStatus).includes(
        metadata.openSeaMetadata?.safelistRequestStatus!
      )
    ).toEqual(true);
    expect(typeof metadata.contractDeployer).toEqual('string');
    expect(typeof metadata.deployedBlockNumber).toEqual('number');
  }

  function verifyNftCollectionMetadata(metadata: NftCollection): void {
    expect(typeof metadata.name).toEqual('string');
    expect(typeof metadata.slug).toEqual('string');
    expect(metadata.floorPrice).toBeDefined();
    expect(typeof metadata.description).toEqual('string');
    expect(typeof metadata.externalUrl).toEqual('string');
    expect(typeof metadata.twitterUsername).toEqual('string');
    expect(typeof metadata.discordUrl).toEqual('string');
  }

  function verifyNftSalesData(response: GetNftSalesResponse): void {
    expect(response.nftSales.length).toBeGreaterThan(0);
    expect(response.nftSales[0].bundleIndex).toBeDefined();
    expect(typeof response.nftSales[0].bundleIndex).toEqual('number');
    expect(response.nftSales[0].buyerAddress).toBeDefined();
    expect(typeof response.nftSales[0].buyerAddress).toEqual('string');
    expect(response.nftSales[0].contractAddress).toBeDefined();
    expect(typeof response.nftSales[0].contractAddress).toEqual('string');
    expect(response.nftSales[0].logIndex).toBeDefined();
    expect(typeof response.nftSales[0].logIndex).toEqual('number');
    expect(response.nftSales[0].marketplace).toBeDefined();
    expect(typeof response.nftSales[0].logIndex).toEqual('number');
    expect(response.nftSales[0].quantity).toBeDefined();
    expect(typeof response.nftSales[0].quantity).toEqual('string');
    expect(response.nftSales[0].sellerAddress).toBeDefined();
    expect(typeof response.nftSales[0].sellerAddress).toEqual('string');
    expect(response.nftSales[0].taker).toBeDefined();
    expect(typeof response.nftSales[0].taker).toEqual('string');
    expect(response.nftSales[0].tokenId).toBeDefined();
    expect(typeof response.nftSales[0].tokenId).toEqual('string');
    expect(response.nftSales[0].transactionHash).toBeDefined();
    expect(typeof response.nftSales[0].transactionHash).toEqual('string');
  }

  it('getNftMetadata()', async () => {
    const contractAddress = '0x0510745d2ca36729bed35c818527c4485912d99e';
    const tokenId = 403;
    const response = await alchemy.nft.getNftMetadata(
      contractAddress,
      tokenId,
      {
        tokenType: NftTokenType.UNKNOWN
      }
    );
    expect(response.image).toBeDefined();
    verifyNftContractMetadata(response.contract);
  });

  it('getNftMetadataBatch()', async () => {
    const response = await alchemy.nft.getNftMetadataBatch([
      {
        contractAddress,
        tokenId: '0x8b57f0',
        tokenType: NftTokenType.ERC721
      },
      { contractAddress, tokenId: 13596716 }
    ]);
    expect(response.nfts.length).toEqual(2);
    expect(response.nfts[0].tokenId).toEqual(fromHex('0x8b57f0').toString());
    expect(response.nfts[1].tokenId).toEqual('13596716');
  });

  it('getContractMetadata()', async () => {
    const response = await alchemy.nft.getContractMetadata(contractAddress);
    verifyNftContractMetadata(response);
  });

  it('getCollectionMetadata()', async () => {
    const response = await alchemy.nft.getCollectionMetadata(collectionSlug);
    verifyNftCollectionMetadata(response);
  });

  it('getOwnersForNft()', async () => {
    const tokenId =
      '0x00000000000000000000000000000000000000000000000000000000008b57f0';
    const response = await alchemy.nft.getOwnersForNft(
      contractAddress,
      tokenId
    );
    expect(response.owners.length).toBeGreaterThan(0);
  });

  it('getOwnersForNft() with pageSize on erc1155 contract 0x84162fE2E695Fedbf4D3bcA1c3458FB616E44735', async () => {
    const tokenId = '0';
    const response = await alchemy.nft.getOwnersForNft(
      '0x84162fE2E695Fedbf4D3bcA1c3458FB616E44735',
      tokenId,
      { pageSize: 51 }
    );
    expect(response.owners.length).toEqual(51);
  });

  it('getOwnersForNft() with pageKey on erc1155 contract 0x84162fE2E695Fedbf4D3bcA1c3458FB616E44735', async () => {
    const tokenId = '0';
    const firstPageResponse = await alchemy.nft.getOwnersForNft(
      '0x84162fE2E695Fedbf4D3bcA1c3458FB616E44735',
      tokenId,
      { pageSize: 1 }
    );
    const pageKey = firstPageResponse.pageKey;
    expect(pageKey).toBeDefined();

    const nextPageResponse = await alchemy.nft.getOwnersForNft(
      contractAddress,
      tokenId,
      { pageSize: 1, pageKey }
    );
    expect(nextPageResponse.owners.length).toEqual(1);
    // cursory check that the pages contain different data
    expect(
      firstPageResponse.owners[0] === nextPageResponse.owners[0]
    ).toBeFalsy();
  });

  it('getNftsForOwner() with pageSize', async () => {
    const response = await alchemy.nft.getNftsForOwner('vitalik.eth', {
      pageSize: 51
    });
    expect(
      response.ownedNfts.filter(
        nft => nft.contract.openSeaMetadata !== undefined
      ).length
    ).toBeGreaterThan(0);
    expect(response.ownedNfts.length).toEqual(51);
    expect(response.validAt).toBeDefined();
  });

  it('getOwnersForNft() from NFT', async () => {
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress, {
      excludeFilters: [NftFilters.SPAM],
      omitMetadata: true
    });
    expect(nfts.ownedNfts.length).toBeGreaterThan(0);

    const nfts2 = await alchemy.nft.getNftsForOwner(ownerAddress, {
      excludeFilters: [NftFilters.AIRDROPS],
      omitMetadata: true
    });

    expect(nfts.ownedNfts.length).not.toEqual(nfts2.totalCount);
    const response = await alchemy.nft.getOwnersForNft(
      nfts.ownedNfts[0].contractAddress,
      nfts.ownedNfts[0].tokenId
    );
    expect(response.owners.length).toBeGreaterThan(0);
  });

  it('getNftsForOwner() spam check', async () => {
    const withSpam = await alchemy.nft.getNftsForOwner('vitalik.eth');
    const noSpam = await alchemy.nft.getNftsForOwner('vitalik.eth', {
      excludeFilters: [NftFilters.SPAM]
    });
    expect(withSpam.totalCount).not.toEqual(noSpam.totalCount);
  });

  it('getNftsForOwner() spam info check', async () => {
    const response = await alchemy.nft.getNftsForOwner('vitalik.eth');
    const spamNfts = response.ownedNfts.filter(
      nft => nft.contract.isSpam !== undefined
    );
    expect(spamNfts[0].contract.isSpam).toEqual(true);
    expect(spamNfts[0].contract.spamClassifications.length).toBeGreaterThan(0);
  });

  it('getNftsForOwner() contract metadata check', async () => {
    const nfts = await alchemy.nft.getNftsForOwner('vitalik.eth');
    expect(
      nfts.ownedNfts.filter(
        nft =>
          nft.contract.symbol !== undefined &&
          nft.contract.totalSupply !== undefined
      ).length
    ).toBeGreaterThan(0);
  });

  it('getNftsForOwner() mint metadata check', async () => {
    const nfts = await alchemy.nft.getNftsForOwner('vitalik.eth', {
      excludeFilters: [NftFilters.SPAM]
    });
    expect(
      nfts.ownedNfts.filter(
        nft =>
          nft.mint?.mintAddress !== undefined &&
          nft.mint.timestamp !== undefined
      ).length
    ).toBeGreaterThan(0);
  });

  it('getNftForOwners() ordered', async () => {
    const response = await alchemy.nft.getNftsForOwner(
      '0x994b342dd87fc825f66e51ffa3ef71ad818b6893',
      {
        orderBy: NftOrdering.TRANSFERTIME
      }
    );
    expect(response.ownedNfts.at(0)?.acquiredAt).toBeDefined();
    expect(response.ownedNfts.at(0)?.acquiredAt?.blockNumber).toBeGreaterThan(
      0
    );
    expect(response.ownedNfts.at(0)?.acquiredAt?.blockTimestamp).toBeTruthy();
    expect(response.validAt).toBeDefined();
  });

  it('getOwnersForContract()', async () => {
    const response = await alchemy.nft.getOwnersForContract(contractAddress);
    expect(response.owners.length).toBeGreaterThan(0);
  });

  it('getOwnersForContract() with includeCount', async () => {
    const response = await alchemy.nft.getOwnersForContract(contractAddress, {
      includeCount: true
    });
    expect(response.totalCount).not.toBeUndefined();
  });

  it('getOwnersForContract()', async () => {
    const address = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';
    const response = await alchemy.nft.getOwnersForContract(address, {
      withTokenBalances: true
    });

    expect(response.owners.length).toBeGreaterThan(0);
    expect(response.owners[0].tokenBalances.length).toBeGreaterThan(0);
    expect(typeof response.owners[0].tokenBalances[0].balance).toEqual(
      'string'
    );
  });

  it('getContractsForOwner()', async () => {
    const response = await alchemy.nft.getContractsForOwner(ownerAddress);

    expect(response.contracts.length).toBeGreaterThan(0);
    verifyNftContractMetadata(response.contracts[0]);
  });

  it('getContractsForOwner() with pageKey and pageSize', async () => {
    const firstPage = await alchemy.nft.getContractsForOwner(ownerEns, {
      pageSize: 4
    });

    expect(firstPage.pageKey).toBeDefined();
    expect(typeof firstPage.pageKey).toEqual('string');
    expect(firstPage.contracts.length).toEqual(4);

    const response = await alchemy.nft.getContractsForOwner(ownerEns, {
      pageKey: firstPage?.pageKey
    });

    expect(response.contracts[0]).not.toEqual(firstPage.contracts[0]);
  });

  it.each(Object.values(NftFilters))(
    `getContractsForOwner() with includeFilters=[%s]`,
    async includeFilter => {
      const expectedIsSpam = includeFilter === NftFilters.SPAM;

      const response = await alchemy.nft.getContractsForOwner(ownerAddress, {
        includeFilters: [includeFilter]
      });

      response.contracts.forEach(nftSale => {
        expect(nftSale.isSpam).toBe(expectedIsSpam);
      });
    }
  );

  it(`getContractsForOwner() with excludeFilter=[${NftFilters.SPAM}]`, async () => {
    const response = await alchemy.nft.getContractsForOwner(ownerAddress, {
      excludeFilters: [NftFilters.SPAM]
    });

    response.contracts.forEach(nftSale => {
      expect(nftSale.isSpam).toBe(false);
    });
  });

  it('getNftsForContract() with pageKey', async () => {
    const nftsForNftContract = await alchemy.nft.getNftsForContract(
      contractAddress
    );

    expect(nftsForNftContract).not.toBeUndefined();
    const nextPage = await alchemy.nft.getNftsForContract(contractAddress, {
      pageKey: nftsForNftContract.pageKey
    });
    expect(nftsForNftContract.nfts[0]).not.toEqual(nextPage.nfts[0]);
  });

  it('getNftsForContract() with limit', async () => {
    const nftsForNftContract = await alchemy.nft.getNftsForContract(
      contractAddress,
      { pageSize: 10 }
    );
    expect(nftsForNftContract.nfts.length).toEqual(10);
  });

  it('getNftsForContract() contract metadata check', async () => {
    const response = await alchemy.nft.getNftsForContract(
      '0x246e29ef6987637e48e7509f91521ce64eb8c831',
      { omitMetadata: false }
    );
    expect(
      response.nfts.filter(
        nft =>
          nft.contract.symbol !== undefined &&
          nft.contract.totalSupply !== undefined
      ).length
    ).toBeGreaterThan(0);
  });

  it('getContractMetadataBatch()', async () => {
    const contractAddresses = [
      '0xe785E82358879F061BC3dcAC6f0444462D4b5330',
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
    ];
    const response = await alchemy.nft.getContractMetadataBatch(
      contractAddresses
    );
    expect(response.contracts.length).toEqual(2);
    expect(contractAddresses.includes(response.contracts[0].address)).toEqual(
      true
    );
    expect(contractAddresses.includes(response.contracts[1].address)).toEqual(
      true
    );
  });

  it('getNftsForOwnerIterator()', async () => {
    jest.setTimeout(15000);
    let allNfts = [];
    let totalCount = 0;
    for await (const nft of alchemy.nft.getNftsForOwnerIterator(ownerAddress)) {
      if (totalCount === 10) {
        break;
      }
      allNfts.push(nft);
      totalCount += 1;
    }
    expect(allNfts.length).toEqual(totalCount);
    allNfts = [];
    totalCount = 0;

    for await (const nft of alchemy.nft.getNftsForOwnerIterator(ownerAddress, {
      omitMetadata: false
    })) {
      if (totalCount === 10) {
        break;
      }
      allNfts.push(nft);
      totalCount += 1;
    }
    expect(allNfts.length).toEqual(totalCount);
  });

  it('getNftsForContractIterator()', async () => {
    jest.setTimeout(15000);
    const allNfts = [];
    let totalCount = 0;
    for await (const nft of alchemy.nft.getNftsForContractIterator(
      contractAddress,
      {
        omitMetadata: false
      }
    )) {
      if (totalCount === 150) {
        break;
      }
      allNfts.push(nft);
      totalCount += 1;
    }
    expect(allNfts.length).toEqual(totalCount);
  });

  it('getMintedNfts()', async () => {
    // Handles paging
    const response = await alchemy.nft.getMintedNfts('vitalik.eth');
    expect(response.pageKey).toBeDefined();
    expect(response.nfts.length).toBeGreaterThan(0);
    const responseWithPageKey = await alchemy.nft.getMintedNfts('vitalik.eth', {
      pageKey: response.pageKey
    });
    expect(responseWithPageKey.nfts.length).toBeGreaterThan(0);
    expect(response).not.toEqual(responseWithPageKey);

    // Handles ERC1155 NFT mints.
    const response3 = await alchemy.nft.getMintedNfts('vitalik.eth', {
      tokenType: NftTokenType.ERC1155
    });
    const nfts1155 = response3.nfts.filter(
      nft => nft.tokenType === NftTokenType.ERC1155
    );
    expect(nfts1155.length).toEqual(response3.nfts.length);

    // // Handles ERC721 NFT mints.
    const response4 = await alchemy.nft.getMintedNfts('vitalik.eth', {
      tokenType: NftTokenType.ERC721
    });
    const nfts721 = response4.nfts.filter(
      // Some 721 transfers are ingested as NftTokenType.UNKNOWN.
      nft => nft.tokenType !== NftTokenType.ERC1155
    );
    expect(nfts721.length).toEqual(response4.nfts.length);

    // Handles contract address specifying.
    const contractAddresses = [
      '0xa1eB40c284C5B44419425c4202Fa8DabFF31006b',
      '0x8442864d6AB62a9193be2F16580c08E0D7BCda2f'
    ];
    const response5 = await alchemy.nft.getMintedNfts('vitalik.eth', {
      contractAddresses
    });
    const nftsWithAddress = response5.nfts.filter(nft =>
      contractAddresses.includes(nft.contract.address)
    );
    expect(nftsWithAddress.length).toEqual(response5.nfts.length);
  });

  it('getTransfersForOwner()', async () => {
    // Handles paging
    const response = await alchemy.nft.getTransfersForOwner(
      'vitalik.eth',
      GetTransfersForOwnerTransferType.TO
    );
    expect(response.pageKey).toBeDefined();
    expect(response.nfts.length).toBeGreaterThan(0);
    const responseWithPageKey = await alchemy.nft.getTransfersForOwner(
      'vitalik.eth',
      GetTransfersForOwnerTransferType.TO,
      {
        pageKey: response.pageKey
      }
    );
    expect(responseWithPageKey.nfts.length).toBeGreaterThan(0);
    expect(response.nfts[0]).not.toEqual(responseWithPageKey.nfts[0]);

    // Handles ERC1155 NFT transfers.
    const response3 = await alchemy.nft.getTransfersForOwner(
      'vitalik.eth',
      GetTransfersForOwnerTransferType.TO,
      {
        tokenType: NftTokenType.ERC1155
      }
    );
    const nfts1155 = response3.nfts.filter(
      nft => nft.tokenType === NftTokenType.ERC1155
    );
    expect(nfts1155.length).toEqual(response3.nfts.length);

    // Handles ERC721 NFT transfers.
    const response4 = await alchemy.nft.getTransfersForOwner(
      'vitalik.eth',
      GetTransfersForOwnerTransferType.FROM,
      {
        tokenType: NftTokenType.ERC721
      }
    );
    const nfts721 = response4.nfts.filter(
      // Some 721 transfers are ingested as NftTokenType.UNKNOWN.
      nft => nft.tokenType !== NftTokenType.ERC1155
    );
    expect(nfts721.length).toEqual(response4.nfts.length);

    // Handles contract address specifying.
    const contractAddresses = [
      '0xa1eB40c284C5B44419425c4202Fa8DabFF31006b',
      '0x8442864d6AB62a9193be2F16580c08E0D7BCda2f'
    ];
    const response5 = await alchemy.nft.getTransfersForOwner(
      'vitalik.eth',
      GetTransfersForOwnerTransferType.TO,
      {
        contractAddresses
      }
    );
    const nftsWithAddress = response5.nfts.filter(nft =>
      contractAddresses.includes(nft.contract.address)
    );
    expect(nftsWithAddress.length).toEqual(response5.nfts.length);
  });

  it('getTransfersForContract() with multiple transfers for same token', async () => {
    // This is a sanity test since this block range contains two transfers for
    // the same token that will be included in the same NFT metadata batch.
    const CONTRACT = '0x0cdd3cb3bcd969c2b389488b51fb093cc0d703b1';
    const START_BLOCK = 16877400;
    const END_BLOCK = 16877500;

    const transactions = new Set<string>();
    const transfers = await alchemy.nft.getTransfersForContract(CONTRACT, {
      fromBlock: START_BLOCK,
      toBlock: END_BLOCK
    });

    transfers.nfts
      .filter(t => t.tokenId === '238')
      .forEach(t => transactions.add(t.transactionHash));
    console.log(transfers.nfts.length);

    expect(transactions.size).toEqual(2);
  });

  it('getTransfersForContract()', async () => {
    const CRYPTO_PUNKS_CONTRACT = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB';
    // Handles paging
    const response = await alchemy.nft.getTransfersForContract(
      CRYPTO_PUNKS_CONTRACT
    );
    expect(response.pageKey).toBeDefined();
    expect(response.nfts.length).toBeGreaterThan(0);
    const responseWithPageKey = await alchemy.nft.getTransfersForContract(
      CRYPTO_PUNKS_CONTRACT,
      {
        pageKey: response.pageKey
      }
    );
    expect(responseWithPageKey.nfts.length).toBeGreaterThan(0);
    expect(response.nfts[0]).not.toEqual(responseWithPageKey.nfts[0]);

    // Handles block ranges and sort order.
    const response2 = await alchemy.nft.getTransfersForContract(
      CRYPTO_PUNKS_CONTRACT,
      {
        fromBlock: 10000000,
        toBlock: 'latest',
        order: SortingOrder.DESCENDING
      }
    );
    expect(response2.nfts.length).toBeGreaterThan(0);
    expect(fromHex(response2.nfts[0].blockNumber)).toBeGreaterThanOrEqual(
      fromHex(response2.nfts[1].blockNumber)
    );
  });

  it('verifyNftOwnership() boolean', async () => {
    const response = await alchemy.nft.verifyNftOwnership(
      ownerAddress,
      contractAddress
    );
    expect(typeof response).toEqual('boolean');
  });

  it('verifyNftOwnership() map', async () => {
    const response = await alchemy.nft.verifyNftOwnership(ownerAddress, [
      contractAddress
    ]);
    expect(response[contractAddress]).toBeDefined();
    expect(typeof response[contractAddress]).toEqual('boolean');
  });

  it('refreshNftMetadata()', async () => {
    const contractAddress = '0x0510745d2ca36729bed35c818527c4485912d99e';
    const tokenId = '404';
    await alchemy.nft.refreshNftMetadata(contractAddress, tokenId);

    const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    await alchemy.nft.refreshNftMetadata(nft.contract.address, nft.tokenId);
  });

  it('isSpamContract()', async () => {
    const response = await alchemy.nft.isSpamContract(contractAddress);
    expect(typeof response.isSpamContract).toEqual('boolean');
  });

  it('getSpamContracts()', async () => {
    const response = await alchemy.nft.getSpamContracts();
    expect(response.contractAddresses.length).toBeGreaterThan(0);
    expect(typeof response.contractAddresses[0]).toEqual('string');
  });

  it('reportSpam()', async () => {
    const response = await alchemy.nft.reportSpam(contractAddress);
    expect(typeof response).toEqual('undefined');
  });

  it('isAirdropNft()', async () => {
    const response = await alchemy.nft.isAirdropNft(contractAddress, '0');
    expect(typeof response.isAirdrop).toEqual('boolean');
  });

  it('getFloorPrice()', async () => {
    const response = await alchemy.nft.getFloorPrice(contractAddress);
    expect(response.openSea).toBeDefined();
    expect(response.looksRare).toBeDefined();
    expect((response.looksRare as any).error).not.toBeDefined();
  });

  it('getNftSales()', async () => {
    const response = await alchemy.nft.getNftSales();

    expect(response.pageKey).toBeDefined();
    verifyNftSalesData(response);
  });

  it('getNftSales() with token', async () => {
    const response = await alchemy.nft.getNftSales({
      contractAddress: '0xe785E82358879F061BC3dcAC6f0444462D4b5330',
      tokenId: 44
    });

    verifyNftSalesData(response);
    expect(response.nftSales[0].royaltyFee).toBeDefined();
    expect(response.nftSales[0].protocolFee).toBeDefined();
    expect(response.nftSales[0].sellerFee).toBeDefined();
  });

  it('getNftSales() with pageKey', async () => {
    const firstPage = await alchemy.nft.getNftSales();

    expect(firstPage.pageKey).not.toBeUndefined();
    const response = await alchemy.nft.getNftSales({
      pageKey: firstPage?.pageKey
    });

    expect(response.nftSales[0]).not.toEqual(firstPage.nftSales[0]);
  });

  it('getNftSales() with contractAddress', async () => {
    const contractAddress = '0xaF1cfc6b4104c797149fB7A294f7d46F7eC27B80';

    const response = await alchemy.nft.getNftSales({ contractAddress });

    expect(response.nftSales.length).toBeGreaterThan(0);
    expect(response.nftSales[0].contractAddress).toEqual(contractAddress);
  });

  it.each(
    Object.values(NftSaleMarketplace).filter(
      v => v !== NftSaleMarketplace.UNKNOWN
    )
  )(`getNftSales() with marketplace=%s`, async marketplace => {
    const response = await alchemy.nft.getNftSales({
      marketplace,
      limit: 10
    });

    response.nftSales.forEach(nftSale => {
      expect(nftSale.marketplace).toEqual(marketplace);
    });
  });

  it('computeRarity()', async () => {
    const contractAddress = '0x0510745d2ca36729bed35c818527c4485912d99e';
    const tokenId = '403';

    const response = await alchemy.nft.computeRarity(contractAddress, tokenId);

    expect(response).toBeDefined();
    expect(response.rarities.length).toBeGreaterThan(0);
    expect(response.rarities[0].prevalence).toBeDefined();
    expect(response.rarities[0].traitType).toBeDefined();
    expect(response.rarities[0].value).toBeDefined();
  });

  it('searchContractMetadata()', async () => {
    const query = 'meta alchemy';

    const response = await alchemy.nft.searchContractMetadata(query);

    expect(response).toBeDefined();
    expect(response.contracts.length).toBeGreaterThan(0);
    expect(response.contracts[0].address).toBeDefined();
    expect(typeof response.contracts[0].address).toEqual('string');
    expect(response.contracts[0].tokenType).toBeDefined();
  });

  it('summarizeNftAttributes()', async () => {
    const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';

    const response = await alchemy.nft.summarizeNftAttributes(contractAddress);

    expect(response).toBeDefined();
    expect(response.contractAddress).toBeDefined();
    expect(response.contractAddress).toEqual(contractAddress);
    expect(response.totalSupply).toBeDefined();
    expect(typeof response.totalSupply).toEqual('string');
    expect(response.summary).toBeDefined();
  });

  it('refreshNftContract()', async () => {
    const contractAddress = '0x0510745d2ca36729bed35c818527c4485912d99e';
    const result = await alchemy.nft.refreshContract(contractAddress);
    expect(result.contractAddress).toBeDefined();
  });
});
