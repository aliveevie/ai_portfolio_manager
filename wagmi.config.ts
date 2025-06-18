import { createPublicClient } from "viem";
import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export function getConfig() {
  return createConfig({
    chains: [lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia],
    connectors: [metaMask()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [lineaSepolia.id]: http(),
      [sepolia.id]: http(),
      [arbitrumSepolia.id]: http(),
      [optimismSepolia.id]: http(),
    },
  });
}