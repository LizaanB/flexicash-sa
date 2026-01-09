import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingLoanId, setRejectingLoanId] = useState(null);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [editReason, setEditReason] = useState('');
  const [debitOrderLoanId, setDebitOrderLoanId] = useState(null);
  const [debitOrderAmount, setDebitOrderAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const loansQuery = filter === 'all' ? '' : `?status=${filter}`;
      const [loansRes, paymentsRes] = await Promise.all([
        api.get(`/loans/all${loansQuery}`),
        api.get('/payments/all')
      ]);
      
      setLoans(loansRes.data.data);
      setPayments(paymentsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      await api.put(`/loans/${loanId}/approve`);
      setSuccess('Loan approved successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve loan');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (loanId) => {
    try {
      await api.put(`/loans/${loanId}/reject`, { reason: rejectionReason });
      setSuccess('Loan rejected');
      setRejectingLoanId(null);
      setRejectionReason('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject loan');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDisburse = async (loanId) => {
    try {
      await api.put(`/loans/${loanId}/disburse`);
      setSuccess('Loan marked as disbursed');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disburse loan');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateAmount = async (loanId) => {
    try {
      if (!editedAmount || editedAmount < 100 || editedAmount > 5000) {
        setError('Please enter a valid amount between R100 and R5,000');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      await api.put(`/loans/${loanId}/update-amount`, { 
        amount: editedAmount,
        reason: editReason 
      });
      
      setSuccess(`Loan amount updated to R${parseFloat(editedAmount).toLocaleString()}`);
      setEditingLoanId(null);
      setEditedAmount('');
      setEditReason('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update loan amount');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInitiateDebitOrder = async (loanId) => {
    try {
      if (!debitOrderAmount || debitOrderAmount < 100) {
        setError('Please enter a valid debit order amount');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      await api.post(`/loans/${loanId}/initiate-debit-order`, { 
        amount: parseFloat(debitOrderAmount)
      });
      
      setSuccess('DebiCheck request sent to customer for approval!');
      setDebitOrderLoanId(null);
      setDebitOrderAmount('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate debit order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelDebitOrder = async (loanId) => {
    try {
      await api.put(`/loans/${loanId}/cancel-debit-order`);
      setSuccess('Debit order cancelled');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel debit order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      disbursed: 'status-disbursed',
      completed: 'status-completed',
      confirmed: 'status-approved'
    };
    return classes[status] || '';
  };

  const stats = {
    pending: loans.filter(l => l.status === 'pending').length,
    approved: loans.filter(l => l.status === 'approved').length,
    disbursed: loans.filter(l => l.status === 'disbursed').length,
    totalDisbursed: loans.filter(l => l.status === 'disbursed' || l.status === 'completed')
      .reduce((sum, l) => sum + l.amount, 0),
    totalRepaid: loans.reduce((sum, l) => sum + l.amountPaid, 0),
    totalOutstanding: loans.filter(l => l.status === 'disbursed')
      .reduce((sum, l) => sum + l.remainingAmount, 0)
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h2>Admin Dashboard</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Applications</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Approved Loans</h3>
          <p>{stats.approved}</p>
        </div>
        <div className="stat-card">
          <h3>Active Loans</h3>
          <p>{stats.disbursed}</p>
        </div>
        <div className="stat-card">
          <h3>Total Disbursed</h3>
          <p>R{stats.totalDisbursed.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Repaid</h3>
          <p style={{ color: '#10b981' }}>R{stats.totalRepaid.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Outstanding</h3>
          <p style={{ color: '#ef4444' }}>R{stats.totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All Loans
        </button>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({stats.approved})
        </button>
        <button 
          className={`btn ${filter === 'disbursed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('disbursed')}
        >
          Active ({stats.disbursed})
        </button>
      </div>

      {/* Loans Table */}
      <h3 style={{ marginBottom: '1rem' }}>Loan Applications</h3>
      {loans.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No loans found</p>
        </div>
      ) : (
        <div style={{ marginBottom: '3rem' }}>
          {loans.map(loan => (
            <div key={loan._id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{loan.customer?.name || 'Unknown'}</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {loan.customer?.email} | {loan.customer?.phone}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Applied: {new Date(loan.createdAt).toLocaleDateString()}
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
                {loan.status === 'disbursed' && (
                  <>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Amount Paid</p>
                      <p style={{ fontWeight: '600', color: '#10b981' }}>R{loan.amountPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Remaining</p>
                      <p style={{ fontWeight: '600', color: '#ef4444' }}>R{loan.remainingAmount.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>

              {loan.purpose && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Purpose:</p>
                  <p style={{ fontSize: '0.875rem' }}>{loan.purpose}</p>
                </div>
              )}

              {loan.customer?.address && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Address: {loan.customer.address}</p>
                </div>
              )}

              {loan.bankStatements && loan.bankStatements.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>Bank Statements:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {loan.bankStatements.map((statement, index) => {
                      const fileUrl = `http://localhost:5000/uploads/bank-statements/${statement.filename}`;
                      console.log('Bank statement URL:', fileUrl);
                      return (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '0.875rem', 
                            color: '#0891b2',
                            textDecoration: 'none',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          📄 {statement.originalName || `Statement ${index + 1}`}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {loan.status === 'pending' && (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  {console.log('Rendering pending loan actions for loan:', loan._id, 'Status:', loan.status)}
                  {editingLoanId === loan._id ? (
                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#92400e' }}>Edit Loan Amount</h4>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#6b7280' }}>New Amount (R)</label>
                        <input
                          type="number"
                          placeholder="Enter new amount"
                          value={editedAmount}
                          onChange={(e) => setEditedAmount(e.target.value)}
                          min="100"
                          max="5000"
                          step="100"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                        <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>Original: R{loan.amount.toLocaleString()} | Range: R100 - R5,000</small>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#6b7280' }}>Reason for Change</label>
                        <input
                          type="text"
                          placeholder="e.g., Approved for lower amount based on affordability"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleUpdateAmount(loan._id)}
                        >
                          Update Amount
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingLoanId(null);
                            setEditedAmount('');
                            setEditReason('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : rejectingLoanId === loan._id ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <input
                        type="text"
                        placeholder="Reason for rejection"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleReject(loan._id)}
                        >
                          Confirm Reject
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setRejectingLoanId(null);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  
                  {!editingLoanId && !rejectingLoanId && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(loan._id)}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn btn-primary"
                        style={{ backgroundColor: '#f59e0b' }}
                        onClick={() => {
                          setEditingLoanId(loan._id);
                          setEditedAmount(loan.amount);
                        }}
                      >
                        ✏️ Edit Amount
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => setRejectingLoanId(loan._id)}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {loan.status === 'approved' && (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDisburse(loan._id)}
                  >
                    Mark as Disbursed (Funds Paid)
                  </button>
                </div>
              )}

              {/* Debit Order Management for Disbursed Loans */}
              {loan.status === 'disbursed' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#374151' }}>
                    💳 DebiCheck / Debit Order Management
                  </h4>
                  
                  {loan.debitOrder?.status === 'none' || !loan.debitOrder ? (
                    debitOrderLoanId === loan._id ? (
                      <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#1e40af' }}>
                          Monthly Debit Order Amount (R)
                        </label>
                        <input
                          type="number"
                          value={debitOrderAmount}
                          onChange={(e) => setDebitOrderAmount(e.target.value)}
                          placeholder={`Suggested: R${loan.monthlyPayment.toFixed(2)}`}
                          min="100"
                          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleInitiateDebitOrder(loan._id)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            📤 Send DebiCheck Request to Customer
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => {
                              setDebitOrderLoanId(null);
                              setDebitOrderAmount('');
                            }}
                            style={{ fontSize: '0.875rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                          Customer will receive a notification to approve the debit order and provide their bank details.
                        </p>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setDebitOrderLoanId(loan._id);
                          setDebitOrderAmount(loan.monthlyPayment.toFixed(2));
                        }}
                        style={{ fontSize: '0.875rem', backgroundColor: '#3b82f6' }}
                      >
                        🏦 Set Up DebiCheck
                      </button>
                    )
                  ) : loan.debitOrder.status === 'pending_approval' ? (
                    <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '4px', border: '1px solid #fbbf24' }}>
                      <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>
                        ⏳ <strong>Awaiting Customer Approval</strong>
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                        DebiCheck request sent on {new Date(loan.debitOrder.requestedAt).toLocaleDateString()}. 
                        Customer needs to approve and provide bank details.
                      </p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleCancelDebitOrder(loan._id)}
                        style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  ) : loan.debitOrder.status === 'approved' || loan.debitOrder.status === 'active' ? (
                    <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '4px', border: '1px solid #10b981' }}>
                      <p style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>
                        ✓ <strong>DebiCheck Active</strong>
                      </p>
                      <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                        <p>Amount: <strong>R{loan.debitOrder.amount?.toLocaleString()}</strong> {loan.debitOrder.frequency}</p>
                        <p>Bank: {loan.debitOrder.bankDetails?.bankName}</p>
                        <p>Account: ****{loan.debitOrder.bankDetails?.accountNumber?.slice(-4)}</p>
                        <p>Next Debit: {loan.debitOrder.nextDebitDate ? new Date(loan.debitOrder.nextDebitDate).toLocaleDateString() : 'Pending'}</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                          Approved: {new Date(loan.debitOrder.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleCancelDebitOrder(loan._id)}
                        style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}
                      >
                        Cancel DebiCheck
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {loan.status === 'rejected' && loan.rejectionReason && (
                <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <strong>Rejection Reason:</strong> {loan.rejectionReason}
                </div>
              )}

              {loan.approvedBy && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {loan.status === 'rejected' ? 'Rejected' : 'Approved'} by {loan.approvedBy.name} on {new Date(loan.approvedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Payments */}
      <h3 style={{ marginBottom: '1rem' }}>Recent Payments</h3>
      {payments.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No payments yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Loan Amount</th>
                <th>Payment Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 10).map(payment => (
                <tr key={payment._id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>{payment.customer?.name || 'Unknown'}</td>
                  <td>R{payment.loan?.amount?.toLocaleString() || 'N/A'}</td>
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
      )}
    </div>
  );
}

export default AdminDashboard;
