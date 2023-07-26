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
  const [move, setMove] = useState(1);
  const [playerTwoMove, setPlayerTwoMove] = useState(1);
  const [moveHash, setMoveHash] = useState<string>("");
  const [salt, setSalt] = useState<number>();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [deployedContractAddress, setDeployedContractAddress] =
    useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [gameURL, setGameURL] = useState<string | null>(null);
  const { address } = useAccount();
  const [timeout2, setTimeout2] = useState<boolean>(false);
  const [timeout1, setTimeout1] = useState<boolean>(false);

  const HasherContractAddress = "0x7B54F955FF830738c8e954D7B993EAb9Cf5c0720";
  const hasherContract = new ethers.Contract(
    HasherContractAddress,
    Hasher,
    provider
  );
  const TIMEOUT = 300000;
  let socket;
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
      setTimeout(enablePlayerTwoTimeout, TIMEOUT);
      setDeployedContractAddress(deployedRPSContract.address);
      setGameURL(urlOfGame);
      setStatus("Game created successfully!");
    } catch (error) {
      setStatus("Error creating the game.");
      console.error(error);
    }
  };

  const enablePlayerTwoTimeout = () => {
    setTimeout2(true);
  };
  const enablePlayerOneTimeout = () => {
    setTimeout1(true);
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
      setTimeout(enablePlayerOneTimeout, TIMEOUT);
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
      await detectWinner(rpsContract);
    } catch (error) {
      setStatus("Error resolving the game.");
      console.error(error);
    }
  };

  const detectWinner = async (rpsContract) => {
    try {
      let result;
      const playerTwoMove = await rpsContract.c2();
      if (move === playerTwoMove) {
        setStatus("It's a tie!");
        return;
      }
      // Call the win function of the RPS contract to check the winner
      const winner = await rpsContract.win(move, playerTwoMove);
      if (winner === true) {
        setStatus("Player 1 (j1) wins!");
      } else {
        setStatus("Player 2 (j2) wins!");
      }
      return result;
    } catch (error) {
      console.error("Error detecting winner:", error);
      setStatus("Error detecting winner.");
    }
  };

  // Timeout functions
  const handleJ1Timeout = async () => {
    try {
      let contract;
      if (contractAddress) {
        contract = contractAddress;
      } else {
        contract = deployedContractAddress;
      }
      const rpsContract = new ethers.Contract(contract, RPS.abi, signer);
      // Call the contract's j1Timeout function.
      const tx = await rpsContract.j1Timeout();
      await tx.wait();

      setStatus("J1 timed out. J2 won!");
    } catch (error) {
      console.error("Error handling j1 timeout:", error);
    }
  };

  const handleJ2Timeout = async () => {
    try {
      // Initialize contract instance
      const rpsContract = new ethers.Contract(
        deployedContractAddress,
        RPS.abi,
        signer
      );

      // Call the contract's j2Timeout function.
      const tx = await rpsContract.j2Timeout();
      await tx.wait();

      setStatus("J2 timed out. J1 won!");
    } catch (error) {
      console.error("Error handling j2 timeout:", error);
    }
  };

  return (
    <div className={styles.flex}>
      <div style={{ border: "1px solid", width: "17rem" }}>
        <h3 style={{ textAlign: "center" }}>How to play?</h3>
        <hr />
        <ul>
          <li>Choose your move from 1-5.</li>
          <p>The numbers correspond to the Rock Paper Scissors Lizard Spock</p>
          <ul>
            {/* <li></li> */}
            <li>Rock: 1</li>
            <li>Paper: 2</li>
            <li>Scissors: 3</li>
            <li>Lizard: 4</li>
            <li>Spock: 5</li>
          </ul>
        </ul>
      </div>
      {/* Player 1 */}
      {!secondPlayerWalletAddress && !contractAddress && (
        <div style={{ border: "1px solid", padding: "1rem" }}>
          <h1>Player 1 Move</h1>
          <span style={{ fontSize: "1.5rem" }}>Enter your move: </span>
          <input
            type="number"
            placeholder="Move (0-4)"
            min="1"
            max="5"
            value={move}
            onChange={(e) => setMove(e.target.valueAsNumber)}
          />
          <br />
          <br />
          <span style={{ fontSize: "1.5rem" }}>Enter Amount to stake: </span>
          <input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <br />
          <br />
          <span style={{ fontSize: "1.5rem" }}>
            Enter Second Player Address:{" "}
          </span>
          <input
            type="text"
            placeholder="Enter Second Player Address"
            value={secondPlayerAddress}
            onChange={(e) => setSecondPlayerAddress(e.target.value)}
            size={50}
          />
          <br />
          <br />
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button
              onClick={createGame}
              disabled={deployedContractAddress !== ""}
            >
              Create Game
            </button>
            <button onClick={revealMove}>Reveal Move</button>
            <button onClick={handleJ2Timeout} disabled={!timeout2}>
              Trigger J2 Timeout
            </button>
          </div>
        </div>
      )}

      {/* Player 2 */}
      {secondPlayerWalletAddress && contractAddress && (
        <div style={{ border: "1px solid", padding: "1rem" }}>
          <h1>Player 2 Move</h1>
          <span style={{ fontSize: "1.5rem" }}>Second player move: </span>
          <input
            type="number"
            placeholder="Move (0-4)"
            min="1"
            max="5"
            value={playerTwoMove}
            onChange={(e) => setPlayerTwoMove(e.target.valueAsNumber)}
          />
          <br />
          <br />
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <button onClick={joinGame}>Join Game</button>
            <button onClick={handleJ1Timeout} disabled={!timeout1}>
              Trigger J1 Timeout
            </button>
          </div>
        </div>
      )}
      {/* Status box */}
      <div
        style={{
          marginTop: "3rem",
          border: "1px solid",
          width: "20rem",
          padding: "1rem",
        }}
      >
        {/* <div>Move Hash: {moveHash}</div>
        <div>Game Smart Contract Address: {deployedContractAddress}</div> */}
        <h1>Status: {status}</h1>
        <span style={{ fontSize: "1.5rem" }}>Game URL: </span>
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
