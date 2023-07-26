"use client";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import styles from "../styles/Home.module.css";
import PlayRPSGame from "../components/PlayRPSGame";
import { WagmiSetup } from "../clients/wagmi";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
  const searchParams = useSearchParams();
  const contractAddress = searchParams.get("ca");
  const secondPlayerAddress = searchParams.get("address");
  return (
    <div className={styles.container}>
      <Head>
        <title>RPSLS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1 style={{textAlign: 'center'}}>Rock Paper Scissors Lizard Spock DApp</h1>
        <WagmiSetup>
          <ConnectWallet />
          <PlayRPSGame
            secondPlayerWalletAddress={secondPlayerAddress}
            contractAddress={contractAddress}
          />
        </WagmiSetup>
      </div>
    </div>
  );
}
