import { Buffer } from "buffer";
import { useState } from "react";
import { generateMnemonic } from "bip39";
import SOLwallet from "../src/components/SOLwallet"; // ✅ default import

// Make Buffer available in browser environment
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

function App() {
  const [importSeed, setImportSeed] = useState("");
  const [label, setLabel] = useState("Switch to Devnet");
  const [refresh, setRefresh] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [net, setNet] = useState<"devnet" | "mainnet">("devnet");

  function switchNet() {
    setNet((prev) => (prev === "devnet" ? "mainnet" : "devnet"));
  }
  return (
    <div className="relative w-screen flex flex-row items-center overflow-hidden px-2 sm:px-4 bg-transparent">
      {/* Wallet Manager Card */}
      <div className="relative z-10 w-full max-w-md min-w-[320px] bg-white/90 dark:bg-neutral-900/80 rounded-2xl shadow-2xl p-4 sm:p-8 border border-indigo-100 mx-auto backdrop-blur-md">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-4 sm:mb-6 text-center tracking-tight">
          Wallet Manager
        </h2>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
          <button
            className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow hover:from-indigo-600 hover:to-pink-600 transition font-semibold"
            onClick={() => setRefresh(refresh + 1)}
          >
            Refresh Balance
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow hover:from-pink-600 hover:to-indigo-600 transition font-semibold"
            onClick={() => {
              switchNet();
              setLabel((prev) =>
                prev === "Switch to Devnet"
                  ? "Switch to Mainnet"
                  : "Switch to Devnet"
              );
            }}
          >
            {label}
          </button>
        </div>

        {/* Import Seed */}
        <div className="mb-6 p-4 sm:p-5 bg-indigo-50/70 dark:bg-neutral-800/70 rounded-xl shadow-inner">
          <label className="block mb-2 font-medium text-indigo-700 dark:text-indigo-200">
            Import Seed Phrase:
          </label>
          <input
            type="text"
            value={importSeed}
            onChange={(e) => setImportSeed(e.target.value)}
            className="w-full border border-indigo-200 dark:border-indigo-700 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-neutral-900 dark:text-white transition text-sm"
            placeholder="Enter your seed phrase"
          />
          <button
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg w-full hover:from-indigo-600 hover:to-pink-600 transition font-semibold shadow text-sm"
            onClick={() => {
              if (importSeed.trim() === "") {
                alert(
                  "Empty Seed Phrase. Please insert phrase into input area."
                );
              } else {
                setMnemonic(importSeed);
                setImportSeed("");
                console.log("Seed imported:", importSeed);
              }
            }}
          >
            Import
          </button>
        </div>

        {/* Create Seed */}
        <div className="mb-6 p-4 sm:p-5 bg-indigo-50/70 dark:bg-neutral-800/70 rounded-xl shadow-inner flex flex-col items-center">
          <button
            className="w-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-blue-600 transition font-semibold shadow text-sm"
            onClick={() => {
              const mn = generateMnemonic();
              setMnemonic(mn);
              console.log("Seed generated:", mn);
            }}
          >
            Create Seed Phrase
          </button>
        </div>

        {/* Display Seed */}
        <div className="mb-6 p-4 sm:p-5 bg-indigo-50/70 dark:bg-neutral-800/70 rounded-xl shadow-inner">
          <label className="block mb-2 font-medium text-indigo-700 dark:text-indigo-200">
            Your Seed Phrase:
          </label>
          <input
            type="text"
            value={mnemonic}
            readOnly
            className="w-full border border-indigo-200 dark:border-indigo-700 rounded px-3 py-2 bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-white text-sm"
            placeholder="Your generated seed phrase"
          />
        </div>
      </div>

      {/* Full-Width Solana Wallet Manager */}
      <div className="mt-8 w-full px-2 sm:px-6">
        <div className="bg-white/80 dark:bg-neutral-900/80 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-4 sm:p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-200">
            Solana Wallet Manager
          </h3>
          <SOLwallet mnemonic={mnemonic} net={net} refreshCounter={refresh} />
        </div>
      </div>
    </div>
  );
}

export default App;
