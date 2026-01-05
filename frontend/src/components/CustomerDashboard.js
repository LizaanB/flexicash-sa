import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function CustomerDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans/my-loans');
      setLoans(response.data.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      disbursed: 'status-disbursed',
      completed: 'status-completed'
    };
    return classes[status] || '';
  };

  const activeLoan = loans.find(loan => loan.status === 'disbursed');
  const totalBorrowed = loans
    .filter(loan => loan.status === 'disbursed' || loan.status === 'completed')
    .reduce((sum, loan) => sum + loan.amount, 0);
  const totalRepaid = loans.reduce((sum, loan) => sum + loan.amountPaid, 0);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem', marginTop: '2rem' }}>Customer Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Loans</h3>
          <p>{loans.filter(l => l.status === 'disbursed').length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Borrowed</h3>
          <p>R{totalBorrowed.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Repaid</h3>
          <p>R{totalRepaid.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Applications</h3>
          <p>{loans.filter(l => l.status === 'pending').length}</p>
        </div>
      </div>

      {activeLoan && (
        <div className="card">
          <h3>Active Loan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loan Amount</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem' }}>R{activeLoan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total to Repay</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem' }}>R{activeLoan.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Amount Paid</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem', color: '#10b981' }}>R{activeLoan.amountPaid.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Remaining</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem', color: '#ef4444' }}>R{activeLoan.remainingAmount.toLocaleString()}</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/my-loans" className="btn btn-primary">Make Payment</Link>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Recent Loan Applications</h3>
        <Link to="/apply" className="btn btn-primary">Apply for New Loan</Link>
      </div>

      {loans.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            No loan applications yet. <Link to="/apply">Apply for your first loan</Link>
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Duration</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Monthly Payment</th>
              </tr>
            </thead>
            <tbody>
              {loans.slice(0, 5).map(loan => (
                <tr key={loan._id}>
                  <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td>R{loan.amount.toLocaleString()}</td>
                  <td>{loan.duration} months</td>
                  <td>R{loan.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(loan.status)}`}>
                      {loan.status.toUpperCase()}
                    </span>
                  </td>
                  <td>R{loan.monthlyPayment.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
