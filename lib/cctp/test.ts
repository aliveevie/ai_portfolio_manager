import { CCTP_CONTRACTS, CCTP_DOMAINS, NETWORK_NAMES } from './constants';
import { addressToBytes32, formatUSDCAmount, isSupportedChain } from './utils';
import { sepolia, lineaSepolia, arbitrumSepolia, optimismSepolia } from 'wagmi/chains';

// Test utility functions
function testAddressToBytes32() {
  const testAddress = '0x1234567890123456789012345678901234567890';
  const result = addressToBytes32(testAddress);
  const expected = '0x0000000000000000000000001234567890123456789012345678901234567890';
  
  console.log('Testing addressToBytes32:');
  console.log(`Input: ${testAddress}`);
  console.log(`Output: ${result}`);
  console.log(`Expected: ${expected}`);
  console.log(`Pass: ${result === expected}`);
  console.log('');
}

function testFormatUSDCAmount() {
  const testCases = [
    { input: '1', expected: '1000000' },
    { input: '2.5', expected: '2500000' },
    { input: '0.1', expected: '100000' },
  ];
  
  console.log('Testing formatUSDCAmount:');
  testCases.forEach(({ input, expected }) => {
    const result = formatUSDCAmount(input);
    console.log(`Input: ${input} USDC`);
    console.log(`Output: ${result} smallest units`);
    console.log(`Expected: ${expected}`);
    console.log(`Pass: ${result === expected}`);
    console.log('');
  });
}

function testIsSupportedChain() {
  const testCases = [
    { chainId: sepolia.id, expected: true },
    { chainId: lineaSepolia.id, expected: true },
    { chainId: arbitrumSepolia.id, expected: true },
    { chainId: optimismSepolia.id, expected: true },
    { chainId: 1, expected: false }, // Mainnet
    { chainId: 999, expected: false }, // Unknown chain
  ];
  
  console.log('Testing isSupportedChain:');
  testCases.forEach(({ chainId, expected }) => {
    const result = isSupportedChain(chainId);
    console.log(`Chain ID: ${chainId}`);
    console.log(`Supported: ${result}`);
    console.log(`Expected: ${expected}`);
    console.log(`Pass: ${result === expected}`);
    console.log('');
  });
}

function testContractAddresses() {
  console.log('Testing contract addresses:');
  
  Object.entries(CCTP_CONTRACTS).forEach(([chainId, contracts]) => {
    console.log(`Chain ID: ${chainId}`);
    console.log(`TokenMessenger: ${contracts.tokenMessenger}`);
    console.log(`MessageTransmitter: ${contracts.messageTransmitter}`);
    console.log(`USDC: ${contracts.usdc}`);
    console.log('');
  });
}

function testDomainMappings() {
  console.log('Testing domain mappings:');
  
  Object.entries(CCTP_DOMAINS).forEach(([chainId, domain]) => {
    console.log(`Chain ID: ${chainId} -> Domain: ${domain}`);
  });
  console.log('');
}

// Run all tests
export function runTests() {
  console.log('=== CCTP Implementation Tests ===\n');
  
  testAddressToBytes32();
  testFormatUSDCAmount();
  testIsSupportedChain();
  testContractAddresses();
  testDomainMappings();
  
  console.log('=== Tests Complete ===');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
} 