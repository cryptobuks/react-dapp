import React, { useState } from "react";
import { ethers } from "ethers";

import toast, { Toaster } from "react-hot-toast";
import GreeterArtifacts from "./artifacts/contracts/Greeter.sol/Greeter.json";
import TokenArtifacts from "./artifacts/contracts/Token.sol/Token.json";
import { Greeter } from "./types/Greeter";
import { Token } from "./types/Token";

const greeterAddress = import.meta.env.VITE_GREETER_ADDRESS;
const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState<string>("");
  // store user address in local state
  const [userAddress, setUserAddressValue] = useState<string>("");
  // store amount in local state
  const [amount, setAmountValue] = useState<number>(0);

  // request access to the user's MetaMask account
  async function requestAccount() {
    if (window.ethereum?.request)
      return window.ethereum.request({ method: "eth_requestAccounts" });

    throw new Error(
      "Missing install Metamask. Please access https://metamask.io/ to install extension on your browser"
    );
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        greeterAddress,
        GreeterArtifacts.abi,
        provider
      ) as Greeter;
      try {
        const data = await contract.greet();
        toast.success(`Greeting: ${data}`);
      } catch (err) {
        toast.error(`Error: ${err}`);
      }
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        greeterAddress,
        GreeterArtifacts.abi,
        signer
      ) as Greeter;

      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      fetchGreeting();
    }
  }

  // get balance of the token contract
  async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        tokenAddress,
        TokenArtifacts.abi,
        provider
      ) as Token;

      // request account from metamask
      const [account] = await requestAccount();
      const balance = await contract.balanceOf(account);
      toast.success(`balance: ${balance.toString()}`);
    }
  }

  // send a transaction to the token contract
  async function sendToken() {
    if (!userAddress || !amount) return;

    if (typeof window.ethereum !== "undefined") {
      // request account from metamask
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        TokenArtifacts.abi,
        signer
      ) as Token;
      const transaction = await contract.transfer(userAddress, amount);
      await transaction.wait();
      getBalance();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
        <h3 className="text-3xl">Greeter Contract</h3>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
          <div className="flex flex-row flex-wrap">
            <button
              className="btn btn-green mt-1"
              type="button"
              onClick={fetchGreeting}
            >
              Fetch Greeting
            </button>
            <div className="flex flex-row flex-wrap mt-1">
              <input
                onChange={(e) => setGreetingValue(e.target.value)}
                type="text"
                placeholder="Set greeting"
              />
              <button
                className="btn btn-green ml-1"
                type="button"
                onClick={setGreeting}
              >
                Set Greeting
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
        <h3 className="text-3xl">Token Contract</h3>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={getBalance}
          >
            Get Balance
          </button>

          <hr className="mt-4" />

          <input
            type="text"
            onChange={(e) => setUserAddressValue(e.target.value)}
            placeholder="User address"
          />
          <input
            type="number"
            onChange={(e) => setAmountValue(Number(e.target.value))}
            placeholder="Amount"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={sendToken}
          >
            Send token
          </button>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
