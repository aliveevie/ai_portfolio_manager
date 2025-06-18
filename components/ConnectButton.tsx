"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/button";

export const ConnectButton = () => {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="mx-auto">
      {isConnected ? (
        <Button onClick={() => disconnect()}>
          Disconnect {address}
        </Button>
      ) : (
        <Button onClick={() => connect({ connector: metaMask() })}>
          Connect
        </Button>
      )}
    </div>
  );
}; 