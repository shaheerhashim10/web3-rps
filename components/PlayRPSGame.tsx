"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import RPS from "../contracts/abis/RPS.json";
import Hasher from "../contracts/abis/Hasher.json";
import React from "react";
import { useAccount } from "wagmi";
declare var window: any;

// 0x13D128C6c6d44D10d945abaDFcA0D71629A1f6a2
// 0xD7F335198Bb8cC3C4a53b817480F59eaf0670821
// http://localhost:3000/?ca=%220x7113D6E63aCaDe02E99BD0074512f1531dc07306%22&address=%220xD7F335198Bb8cC3C4a53b817480F59eaf0670821%22
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
  const { pathname } = useRouter();

  console.log("%cPROPS", "background: pink");
  console.log({ secondPlayerWalletAddress });
  console.log({ contractAddress });

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const { address } = useAccount();
  const HasherContractAddress = "0x7B54F955FF830738c8e954D7B993EAb9Cf5c0720";
  useEffect(() => {
    if (
      typeof window?.ethereum !== "undefined" ||
      typeof window?.web3 !== "undefined"
    ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      setSigner(provider.getSigner(address));
    }
  }, []);

  // const { provider, signer } = lookUpProvider();

  console.log({ provider });
  console.log({ signer });

  const hasherContract = new ethers.Contract(
    HasherContractAddress,
    Hasher,
    provider
  );

  // Function to create a new RPS game
  const createGame = async () => {
    console.log({ provider });
    console.log({ signer });

    const salt = Math.floor(Math.random() * 100000); // Generate a random salt
    console.log("%ccreateGame", "background: pink");
    console.log({ move });
    console.log({ salt });
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

      console.log("%cLOGS", "background: red");
      console.log({ hashedMove });
      console.log({ secondPlayerAddress });
      console.log({ amount });
      const deployedRPSContract = await factory.deploy(
        hashedMove,
        secondPlayerAddress,
        {
          value: ethers.utils.parseEther(amount), // Replace with the amount you want to bet
        }
      );
      console.log({ deployedRPSContract });
      // const urlOfGame = `${currentUrl}?ca="${deployedRPSContract.address}"&address="${secondPlayerAddress}"`;
      const urlOfGame = `${currentUrl}?ca="${deployedRPSContract.address}"&address="${secondPlayerAddress}"`;
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
    // 0x1c1f1b2be6fCFf130C585F34131f4D62556Cfd7a
    console.log({ deployedContractAddress });
    const rpsContract = new ethers.Contract(
      deployedContractAddress,
      // "0xC18F8BEb60bC25133F2ECEE270eDd377D1A1c817",
      RPS.abi,
      signer
    );
    try {
      console.log({ rpsContract });
      const stake = await rpsContract.stake();
      console.log("Stake:", stake.toString());

      console.log("%cJOINGAME", "background: blue");
      console.log({ playerTwoMove });
      console.log({ stake });
      const tx = await rpsContract.play(playerTwoMove, {
        value: stake,
        gasLimit: 300000,
      });
      await tx.wait();
      setStatus("Game joined successfully!");

      // Convert the BigNumber to a human-readable string
      // const stakeInEther = ethers.utils.formatEther(stake);
      // console.log('Stake in Ether:', stakeInEther);
    } catch (error) {
      setStatus("Error joining the game.");
      console.error(error);
    }
  };

  // Function to reveal the move and determine the winner
  const revealMove = async () => {
    const rpsContract = new ethers.Contract(
      deployedContractAddress,
      // "0xC18F8BEb60bC25133F2ECEE270eDd377D1A1c817",
      RPS.abi,
      signer
    );
    // const salt = Math.floor(Math.random() * 100000); // Generate a random salt
    // const hashedMove = await rpsContract.hash(move, salt);

    try {
      console.log("%cReveal_GAME", "background: green");
      console.log({ move });
      console.log({ salt });
      const tx = await rpsContract.solve(move, salt, { gasLimit: 300000 });
      await tx.wait();
      setStatus("Game resolved!");
    } catch (error) {
      setStatus("Error resolving the game.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Contract Interaction</h2>
      <div>Status: {status}</div>
      <span>Enter Amount to stake: </span>
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />
      {/* <input
        type="text"
        placeholder="Move (0-4)"
        value={move.toString()}
        onChange={(e) => setMove(parseInt(e.target.value))}
      /> */}
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
      
      <div>Move Hash: {moveHash}</div>
      <div>Game Smart Contract Address: {deployedContractAddress}</div>
      <div>Status: {status}</div>
      <div>Game URL: {gameURL}</div>
    </div>
  );
};

export default PlayRPSGame;
