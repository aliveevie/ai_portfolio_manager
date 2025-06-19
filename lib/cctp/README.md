# CCTP (Cross-Chain Transfer Protocol) Implementation

This directory contains a professional implementation of Circle's CCTP for cross-chain USDC transfers between supported testnets.

## Supported Networks

- **Sepolia** (Ethereum testnet)
- **Linea Sepolia** (Linea testnet)  
- **Arbitrum Sepolia** (Arbitrum testnet)
- **Optimism Sepolia** (Optimism testnet)

## Architecture

The implementation follows the official CCTP flow:

1. **Approve**: Approve USDC spending for TokenMessenger contract
2. **DepositForBurn**: Burn USDC on source chain and create message
3. **Attestation**: Poll Circle's attestation service for message signature
4. **ReceiveMessage**: Mint USDC on destination chain using message and attestation

## Files

- `constants.ts` - Contract addresses, domain mappings, and configuration
- `abis.ts` - Contract ABIs for TokenMessenger, MessageTransmitter, and ERC20
- `utils.ts` - Utility functions for address conversion, message handling, etc.
- `attestation.ts` - Attestation service integration with polling

## API Endpoints

The `/api/circle` route provides the following actions:

- `approve` - Approve USDC spending
- `depositForBurn` - Initiate cross-chain burn
- `getAttestation` - Poll for attestation
- `receiveMessage` - Execute mint on destination
- `crossChainTransfer` - Complete end-to-end transfer

## Usage

The cross-chain transfer tool can be used via the AI assistant:

```
Transfer 2 USDC from sepolia to arbitrumSepolia to address 0x...
```

## Security

- All contract addresses are verified for testnets
- Proper input validation and error handling
- Secure attestation polling with timeouts
- Professional error messages and logging

## Integration

This implementation integrates with:
- Wagmi for blockchain interactions
- Viem for contract calls
- Circle's attestation service
- Next.js API routes 