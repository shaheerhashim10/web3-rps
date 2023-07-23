import Head from "next/head";
import styles from "../styles/Home.module.css";
import PlayRPSGame from "../components/PlayRPSGame";
import { ethers } from "ethers";
import { WagmiSetup } from "../clients/wagmi";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
  const provider = new ethers.providers.JsonRpcProvider(); // Replace with your provider URL
  const signerAddress = ""; // Replace with your signer address
  const contractAddress = ""; // Replace with your deployed contract address
  return (
    <div className={styles.container}>
      <Head>
        <title>RPSLS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Rock Paper Scissors Lizard Spock DApp</h1>
        <WagmiSetup>
          <ConnectWallet />
          <PlayRPSGame
            provider={provider}
            signerAddress={signerAddress}
            contractAddress={contractAddress}
          />
        </WagmiSetup>
      </div>
    </div>
  );
}
