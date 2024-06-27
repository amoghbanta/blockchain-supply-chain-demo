import React, { useState, useEffect } from 'react';


const SupplyChainSimulator = () => {
  const [step, setStep] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [inventory, setInventory] = useState({
    'Raw Materials': 10,
    'Manufactured Goods': 0,
    'Distributed Goods': 0,
    'Retail Stock': 0,
    'Sold Items': 0,
  });
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { name: 'Supplier', icon: '🏭', color: 'bg-gray-200', action: 'Supply Raw Materials' },
    { name: 'Manufacturer', icon: '📦', color: 'bg-blue-200', action: 'Manufacture Goods' },
    { name: 'Distributor', icon: '🚚', color: 'bg-green-200', action: 'Distribute Goods' },
    { name: 'Retailer', icon: '🏪', color: 'bg-purple-200', action: 'Stock Shelves' },
    { name: 'Consumer', icon: '🛒', color: 'bg-red-200', action: 'Purchase Goods' },
  ];

  const createTransaction = () => {
    const currentStep = steps[step];
    const newTransaction = {
      from: step > 0 ? steps[step - 1].name : 'Genesis',
      to: currentStep.name,
      amount: 1,
      action: currentStep.action,
    };
    setPendingTransaction(newTransaction);
    setIsProcessing(true);

    setTimeout(() => {
      addBlock(newTransaction);
      setIsProcessing(false);
      setPendingTransaction(null);
    }, 2000);
  };

  const addBlock = (transaction) => {
    const newBlock = {
      id: blocks.length + 1,
      step: transaction.to,
      action: transaction.action,
      timestamp: new Date().toLocaleTimeString(),
      previousHash: blocks.length > 0 ? blocks[blocks.length - 1].hash : '0',
      hash: calculateHash(blocks.length + 1, transaction.to, [transaction]),
      transactions: [transaction],
    };
    setBlocks([...blocks, newBlock]);
    updateInventory(transaction.to);
    setStep((prevStep) => (prevStep + 1) % steps.length);
  };

  const calculateHash = (id, step, transactions) => {
    const data = id + step + JSON.stringify(transactions);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const updateInventory = (stepName) => {
    setInventory(prev => {
      const newInventory = { ...prev };
      switch (stepName) {
        case 'Supplier':
          newInventory['Raw Materials'] += 5;
          break;
        case 'Manufacturer':
          newInventory['Raw Materials'] -= 2;
          newInventory['Manufactured Goods'] += 1;
          break;
        case 'Distributor':
          newInventory['Manufactured Goods'] -= 1;
          newInventory['Distributed Goods'] += 1;
          break;
        case 'Retailer':
          newInventory['Distributed Goods'] -= 1;
          newInventory['Retail Stock'] += 1;
          break;
        case 'Consumer':
          newInventory['Retail Stock'] -= 1;
          newInventory['Sold Items'] += 1;
          break;
      }
      return newInventory;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.7 && !isProcessing) {
        createTransaction();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [step, blocks, inventory, isProcessing]);

  const SupplyChainDiagram = ({ currentStep }) => (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between w-full">
        {steps.map((s, index) => (
          <div key={s.name} className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full ${s.color} flex items-center justify-center ${index === currentStep ? 'ring-2 ring-blue-500' : ''}`}>
              {s.icon}
            </div>
            <span className="text-xs mt-2">{s.name}</span>
            {index < steps.length - 1 && <span className="mt-2">➡️</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const BlockchainDiagram = ({ blocks }) => (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 rounded-lg">
      {blocks.slice(-3).reverse().map((block, index) => (
        <div key={block.id} className="flex flex-col items-center">
          <div className="w-64 mb-2 p-2 border rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <span>🗄️</span>
              <span className="text-xs font-semibold">Block {block.id}</span>
              <span>🔒</span>
            </div>
            <div className="text-xs">
              <p>Step: {block.step}</p>
              <p>Action: {block.action}</p>
              <p className="truncate">Hash: {block.hash.substring(0, 8)}...</p>
            </div>
          </div>
          {index < 2 && <span>⬇️</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Diagrammatic Blockchain Supply Chain Simulator</h1>
      <p className="mb-4">
        Watch the flow of goods through the supply chain and see how each step is recorded in the blockchain.
      </p>
      
      <div className="mb-4 border rounded p-4">
        <h2 className="text-xl font-bold mb-2">Supply Chain Process</h2>
        <SupplyChainDiagram currentStep={step} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Inventory</h2>
          {Object.entries(inventory).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Pending Transaction</h2>
          {pendingTransaction ? (
            <div className="text-sm">
              {pendingTransaction.from} → {pendingTransaction.to}: {pendingTransaction.amount} ({pendingTransaction.action})
              {isProcessing && <p className="text-blue-500 mt-2">Processing...</p>}
            </div>
          ) : (
            <div className="text-sm">No pending transactions</div>
          )}
        </div>
      </div>

      <div className="mb-4 border rounded p-4">
        <h2 className="text-xl font-bold mb-2">Blockchain (Last 3 Blocks)</h2>
        <BlockchainDiagram blocks={blocks} />
      </div>

      <button
        onClick={createTransaction}
        disabled={isProcessing}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {isProcessing ? 'Processing...' : 'Progress Supply Chain'}
      </button>

      <div className="border rounded p-4">
        <h2 className="text-xl font-bold mb-2">Blockchain Details</h2>
        <div className="max-h-64 overflow-y-auto">
          {blocks.slice().reverse().map((block) => (
            <div key={block.id} className="mb-2 p-2 border rounded">
              <h3 className="font-bold">Block {block.id}</h3>
              <p>Step: {block.step}</p>
              <p>Action: {block.action}</p>
              <p>Time: {block.timestamp}</p>
              <p>Hash: {block.hash}</p>
              <p>Previous Hash: {block.previousHash}</p>
              <h4 className="font-semibold mt-2">Transactions:</h4>
              {block.transactions.map((tx, index) => (
                <p key={index} className="text-sm">
                  {tx.from} → {tx.to}: {tx.amount} ({tx.action})
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplyChainSimulator;