import React from 'react'
import { useState, useEffect } from 'react'
import Loan from './Loan'; // Import the Loan component

function Transactions() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('expense');
    const [showLoans, setShowLoans] = useState(false);

    useEffect(() => {
          const storedTransactions = JSON.parse(  
            localStorage.getItem("transactions") || "[]"
          );
          setTransactions(storedTransactions);
       
    }, []);
   
   const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
     
    const totalExpense = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + parseFloat(transaction.amount), 0);

    const balance = totalIncome - totalExpense;
  
    // Function to update transactions (will be passed to Loan component)
    const updateTransactionsFromLoan = (loanPayment) => {
      const newTransaction = {
        id: Date.now(),
        description: `Loan Payment: ${loanPayment.loanName}`,
        amount: loanPayment.amount,
        type: 'expense',
      };
      
      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);

      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();

      const newTransaction = {
        id: Date.now(),
        date: new Date(),
        description: description,
        amount: amount,
        type: type,
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      setDescription('');
      setAmount('');
      setType('expense');
    }

   
  return (
    <>
      <div className="App">
        <div className="finance-summary">
          <h2 className='summary-header'>Summary</h2>
          <div className="summary-cards">
            <div className="summary-card income">
              <h3>Total Income</h3>
              <p className="amount">+₹{totalIncome.toFixed(2)}</p>
            </div>
            
            <div className="summary-card expense">
              <h3>Total Expenses</h3>
              <p className="amount">₹{totalExpense.toFixed(2)}</p>
            </div>
            
            <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
              <h3>Balance</h3>
              <p className="amount">₹{balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="navigation-buttons">
          <button 
            className={`nav-btn ${!showLoans ? 'active' : ''}`} 
            onClick={() => setShowLoans(false)}
          >
            Transactions
          </button>
          <button 
            className={`nav-btn ${showLoans ? 'active' : ''}`} 
            onClick={() => setShowLoans(true)}
          >
            Loan Management
          </button>
        </div>
        
        {!showLoans ? (
          <>
            <div className="container">
              <div className='header'>
                <h4>Add Your Transactions</h4>
              </div>
              <div className="form-data">
                <form onSubmit={handleSubmit}>
                  <label htmlFor="description">Description</label>
                  <input 
                    type="text" 
                    placeholder="Enter Transaction" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                  />
                  <label htmlFor="amount">Amount</label>
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                  />
                  <label htmlFor="type">Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <button className='add-trans-btn'>Add Transaction</button>
                </form>
              </div>
            </div>

            <div className='table-data'>
              <h4 className='trans-heading'>Transaction History</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.id).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>₹{transaction.amount}</td>
                      <td>{transaction.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Loan 
            balance={balance} 
            updateTransactions={updateTransactionsFromLoan} 
          />
        )}
      </div>
    </>
  );
}

export default Transactions