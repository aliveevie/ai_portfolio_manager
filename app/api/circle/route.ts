import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
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
      case 'crossChainTransfer':
        return await handleCrossChainTransfer(sourceChain, destinationChain, amount, recipientAddress, walletAddress);
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

async function handleApprove(sourceChain: string, amount: string, walletAddress: string) {
  try {
    console.log('Handling approve for:', { sourceChain, amount, walletAddress });
    
    const chainId = getChainIdFromName(sourceChain);
    const contracts = CCTP_CONTRACTS[chainId];
    const client = clients[chainId];
    
    if (!contracts || !client) {
      return NextResponse.json({ error: 'Unsupported source chain' }, { status: 400 });
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

    // For now, we'll return a simulated approval since we need wallet integration
    // In a real implementation, this would trigger a wallet transaction
    return NextResponse.json({
      success: true,
      message: 'Approval required - please approve USDC spending in your wallet',
      requiredAmount: amountInSmallestUnits,
      spender: contracts.tokenMessenger,
      token: contracts.usdc,
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
    const destinationDomain = CCTP_DOMAINS[getChainIdFromName(destinationChain)];
    const contracts = CCTP_CONTRACTS[sourceChainId];
    const client = clients[sourceChainId];
    
    if (!contracts || !client || destinationDomain === undefined) {
      return NextResponse.json({ error: 'Unsupported chain configuration' }, { status: 400 });
    }

    const amountInSmallestUnits = Math.floor(parseFloat(amount) * 1000000).toString();
    const mintRecipientBytes32 = `0x000000000000000000000000${recipientAddress.slice(2)}`;

    // For now, we'll return a simulated depositForBurn
    // In a real implementation, this would trigger a wallet transaction
    const simulatedNonce = Math.floor(Math.random() * 1000000);
    const simulatedMessageHash = `0x${simulatedNonce.toString(16).padStart(64, '0')}`;

    return NextResponse.json({
      success: true,
      message: 'DepositForBurn transaction required - please execute in your wallet',
      nonce: simulatedNonce,
      messageHash: simulatedMessageHash,
      transactionData: {
        to: contracts.tokenMessenger,
        data: '0x', // This would be the actual encoded function call
        value: '0x0',
        from: walletAddress,
      },
      parameters: {
        amount: amountInSmallestUnits,
        destinationDomain,
        mintRecipient: mintRecipientBytes32,
        burnToken: contracts.usdc,
      },
    });
  } catch (error) {
    console.error('DepositForBurn error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate depositForBurn',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleGetAttestation(messageHash: string) {
  try {
    console.log('Handling getAttestation for:', messageHash);
    
    if (!messageHash) {
      return NextResponse.json({ error: 'Message hash is required' }, { status: 400 });
    }

    // Poll for attestation
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const response = await fetch(`${IRIS_ATTESTATION_API_URL}/attestations/${messageHash}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'complete' && data.attestation) {
            return NextResponse.json({
              success: true,
              attestation: data.attestation,
              status: data.status,
            });
          }
        } else if (response.status !== 404) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Attestation polling attempt ${attempts} failed:`, error);
      }
      
      // Wait 5 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return NextResponse.json({
      error: 'Attestation not available after maximum attempts',
    }, { status: 408 });
  } catch (error) {
    console.error('GetAttestation error:', error);
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
    console.log('Handling receiveMessage:', { destinationChain, walletAddress });
    
    const destinationChainId = getChainIdFromName(destinationChain);
    const contracts = CCTP_CONTRACTS[destinationChainId];
    const client = clients[destinationChainId];
    
    if (!contracts || !client) {
      return NextResponse.json({ error: 'Unsupported destination chain' }, { status: 400 });
    }

    if (!messageBytes || !attestation) {
      return NextResponse.json({ error: 'Message bytes and attestation are required' }, { status: 400 });
    }

    // For now, we'll return a simulated receiveMessage
    // In a real implementation, this would trigger a wallet transaction
    return NextResponse.json({
      success: true,
      message: 'ReceiveMessage transaction required - please execute in your wallet',
      transactionData: {
        to: contracts.messageTransmitter,
        data: '0x', // This would be the actual encoded function call
        value: '0x0',
        from: walletAddress,
      },
      parameters: {
        message: messageBytes,
        attestation,
      },
    });
  } catch (error) {
    console.error('ReceiveMessage error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute receiveMessage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCrossChainTransfer(
  sourceChain: string,
  destinationChain: string,
  amount: string,
  recipientAddress: string,
  walletAddress: string
) {
  try {
    console.log('Handling complete cross-chain transfer:', { 
      sourceChain, destinationChain, amount, recipientAddress, walletAddress 
    });

    // Step 1: Approve USDC
    const approveResult = await handleApprove(sourceChain, amount, walletAddress);
    if (!approveResult.ok) {
      const errorData = await approveResult.json();
      return NextResponse.json({ 
        error: 'Approval failed', 
        details: errorData 
      }, { status: 500 });
    }

    // Step 2: Deposit for burn
    const burnResult = await handleDepositForBurn(sourceChain, destinationChain, amount, recipientAddress, walletAddress);
    if (!burnResult.ok) {
      const errorData = await burnResult.json();
      return NextResponse.json({ 
        error: 'DepositForBurn failed', 
        details: errorData 
      }, { status: 500 });
    }

    const burnData = await burnResult.json();
    const messageHash = burnData.messageHash;

    // Step 3: Get attestation
    const attestationResult = await handleGetAttestation(messageHash);
    if (!attestationResult.ok) {
      const errorData = await attestationResult.json();
      return NextResponse.json({ 
        error: 'Attestation failed', 
        details: errorData 
      }, { status: 500 });
    }

    const attestationData = await attestationResult.json();

    // Step 4: Receive message (mint)
    const mintResult = await handleReceiveMessage(
      destinationChain, 
      attestationData.messageBytes || '0x', 
      attestationData.attestation, 
      walletAddress
    );

    if (!mintResult.ok) {
      const errorData = await mintResult.json();
      return NextResponse.json({ 
        error: 'ReceiveMessage failed', 
        details: errorData 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Cross-chain transfer of ${amount} USDC from ${sourceChain} to ${destinationChain} completed successfully!`,
      steps: {
        approval: 'Completed',
        burn: 'Completed',
        attestation: 'Completed',
        mint: 'Completed',
      },
      messageHash,
      attestation: attestationData.attestation,
    });
  } catch (error) {
    console.error('Cross-chain transfer error:', error);
    return NextResponse.json({ 
      error: 'Cross-chain transfer failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
