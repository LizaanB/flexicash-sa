import React, { useState, useEffect } from 'react';
import api from '../api';

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans/my-loans');
      setLoans(response.data.data);
      
      // Fetch payments for each loan
      for (const loan of response.data.data) {
        fetchPayments(loan._id);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}`);
      setPayments(prev => ({
        ...prev,
        [loanId]: response.data.data
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/payments/make-payment', {
        loanId: selectedLoan._id,
        amount: parseFloat(paymentAmount),
        paymentMethod
      });
      
      setSuccess('Payment recorded successfully!');
      setPaymentAmount('');
      setSelectedLoan(null);
      
      // Refresh loans and payments
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h2>My Loans</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loans.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No loans found</p>
        </div>
      ) : (
        loans.map(loan => (
          <div key={loan._id} className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3>Loan Application</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Applied on {new Date(loan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`status-badge ${getStatusClass(loan.status)}`}>
                {loan.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loan Amount</p>
                <p style={{ fontWeight: '600' }}>R{loan.amount.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Duration</p>
                <p style={{ fontWeight: '600' }}>{loan.duration} months</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Amount</p>
                <p style={{ fontWeight: '600' }}>R{loan.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Monthly Payment</p>
                <p style={{ fontWeight: '600' }}>R{loan.monthlyPayment.toFixed(2)}</p>
              </div>
            </div>

            {loan.status === 'disbursed' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Amount Paid</p>
                    <p style={{ fontWeight: '600', color: '#10b981' }}>R{loan.amountPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Remaining</p>
                    <p style={{ fontWeight: '600', color: '#ef4444' }}>R{loan.remainingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Due Date</p>
                    <p style={{ fontWeight: '600' }}>{new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Progress</p>
                    <p style={{ fontWeight: '600' }}>
                      {((loan.amountPaid / loan.totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {selectedLoan?._id === loan._id ? (
                  <form onSubmit={handleMakePayment} style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Make Payment</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Amount</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          required
                          min="1"
                          max={loan.remainingAmount}
                          step="0.01"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="card">Card</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-success">Submit Payment</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setSelectedLoan(loan)}
                    style={{ marginTop: '1rem' }}
                  >
                    Make Payment
                  </button>
                )}

                {/* Payment History */}
                {payments[loan._id] && payments[loan._id].length > 0 && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Payment History</h4>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments[loan._id].map(payment => (
                            <tr key={payment._id}>
                              <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                              <td>R{payment.amount.toLocaleString()}</td>
                              <td>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                              <td>
                                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                  {payment.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {loan.status === 'rejected' && loan.rejectionReason && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <strong>Rejection Reason:</strong> {loan.rejectionReason}
              </div>
            )}

            {loan.purpose && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Purpose</p>
                <p>{loan.purpose}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyLoans;
