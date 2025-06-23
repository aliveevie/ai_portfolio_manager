import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, encodeFunctionData, pad, toHex } from "viem";
import { lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";

// CCTP Contract addresses for each network
const CCTP_CONTRACTS = {
  [sepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  [lineaSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  },
  [arbitrumSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0xacf1ceef35caac005e15888ddb8a3515c41b4872",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
  [optimismSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  },
};

// Circle-defined domain IDs for CCTP
const CCTP_DOMAINS = {
  [sepolia.id]: 0,        // Ethereum Sepolia
  [lineaSepolia.id]: 1,   // Linea Sepolia  
  [arbitrumSepolia.id]: 3, // Arbitrum Sepolia
  [optimismSepolia.id]: 2, // Optimism Sepolia
};

// Create public clients for each network
const clients = {
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: http() }),
  [lineaSepolia.id]: createPublicClient({ chain: lineaSepolia, transport: http() }),
  [arbitrumSepolia.id]: createPublicClient({ chain: arbitrumSepolia, transport: http() }),
  [optimismSepolia.id]: createPublicClient({ chain: optimismSepolia, transport: http() }),
};

// ERC20 ABI for approve and allowance functions
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Token Messenger ABI
const TOKEN_MESSENGER_ABI = [{"inputs":[{"internalType":"address","name":"_messageTransmitter","type":"address"},{"internalType":"uint32","name":"_messageBodyVersion","type":"uint32"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint64","name":"nonce","type":"uint64"},{"indexed":true,"internalType":"address","name":"burnToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"depositor","type":"address"},{"indexed":false,"internalType":"bytes32","name":"mintRecipient","type":"bytes32"},{"indexed":false,"internalType":"uint32","name":"destinationDomain","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"destinationTokenMessenger","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"destinationCaller","type":"bytes32"}],"name":"DepositForBurn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"localMinter","type":"address"}],"name":"LocalMinterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"localMinter","type":"address"}],"name":"LocalMinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"mintRecipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"mintToken","type":"address"}],"name":"MintAndWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"domain","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"tokenMessenger","type":"bytes32"}],"name":"RemoteTokenMessengerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"domain","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"tokenMessenger","type":"bytes32"}],"name":"RemoteTokenMessengerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newLocalMinter","type":"address"}],"name":"addLocalMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"domain","type":"uint32"},{"internalType":"bytes32","name":"tokenMessenger","type":"bytes32"}],"name":"addRemoteTokenMessenger","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"burnLimitsPerMessage","outputs":[{"internalType":"mapping(address => uint256)","name":"","type":"mapping"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint32","name":"destinationDomain","type":"uint32"},{"internalType":"bytes32","name":"mintRecipient","type":"bytes32"},{"internalType":"address","name":"burnToken","type":"address"}],"name":"depositForBurn","outputs":[{"internalType":"uint64","name":"_nonce","type":"uint64"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"localMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"localMessageTransmitter","outputs":[{"internalType":"contract IMessageTransmitter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"messageBodyVersion","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"removeLocalMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"domain","type":"uint32"}],"name":"removeRemoteTokenMessenger","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"burnToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"setBurnLimitPerMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"setRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}] as const;

// Message Transmitter ABI
const MESSAGE_TRANSMITTER_ABI = [{"inputs":[{"internalType":"uint32","name":"_localDomain","type":"uint32"},{"internalType":"address","name":"_attester","type":"address"},{"internalType":"uint32","name":"_maxMessageBodySize","type":"uint32"},{"internalType":"uint32","name":"_version","type":"uint32"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterDisabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousAttesterManager","type":"address"},{"indexed":true,"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"AttesterManagerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"MaxMessageBodySizeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint32","name":"sourceDomain","type":"uint32"},{"indexed":true,"internalType":"uint64","name":"nonce","type":"uint64"},{"indexed":false,"internalType":"bytes32","name":"sender","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"messageBody","type":"bytes"}],"name":"MessageReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"message","type":"bytes"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldSignatureThreshold","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"SignatureThresholdUpdated","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"attesterManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"disableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"enableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"}],"name":"getEnabledAttester","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEnabledAttesters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLocalDomain","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxMessageBodySize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"nextAvailableNonce","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_message","type":"bytes"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"receiveMessage","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"setAttesterManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"setMaxMessageBodySize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pauser","type":"address"}],"name":"setPauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"setRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"setSignatureThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"signatureThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"}] as const;

// Attestation service URL
const IRIS_ATTESTATION_API_URL = "https://iris-api-sandbox.circle.com";

export async function POST(request: NextRequest) {
  try {
    console.log('CCTP API route called');
    const body = await request.json();
    const { 
      action, 
      sourceChain, 
      destinationChain, 
      amount, 
      recipientAddress, 
      walletAddress,
      messageHash,
      messageBytes,
      attestation 
    } = body;

    console.log('Request body:', { action, sourceChain, destinationChain, amount, recipientAddress, walletAddress });

    switch (action) {
      case 'approve':
        return await handleApprove(sourceChain, amount, walletAddress);
      case 'depositForBurn':
        return await handleDepositForBurn(sourceChain, destinationChain, amount, recipientAddress, walletAddress);
      case 'getAttestation':
        return await handleGetAttestation(messageHash);
      case 'receiveMessage':
        return await handleReceiveMessage(destinationChain, messageBytes, attestation, walletAddress);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CCTP API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getChainIdFromName(chainName: string): number {
  const chainMap: Record<string, number> = {
    sepolia: sepolia.id,
    lineaSepolia: lineaSepolia.id,
    arbitrumSepolia: arbitrumSepolia.id,
    optimismSepolia: optimismSepolia.id,
  };
  
  const chainId = chainMap[chainName];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }
  
  return chainId;
}

// Utility to convert address to bytes32
function addressToBytes32(address: string): `0x${string}` {
  return pad(address as `0x${string}`, { size: 32 });
}

async function handleApprove(sourceChain: string, amount: string, walletAddress: string) {
  try {
    console.log('Handling approve for:', { sourceChain, amount, walletAddress });
    
    const chainId = getChainIdFromName(sourceChain);
    const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
    const client = clients[chainId as keyof typeof clients];
    
    if (!contracts || !client) {
      return NextResponse.json({ error: 'Unsupported source chain' }, { status: 400 });
    }

    // Handle undefined wallet address
    if (!walletAddress) {
      return NextResponse.json({
        success: true,
        message: 'Wallet address required for approval. Please provide a valid wallet address.',
        requiredParameters: {
          walletAddress: 'A valid Ethereum address (0x...)',
          sourceChain,
          amount,
        },
        example: {
          action: 'approve',
          sourceChain: 'sepolia',
          amount: '2',
          walletAddress: '0x1234567890123456789012345678901234567890'
        }
      });
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        error: 'Invalid wallet address format',
        details: 'Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)',
        received: walletAddress
      }, { status: 400 });
    }

    // Format amount to USDC smallest units (6 decimals)
    const amountInSmallestUnits = Math.floor(parseFloat(amount) * 1000000).toString();
    
    // Check current allowance
    const currentAllowance = await client.readContract({
      address: contracts.usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [walletAddress as `0x${string}`, contracts.tokenMessenger as `0x${string}`],
    });

    // If allowance is sufficient, return success
    if (currentAllowance >= BigInt(amountInSmallestUnits)) {
      return NextResponse.json({
        success: true,
        message: 'Sufficient allowance already exists',
        allowance: currentAllowance.toString(),
      });
    }

    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contracts.tokenMessenger as `0x${string}`, BigInt(amountInSmallestUnits)],
    });

    return NextResponse.json({
      success: true,
      message: `Approval required: Please approve ${amount} USDC for the TokenMessenger contract.`,
      transactionData: {
        to: contracts.usdc,
        data: approveData,
        value: '0',
        from: walletAddress,
      },
    });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ 
      error: 'Failed to approve USDC',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleDepositForBurn(
  sourceChain: string, 
  destinationChain: string, 
  amount: string, 
  recipientAddress: string, 
  walletAddress: string
) {
  try {
    console.log('Handling depositForBurn:', { sourceChain, destinationChain, amount, recipientAddress, walletAddress });
    
    const sourceChainId = getChainIdFromName(sourceChain);
    const destinationChainId = getChainIdFromName(destinationChain);

    const destinationDomain = CCTP_DOMAINS[destinationChainId as keyof typeof CCTP_DOMAINS];
    const sourceContracts = CCTP_CONTRACTS[sourceChainId as keyof typeof CCTP_CONTRACTS];
    const sourceClient = clients[sourceChainId as keyof typeof clients];
    
    if (!sourceContracts || !sourceClient || destinationDomain === undefined) {
      return NextResponse.json({ error: 'Unsupported chain configuration' }, { status: 400 });
    }
    
    // Validate recipient address
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: `Invalid recipient address: ${recipientAddress}` }, { status: 400 });
    }

    // Format amount to USDC smallest units (6 decimals)
    const amountInSmallestUnits = BigInt(Math.floor(parseFloat(amount) * 1000000));

    // Check allowance before proceeding
    const currentAllowance = await sourceClient.readContract({
      address: sourceContracts.usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [walletAddress as `0x${string}`, sourceContracts.tokenMessenger as `0x${string}`],
    });

    if (currentAllowance < amountInSmallestUnits) {
      return NextResponse.json({
        success: false,
        error: `Insufficient USDC allowance. Required: ${amountInSmallestUnits.toString()}, but only have ${currentAllowance.toString()}. Please approve the contract to spend your USDC first.`,
      }, { status: 400 });
    }
    
    // Convert recipient address to bytes32
    const mintRecipientBytes32 = addressToBytes32(recipientAddress);

    const burnData = encodeFunctionData({
      abi: TOKEN_MESSENGER_ABI,
      functionName: 'depositForBurn',
      args: [
        amountInSmallestUnits,
        destinationDomain,
        mintRecipientBytes32,
        sourceContracts.usdc as `0x${string}`,
      ],
    });

    // For now, just returning the transaction data for the user to sign
    return NextResponse.json({
      success: true,
      message: `Burn transaction ready: Please sign the transaction to burn ${amount} USDC.`,
      transactionData: {
        to: sourceContracts.tokenMessenger,
        data: burnData,
        value: '0',
        from: walletAddress,
      },
    });
  } catch (error) {
    console.error('DepositForBurn error:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare burn transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleGetAttestation(messageHash: string) {
  try {
    console.log('Handling getAttestation for:', messageHash);
    
    if (!messageHash) {
      return NextResponse.json({ error: 'Missing messageHash parameter' }, { status: 400 });
    }

    console.log(`Fetching attestation for messageHash: ${messageHash}`);
    
    let attestationResponse;
    // Poll for attestation
    for (let i = 0; i < 20; i++) { // Poll for ~2 minutes
      const response = await fetch(`${IRIS_ATTESTATION_API_URL}/attestations/${messageHash}`);
      if (response.ok) {
        attestationResponse = await response.json();
        if (attestationResponse.status === 'complete') {
          return NextResponse.json({
            success: true,
            attestation: attestationResponse.attestation,
            messageBytes: attestationResponse.message,
          });
        }
      }
      await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds
    }

    return NextResponse.json({ error: 'Attestation not found or timed out' }, { status: 404 });

  } catch (error) {
    console.error('Attestation error:', error);
    return NextResponse.json({ 
      error: 'Failed to get attestation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleReceiveMessage(
  destinationChain: string, 
  messageBytes: string, 
  attestation: string, 
  walletAddress: string
) {
  try {
    console.log('Handling receiveMessage:', { destinationChain, messageBytes, attestation, walletAddress });
    
    const chainId = getChainIdFromName(destinationChain);
    const contracts = CCTP_CONTRACTS[chainId as keyof typeof CCTP_CONTRACTS];
    const client = clients[chainId as keyof typeof clients];
    
    if (!contracts || !client) {
      return NextResponse.json({ error: 'Unsupported destination chain' }, { status: 400 });
    }

    if (!messageBytes || !attestation) {
      return NextResponse.json({ error: 'Missing messageBytes or attestation' }, { status: 400 });
    }

    const receiveData = encodeFunctionData({
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: 'receiveMessage',
      args: [messageBytes as `0x${string}`, attestation as `0x${string}`],
    });

    return NextResponse.json({
      success: true,
      message: 'Mint transaction ready: Please sign the transaction to mint your USDC.',
      transactionData: {
        to: contracts.messageTransmitter,
        data: receiveData,
        value: '0',
        from: walletAddress,
      },
    });
  } catch (error) {
    console.error('ReceiveMessage error:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare mint transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
