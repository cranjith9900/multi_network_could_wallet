import { Buffer } from "buffer";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
type WalletAppProps = {
  mnemonic: string;
  net: string;
  refreshCounter: number;
};
type WalletInfo = {
  currentIndex: number;
  publicKey: string;
  balance: number;
  keypair: Keypair;
};
interface GetBalanceResponse {
  jsonrpc: string;
  result: { value: number };
  id: number;
}

const WalletApp: React.FC<WalletAppProps> = ({
  mnemonic,
  net,
  refreshCounter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallet, setWallet] = useState<WalletInfo[]>([]);

  const [transPubkey, setTransPubkey] = useState<string>("");
  const [transPubkey2, setTransPubkey2] = useState<string>("");
  const [destPubkey, setDestPubkey] = useState<string>("");
  const [transferAmt, setTransferAmt] = useState<number>(0.5); // in SOL
  const [balance, setBalance] = useState<number>(0);
  // const mainnetRpc =
  //   "";
  const devnetRpc = "https://api.devnet.solana.com";

  const solanaQuickNode_RPC = net === "mainnet" ? devnetRpc : devnetRpc;
  const refreshBalanceSol = useCallback(async () => {
    const newWallet = await Promise.all(
      wallet.map(async (w) => {
        const balance = await fetchBalance(w.publicKey);
        return { ...w, balance };
      })
    );
    setWallet(newWallet);
  }, [wallet, solanaQuickNode_RPC]);

  useEffect(() => {
    refreshBalanceSol();
  }, [net, refreshCounter]);
  // Placeholder function for fetching balance
  const fetchBalance = useCallback(
    async (pubKey: string): Promise<number> => {
      try {
        const response = await axios.post<GetBalanceResponse>(devnetRpc, {
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [pubKey],
        });
        setBalance(response.data.result.value / LAMPORTS_PER_SOL);
        return response.data.result.value / LAMPORTS_PER_SOL;
      } catch (e) {
        console.log("Error while fetching balance", e);
        return 0;
      }
    },
    [devnetRpc]
  );

  const addWallet = useCallback(async () => {
    if (mnemonic === "") {
      alert("Empty Seed Phrase");
      return;
    }

    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    const publicKey = keypair.publicKey.toBase58();

    const balance = await fetchBalance(publicKey);

    // This is the correct call to add the wallet to the state.
    setWallet((prevWallets) => [
      ...prevWallets,
      { currentIndex, publicKey, balance, keypair },
    ]);
    console.log("public key", publicKey);

    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [mnemonic, currentIndex, fetchBalance]);
  // Placeholder function for transferring SOL
  const transferSol = useCallback(async () => {
    console.log(transPubkey, destPubkey, transferAmt);

    try {
      const connection = new Connection(solanaQuickNode_RPC);

      // Find the source wallet
      const fromWallet = wallet.find((w) => w.publicKey === transPubkey);
      if (!fromWallet) {
        alert("Source wallet not found");
        return;
      }

      // Validate destination public key
      let destPublicKey: PublicKey;
      try {
        destPublicKey = new PublicKey(destPubkey);
      } catch {
        alert("Invalid destination public key");
        return;
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromWallet.keypair.publicKey,
          toPubkey: destPublicKey,
          lamports: transferAmt * LAMPORTS_PER_SOL,
        })
      );

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet.keypair]
      );

      refreshBalanceSol();
      alert(`Transaction Successful: ${signature}`);
      console.log("Transfer Confirmed:", signature);
    } catch (e) {
      console.error("Transaction Failed: ", e);
      alert("Transaction Failed");
    }
    // TODO: implement transfer SOL logic
  }, [wallet, transPubkey, destPubkey, transferAmt, solanaQuickNode_RPC]);

  const airDropSol = useCallback(async () => {
    try {
      if (!transPubkey) {
        alert("Please enter a valid public key");
        return;
      }

      const connection = new Connection(solanaQuickNode_RPC, "confirmed");
      const pubKey = new PublicKey(transPubkey);

      console.log(
        `Requesting airdrop of ${transferAmt} SOL to ${transPubkey}...`
      );

      const signature = await connection.requestAirdrop(
        pubKey,
        transferAmt * LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(signature, "confirmed");

      alert("Airdrop successful!");
      refreshBalanceSol();
    } catch (e) {
      console.error("Error while requesting airdrop:", e);
      alert("Too many airdrops requested. Wait 24 hours for a refill.");
    }
  }, [transPubkey, transferAmt, wallet, solanaQuickNode_RPC]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">💰 Solana Wallet Manager</h1>
      <p className="mb-4">Check console for received props.</p>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Enter public key"
          value={transPubkey}
          onChange={(e) => setTransPubkey(e.target.value)}
          className="border px-2 py-1 rounded text-white"
        />
        <div className="flex flex-row justify-between">
          <button
            onClick={() => {
              fetchBalance(transPubkey);
            }}
            className="text-white w-full lg:w-1/3 bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-2 text-center ml-2 me-2 mb-3 mt-2 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
          >
            Fetch Balance
          </button>

          <button
            onClick={addWallet}
            className="text-white w-full lg:w-1/3 bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-2 text-center ml-2 me-2 mb-3 mt-2 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
          >
            Add Wallet
          </button>

          <button
            className="text-white w-full lg:w-1/3 bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-2 text-center ml-2 me-2 mb-3 mt-2 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
            onClick={() => {
              if (net === "mainnet") {
                alert("Not Applicable on Mainnet");
                return;
              }

              // First do the airdrop, then fetch balance
              airDropSol().then(() => {
                fetchBalance(transPubkey);
              });
            }}
          >
            Airdrop 2 Sol
          </button>
          {balance !== null && (
            <div className="mt-4">
              <p>Balance: {balance}</p>
            </div>
          )}
        </div>
        <div className="mt-6 p-4 bg-black text-white rounded-lg shadow-xl md:p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-4 text-center border-b pb-2 border-white md:text-3xl">
            Your Wallets
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {wallet.map((wallet, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out break-words"
              >
                <p className="text-lg font-semibold mb-2">Wallet {index + 1}</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong className="font-medium">Public Key:</strong>
                    <span className="block mt-1 bg-gray-800 p-2 rounded-md font-mono text-xs overflow-x-auto">
                      {wallet.publicKey}
                    </span>
                  </p>
                  <p>
                    <strong className="font-medium">Private Key:</strong>
                    <span className="block mt-1 bg-gray-800 p-2 rounded-md font-mono text-xs overflow-x-auto">
                      {Buffer.from(wallet.keypair.secretKey).toString("hex")}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <button
          onClick={transferSol}
          className="bg-purple-600 px-3 py-1 rounded"
        >
          Transfer SOL
        </button> */}

        {/* <input
          type="text"
          placeholder="Enter public key"
          value={transPubkey}
          onChange={(e) => setTransPubkey(e.target.value)}
          className="border px-2 py-1 rounded text-white"
        /> */}

        {/* <button
          className="text-white w-full lg:w-1/3 bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-2 text-center ml-2 me-2 mb-3 mt-2 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
          onClick={() => {
            if (net === "mainnet") {
              alert("Not Applicable on Mainnet");
              return;
            }
            setVisible(false);
            setVisiblity(!visiblity);

            // First do the airdrop, then fetch balance
            airDropSol().then(() => {
              fetchBalance(transPubkey);
            });
          }}
        >
          Airdrop 2 Sol
        </button> */}

        <input
          type="text"
          placeholder="Only add the Wallet generated Sender Public Key with sol airdropped else it will throw error"
          value={transPubkey2}
          onChange={(e) => setTransPubkey2(e.target.value)}
          className="px-2 py-1 rounded text-white mr-2"
        />
        <input
          type="text"
          placeholder="Receiver Public Key"
          value={destPubkey}
          onChange={(e) => setDestPubkey(e.target.value)}
          className="px-2 py-1 rounded text-white mr-2"
        />
        <input
          type="number"
          placeholder="Amount in SOL"
          onChange={(e) => setTransferAmt(Number(e.target.value))}
          className="px-2 py-1 rounded text-white mr-2"
        />
        <button
          onClick={transferSol}
          className="bg-purple-600 px-3 py-1 rounded w-full lg:w-1/3"
        >
          Transfer SOL
        </button>
      </div>
    </div>
  );
};

export default WalletApp;
