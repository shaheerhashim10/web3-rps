import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { goerli } from "wagmi/chains";

import { publicProvider } from "wagmi/providers/public";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import React, { PropsWithChildren } from "react";

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});

// Pass config to React Context Provider
export const WagmiSetup = ({ children }: PropsWithChildren): JSX.Element => {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};
