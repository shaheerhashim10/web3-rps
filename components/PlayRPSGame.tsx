import { useState } from "react";
import { ethers } from "ethers";
import RPSABI from "../contracts/abis/RPS.json";
import React from "react";

interface PlayRPSGameProps {
  provider: ethers.providers.Provider;
  signerAddress: string;
  contractAddress: string;
}

const PlayRPSGame = ({
  provider,
  signerAddress,
  contractAddress,
}: PlayRPSGameProps) => {
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [move, setMove] = useState(0);
  const [moveHash, setMoveHash] = useState("");

  // Initialize contract instance
  const rpsContract = new ethers.Contract(
    contractAddress,
    RPSABI,
    provider.getSigner()
  );

  // Function to create a new RPS game
  const createGame = async () => {
    const salt = Math.floor(Math.random() * 100000); // Generate a random salt
    const hashedMove = await rpsContract.hash(move, salt);
    setMoveHash(hashedMove);

    try {
      const tx = await rpsContract.RPS(hashedMove, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setStatus("Game created successfully!");
    } catch (error) {
      setStatus("Error creating the game.");
      console.error(error);
    }
  };

  // Function for player 2 to join the game
  const joinGame = async () => {
    try {
      const tx = await rpsContract.play(move, {
        value: ethers.utils.parseEther(amount),
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
      <button onClick={createGame}>Create Game</button>
      <button onClick={joinGame}>Join Game</button>
      <button onClick={revealMove}>Reveal Move</button>
      <div>Move Hash: {moveHash}</div>
    </div>
  );
};

export default PlayRPSGame;
