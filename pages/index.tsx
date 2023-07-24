import Head from "next/head";
import styles from "../styles/Home.module.css";
import PlayRPSGame from "../components/PlayRPSGame";
import { WagmiSetup } from "../clients/wagmi";
import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
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
