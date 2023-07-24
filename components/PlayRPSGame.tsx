"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RPS from "../contracts/abis/RPS.json";
import Hasher from "../contracts/abis/Hasher.json";
import React from "react";
import { useAccount } from "wagmi";

// 0x13D128C6c6d44D10d945abaDFcA0D71629A1f6a2
// 0xD7F335198Bb8cC3C4a53b817480F59eaf0670821
interface PlayRPSGameProps {
  /*   provider: ethers.providers.Provider;
  // signerAddress: ethers.providers.JsonRpcSigner;
  signerAddress: string;
  contractAddress: string; */
}

const PlayRPSGame = ({}: /* provider,
  signerAddress,
  contractAddress, */
PlayRPSGameProps) => {
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [secondPlayerAddress, setSecondPlayerAddress] = useState("");
  const [move, setMove] = useState(0);
  const [moveHash, setMoveHash] = useState("");
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [deployedContractAddress, setDeployedContractAddress] = useState("");

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
    const hashedMove = await hasherContract.hash(move, salt);
    setMoveHash(hashedMove);

    try {
      // Deploy the contract
      const factory = new ethers.ContractFactory(
        RPS.abi,
        RPS.data.bytecode,
        signer
      );
      console.log({ secondPlayerAddress });
      const deployedRPSContract = await factory.deploy(
        hashedMove,
        secondPlayerAddress,
        {
          value: ethers.utils.parseEther(amount), // Replace with the amount you want to bet
        }
      );
      console.log({ deployedRPSContract });
      setDeployedContractAddress(deployedRPSContract.address);
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
    const rpsContract = new ethers.Contract(
      deployedContractAddress,
      // "0x21A66F78d5e7FA8791A3e9564e745E681D938B42",
      RPS.abi,
      signer
    );
    try {
      console.log({ rpsContract });
      const stake = await rpsContract.stake();
      console.log("Stake:", stake.toString());
      const tx = await rpsContract.play(move, {
        value: stake,
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
      // "0x1c1f1b2be6fCFf130C585F34131f4D62556Cfd7a",
      RPS.abi,
      signer
    );
    const salt = Math.floor(Math.random() * 100000); // Generate a random salt
    const hashedMove = await rpsContract.hash(move, salt);

    try {
      const tx = await rpsContract.solve(move, salt);
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
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Move (0-4)"
        value={move.toString()}
        onChange={(e) => setMove(parseInt(e.target.value))}
      />
      <input
        type="text"
        placeholder="Enter Second Player Address"
        value={secondPlayerAddress}
        onChange={(e) => setSecondPlayerAddress(e.target.value)}
      />
      <button onClick={createGame}>Create Game</button>
      <button onClick={joinGame}>Join Game</button>
      <button onClick={revealMove}>Reveal Move</button>
      <div>Move Hash: {moveHash}</div>
      <div>Game Smart Contract Address: {deployedContractAddress}</div>
      <div>Status: {status}</div>
    </div>
  );
};

export default PlayRPSGame;
