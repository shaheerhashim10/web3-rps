"use client";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";

export default function ConnectWallet() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address, connector, isConnected } = useAccount();
  // const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();

  const disconnectWallet = () => {
    disconnect();
  };
  return (
    <div>
      {isConnected ? (
        <div>
          <span>{ensName ? `${ensName} (${address})` : address}</span>
          {/* <div>Connected to {connector.name}</div> */}
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        connectors.map((connector) => (
          <button
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
            {!connector.ready && " (unsupported)"}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              " (connecting)"}
          </button>
        ))
      )}
      {error && <div>{error.message}</div>}
    </div>
  );
}
