"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import styles from "../styles/Home.module.css";
import RPS from "../contracts/abis/RPS.json";
import Hasher from "../contracts/abis/Hasher.json";
import React from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
declare var window: any;

// 0x13D128C6c6d44D10d945abaDFcA0D71629A1f6a2
// 0xD7F335198Bb8cC3C4a53b817480F59eaf0670821
interface PlayRPSGameProps {
  secondPlayerWalletAddress: string;
  contractAddress: string;
}

const PlayRPSGame = ({
  secondPlayerWalletAddress,
  contractAddress,
}: PlayRPSGameProps) => {
  const [status, setStatus] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [secondPlayerAddress, setSecondPlayerAddress] = useState<string>("");
  const [move, setMove] = useState(0);
  const [playerTwoMove, setPlayerTwoMove] = useState(0);
  const [moveHash, setMoveHash] = useState<string>("");
  const [salt, setSalt] = useState<number>();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [deployedContractAddress, setDeployedContractAddress] =
    useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [gameURL, setGameURL] = useState<string | null>(null);
  const { address } = useAccount();
  const HasherContractAddress = "0x7B54F955FF830738c8e954D7B993EAb9Cf5c0720";
  const hasherContract = new ethers.Contract(
    HasherContractAddress,
    Hasher,
    provider
  );

  useEffect(() => {
    setCurrentUrl(window.location.href);
    if (typeof window?.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(provider.getSigner(address));
      setProvider(provider);
    }
  }, []);

  // Function to create a new RPS game
  const createGame = async () => {
    const salt = Math.floor(Math.random() * 100000); // Generate a random salt
    setSalt(salt);
    const hashedMove = await hasherContract.hash(move, salt);
    setMoveHash(hashedMove);
    try {
      // Deploy the contract
      const factory = new ethers.ContractFactory(
        RPS.abi,
        RPS.data.bytecode,
        signer
      );
      const deployedRPSContract = await factory.deploy(
        hashedMove,
        secondPlayerAddress,
        {
          value: ethers.utils.parseEther(amount), // Replace with the amount you want to bet
        }
      );
      await deployedRPSContract.deployed();
      const urlOfGame = `${currentUrl}?ca=${deployedRPSContract.address}&address=${secondPlayerAddress}`;
      setDeployedContractAddress(deployedRPSContract.address);
      setGameURL(urlOfGame);
      setStatus("Game created successfully!");
    } catch (error) {
      setStatus("Error creating the game.");
      console.error(error);
    }
  };

  // Function for player 2 to join the game
  const joinGame = async () => {
    // Initialize contract instance
    let contract;
    if (contractAddress) {
      contract = contractAddress;
    } else {
      contract = deployedContractAddress;
    }
    const rpsContract = new ethers.Contract(contract, RPS.abi, signer);
    try {
      const stake = await rpsContract.stake();
      const tx = await rpsContract.play(playerTwoMove, {
        value: stake,
        gasLimit: 400000,
      });
      await tx.wait();
      setStatus("Game joined successfully!");
    } catch (error) {
      setStatus("Error joining the game.");
      console.error(error);
    }
  };

  // Function to reveal the move and determine the winner
  const revealMove = async () => {
    const rpsContract = new ethers.Contract(
      deployedContractAddress,
      RPS.abi,
      signer
    );
    try {
      const tx = await rpsContract.solve(move, salt, { gasLimit: 300000 });
      await tx.wait();
      setStatus("Game resolved!");
    } catch (error) {
      setStatus("Error resolving the game.");
      console.error(error);
    }
  };

  return (
    <div className={styles.flex}>
      {/* Player 1 */}
      {!secondPlayerWalletAddress && !contractAddress && (
        <div>
          <h1>Player 1 Move</h1>
          <span>Enter Amount to stake: </span>
          <input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <br />
          First player move:
          <input
            type="number"
            placeholder="Move (0-4)"
            min="0"
            max="4"
            value={move}
            onChange={(e) => setMove(e.target.valueAsNumber)}
          />
          <br />
          <input
            type="text"
            placeholder="Enter Second Player Address"
            value={secondPlayerAddress}
            onChange={(e) => setSecondPlayerAddress(e.target.value)}
          />
          <br />
          <button onClick={createGame}>Create Game</button>
          <button onClick={revealMove}>Reveal Move</button>
          <br />
        </div>
      )}

      {/* Player 2 */}
      {secondPlayerWalletAddress && contractAddress && (
        <div>
          <h1>Player 2 Move</h1>
          <span>Second player move: </span>
          <input
            type="number"
            placeholder="Move (0-4)"
            min="0"
            max="4"
            value={playerTwoMove}
            onChange={(e) => setPlayerTwoMove(e.target.valueAsNumber)}
          />
          <br />
          <button onClick={joinGame}>Join Game</button>
        </div>
      )}

      {/* Status box */}
      <div style={{ marginTop: "3rem" }}>
        <div>Move Hash: {moveHash}</div>
        <div>Game Smart Contract Address: {deployedContractAddress}</div>
        <div>Status: {status}</div>
        <div>Game URL:</div>
        {gameURL && (
          <Link href={gameURL} target="_blank">
            Click here
          </Link>
        )}
      </div>
    </div>
  );
};

export default PlayRPSGame;
