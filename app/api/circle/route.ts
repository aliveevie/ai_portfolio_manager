import { NextRequest, NextResponse } from 'next/server';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

// CCTP Contract addresses for testnets
const CCTP_CONTRACTS = {
  sepolia: {
    tokenMessenger: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
    messageTransmitter: '0x7865fafc2db2093669d92c0f33aeef291086befd',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
  lineaSepolia: {
    tokenMessenger: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
    messageTransmitter: '0x7865fafc2db2093669d92c0f33aeef291086befd',
    usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  },
  arbitrumSepolia: {
    tokenMessenger: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
    messageTransmitter: '0x7865fafc2db2093669d92c0f33aeef291086befd',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  },
  optimismSepolia: {
    tokenMessenger: '0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5',
    messageTransmitter: '0x7865fafc2db2093669d92c0f33aeef291086befd',
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  },
};

// Chain IDs for CCTP
const CHAIN_IDS = {
  sepolia: 11155111,
  lineaSepolia: 59141,
  arbitrumSepolia: 421614,
  optimismSepolia: 11155420,
};

function getCircleClient() {
  if (!process.env.CIRCLE_WALLET_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
    throw new Error('Circle API key or entity secret not configured');
  }
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_WALLET_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    baseUrl: 'https://api-sandbox.circle.com',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sourceChain, destinationChain, amount, recipientAddress, walletId, messageHash, message, attestation } = body;

    if (!process.env.CIRCLE_WALLET_API_KEY) {
      return NextResponse.json({ error: 'Circle API key not configured' }, { status: 500 });
    }
    if (!process.env.CIRCLE_ENTITY_SECRET) {
      return NextResponse.json({ error: 'Circle entity secret not configured' }, { status: 500 });
    }
    if (!process.env.CIRCLE_WALLET_ID) {
      return NextResponse.json({ error: 'Circle wallet ID not configured' }, { status: 500 });
    }

    const walletIdToUse = walletId || process.env.CIRCLE_WALLET_ID;
    const client = getCircleClient();

    switch (action) {
      case 'approve':
        return await handleApprove(client, sourceChain, amount, walletIdToUse);
      case 'burn':
        return await handleBurn(client, sourceChain, destinationChain, amount, recipientAddress, walletIdToUse);
      case 'getAttestation':
        return await handleGetAttestation(messageHash);
      case 'mint':
        return await handleMint(client, destinationChain, message, attestation, walletIdToUse);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Circle API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleApprove(client: any, sourceChain: string, amount: string, walletId: string) {
  try {
    const contracts = CCTP_CONTRACTS[sourceChain as keyof typeof CCTP_CONTRACTS];
    if (!contracts) {
      return NextResponse.json({ error: 'Unsupported source chain' }, { status: 400 });
    }
    const approveRequest = {
      idempotencyKey: generateIdempotencyKey(),
      abiFunctionSignature: 'approve(address,uint256)',
      abiParameters: [
        { name: 'spender', type: 'address', value: contracts.tokenMessenger },
        { name: 'amount', type: 'uint256', value: amount }
      ],
      contractAddress: contracts.usdc,
      walletId: walletId,
      feeLevel: 'HIGH' as const,
    };
    const result = await client.createContractExecution(approveRequest);
    return NextResponse.json({
      success: true,
      transactionId: result.data.data?.transactionId,
      message: 'USDC approval initiated'
    });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Failed to approve USDC' }, { status: 500 });
  }
}

async function handleBurn(client: any, sourceChain: string, destinationChain: string, amount: string, recipientAddress: string, walletId: string) {
  try {
    const sourceContracts = CCTP_CONTRACTS[sourceChain as keyof typeof CCTP_CONTRACTS];
    const destinationChainId = CHAIN_IDS[destinationChain as keyof typeof CHAIN_IDS];
    if (!sourceContracts || !destinationChainId) {
      return NextResponse.json({ error: 'Unsupported chain configuration' }, { status: 400 });
    }
    const burnRequest = {
      idempotencyKey: generateIdempotencyKey(),
      abiFunctionSignature: 'depositForBurn(uint256,uint32,bytes32,address)',
      abiParameters: [
        { name: 'amount', type: 'uint256', value: amount },
        { name: 'destinationDomain', type: 'uint32', value: destinationChainId.toString() },
        { name: 'mintRecipient', type: 'bytes32', value: recipientAddress },
        { name: 'burnToken', type: 'address', value: sourceContracts.usdc }
      ],
      contractAddress: sourceContracts.tokenMessenger,
      walletId: walletId,
      feeLevel: 'HIGH' as const,
    };
    const result = await client.createContractExecution(burnRequest);
    return NextResponse.json({
      success: true,
      transactionId: result.data.data?.transactionId,
      message: 'USDC burn initiated',
      messageHash: result.data.data?.transactionId // This would need to be extracted from the transaction logs
    });
  } catch (error) {
    console.error('Burn error:', error);
    return NextResponse.json({ error: 'Failed to burn USDC' }, { status: 500 });
  }
}

async function handleGetAttestation(messageHash: string) {
  try {
    // In a real implementation, you would poll Circle's attestation service
    // For now, we'll simulate the attestation process
    const attestationResponse = {
      attestation: `simulated_attestation_${messageHash}`,
      messageBytes: `simulated_message_bytes_${messageHash}`
    };
    return NextResponse.json({
      success: true,
      attestation: attestationResponse.attestation,
      messageBytes: attestationResponse.messageBytes
    });
  } catch (error) {
    console.error('Attestation error:', error);
    return NextResponse.json({ error: 'Failed to get attestation' }, { status: 500 });
  }
}

async function handleMint(client: any, destinationChain: string, message: string, attestation: string, walletId: string) {
  try {
    const destinationContracts = CCTP_CONTRACTS[destinationChain as keyof typeof CCTP_CONTRACTS];
    if (!destinationContracts) {
      return NextResponse.json({ error: 'Unsupported destination chain' }, { status: 400 });
    }
    const mintRequest = {
      idempotencyKey: generateIdempotencyKey(),
      abiFunctionSignature: 'receiveMessage(bytes,bytes)',
      abiParameters: [
        { name: 'message', type: 'bytes', value: message },
        { name: 'attestation', type: 'bytes', value: attestation }
      ],
      contractAddress: destinationContracts.messageTransmitter,
      walletId: walletId,
      feeLevel: 'HIGH' as const,
    };
    const result = await client.createContractExecution(mintRequest);
    return NextResponse.json({
      success: true,
      transactionId: result.data.data?.transactionId,
      message: 'USDC mint initiated'
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json({ error: 'Failed to mint USDC' }, { status: 500 });
  }
}

function generateIdempotencyKey(): string {
  return `cctp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 