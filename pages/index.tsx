"use client";
import Head from "next/head";
import { useSearchParams } from 'next/navigation'
import styles from "../styles/Home.module.css";
import PlayRPSGame from "../components/PlayRPSGame";
import { WagmiSetup } from "../clients/wagmi";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
  /* const searchParams = useSearchParams()
  const search = searchParams.get('ca')
  console.log(search) */
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
          <PlayRPSGame />
        </WagmiSetup>
      </div>
    </div>
  );
}