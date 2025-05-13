import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <h1>About Expense Tracker</h1>
      <p>
        This Expense Tracker is a personal finance management tool that helps you
        monitor your income, expenses, and loan repayments. It is built with React.js
        and stores your data locally in your browser.
      </p>
      <p>
        Features include:
        <ul>
          <li>Adding and categorizing transactions</li>
          <li>Loan management with monthly installment tracking</li>
          <li>Real-time balance calculation</li>
          <li>Simple and intuitive interface</li>
        </ul>
      </p>
      <p>
        This project was created for educational and personal budgeting purposes.
      </p>
    </div>
  );
}

export default About;
