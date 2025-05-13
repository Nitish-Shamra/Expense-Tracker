import React, { useState, useEffect } from 'react';
import './Loan.css'; // Import your CSS file for styling

function Loan({ balance, updateTransactions }) {
  // State for loans and form inputs
  const [loans, setLoans] = useState([]);
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [installments, setInstallments] = useState('');
  
  // State for editing
  const [editIndex, setEditIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Load loans from localStorage on component mount
  useEffect(() => {
    const storedLoans = JSON.parse(
      localStorage.getItem("loans") || "[]"
    );
    setLoans(storedLoans);
  }, []);

  // Calculate monthly payment
  const calculateMonthlyPayment = (principal, interest, months) => {
    const monthlyRate = interest / 100 / 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    ).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLoan = {
      name: loanName,
      amount: parseFloat(loanAmount),
      interestRate: parseFloat(interestRate),
      startDate: startDate,
      installments: parseInt(installments),
      monthlyPayment: calculateMonthlyPayment(
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(installments)
      ),
      paidInstallments: 0,
      nextPaymentDate: calculateNextPaymentDate(startDate, 0)
    };

    let updatedLoans;
    
    if (editIndex !== null) {
      // Update existing loan
      updatedLoans = [...loans];
      updatedLoans[editIndex] = newLoan;
      setEditIndex(null);
    } else {
      // Add new loan
      updatedLoans = [...loans, newLoan];
    }
    
    setLoans(updatedLoans);
    localStorage.setItem('loans', JSON.stringify(updatedLoans));
     
    // Reset form
    setLoanName('');
    setLoanAmount('');
    setInterestRate('');
    setStartDate('');
    setInstallments('');
    setShowAddForm(false);
  };

  // Calculate next payment date
  const calculateNextPaymentDate = (startDate, paidInstallments) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + paidInstallments + 1);
    return date.toISOString().split('T')[0];
  };

  // Handle loan payment
  const handlePayment = (index) => {
    const loan = loans[index];
    const paymentAmount = parseFloat(loan.monthlyPayment);
    
    // Check if there's enough balance to make the payment
    if (balance < paymentAmount) {
      setError(`Insufficient balance to make this payment. You need ₹${paymentAmount} but your balance is ₹${balance.toFixed(2)}.`);
      return;
    }
    
    setError(''); // Clear any previous errors
    
    const updatedLoans = [...loans];
    
    if (loan.paidInstallments < loan.installments) {
      loan.paidInstallments += 1;
      loan.nextPaymentDate = calculateNextPaymentDate(loan.startDate, loan.paidInstallments);
      setLoans(updatedLoans);
      
      // Save the updated loans to localStorage
      localStorage.setItem('loans', JSON.stringify(updatedLoans));
      
      // Update transactions in parent component
      updateTransactions({
        loanName: loan.name,
        amount: paymentAmount
      });
    }
  };

  // Handle loan deletion
  const handleDelete = (index) => {
    const updatedLoans = loans.filter((_, i) => i !== index);
    setLoans(updatedLoans);
    
    // Save the updated loans to localStorage
    localStorage.setItem('loans', JSON.stringify(updatedLoans));
  };

  // Handle loan editing
  const handleEdit = (index) => {
    const loan = loans[index];
    setLoanName(loan.name);
    setLoanAmount(loan.amount.toString());
    setInterestRate(loan.interestRate.toString());
    setStartDate(loan.startDate);
    setInstallments(loan.installments.toString());
    setEditIndex(index);
    setShowAddForm(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const totalLoan = loans
  .reduce((total, loan) => total + parseFloat(loan.amount), 0);
     

  return (
    <div className="loan-container">
      <header>
        <h1>Loan Management</h1>
        <div>
          <h3>Total Loan:<span>{totalLoan}</span></h3>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="content">
        <div className="action-buttons">
          <button 
            className="add-loan-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) {
                setEditIndex(null);
                setLoanName('');
                setLoanAmount('');
                setInterestRate('');
                setStartDate('');
                setInstallments('');
                setError('');
              }
            }}
          >
            {showAddForm ? 'Cancel' : 'Add New Loan'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="form-container">
            <h2>{editIndex !== null ? 'Edit Loan' : 'Add New Loan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="loanName">Loan Name</label>
                <input
                  type="text"
                  id="loanName"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="loanAmount">Loan Amount (₹)</label>
                <input
                  type="number"
                  id="loanAmount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="interestRate">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  id="interestRate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="installments">Number of Installments</label>
                <input
                  type="number"
                  id="installments"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="submit-btn">
                {editIndex !== null ? 'Update Loan' : 'Add Loan'}
              </button>
            </form>
          </div>
        )}
        
        {loans.length > 0 ? (
          <div className="loans-container">
            <h2>Your Loans</h2>
            {loans.map((loan, index) => (
              <div className="loan-card" key={index}>
                <div className="loan-header">
                  <h3>{loan.name}</h3>
                  <div className="loan-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="loan-details">
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">₹{loan.amount}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Interest Rate:</span>
                    <span className="detail-value">{loan.interestRate}%</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(loan.startDate)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Monthly Payment:</span>
                    <span className="detail-value">₹{loan.monthlyPayment}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Progress:</span>
                    <span className="detail-value">
                      {loan.paidInstallments} of {loan.installments} installments
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Next Payment:</span>
                    <span className="detail-value">
                      {loan.paidInstallments < loan.installments 
                        ? formatDate(loan.nextPaymentDate)
                        : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${(loan.paidInstallments / loan.installments) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="loan-footer">
                  {loan.paidInstallments < loan.installments && (
                    <button 
                      className="payment-btn"
                      onClick={() => handlePayment(index)}
                      disabled={balance < parseFloat(loan.monthlyPayment)}
                    >
                     Pay Installment (₹{loan.monthlyPayment})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-loans">
            <p>No loans added yet. Click "Add New Loan" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Loan;