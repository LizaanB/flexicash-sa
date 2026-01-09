import React, { useState, useEffect } from 'react';
import api from '../api';

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    branchCode: '',
    accountType: 'cheque'
  });
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

    // Validate bank details for debit order
    if (paymentMethod === 'debit_order' || paymentMethod === 'easypay') {
      if (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.branchCode) {
        setError('Please fill in all bank account details for debit order');
        return;
      }
    }

    try {
      const paymentData = {
        loanId: selectedLoan._id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        ...(paymentMethod === 'debit_order' || paymentMethod === 'easypay' ? { bankDetails } : {})
      };

      await api.post('/payments/make-payment', paymentData);
      
      if (paymentMethod === 'debit_order' || paymentMethod === 'easypay') {
        setSuccess('Debit order mandate created successfully! Payment will be processed within 1-2 business days.');
      } else {
        setSuccess('Payment recorded successfully!');
      }
      
      setPaymentAmount('');
      setSelectedLoan(null);
      setBankDetails({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        branchCode: '',
        accountType: 'cheque'
      });
      
      // Refresh loans and payments
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleApproveDebitOrder = async (loanId) => {
    setError('');
    setSuccess('');

    // Validate bank details
    if (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.branchCode) {
      setError('Please fill in all bank account details');
      return;
    }
    if (bankDetails.accountNumber.length < 8) {
      setError('Please enter a valid account number');
      return;
    }
    if (bankDetails.branchCode.length !== 6) {
      setError('Branch code must be 6 digits');
      return;
    }

    try {
      await api.put(`/loans/${loanId}/approve-debit-order`, { bankDetails });
      
      setSuccess('✓ DebiCheck mandate approved! Automatic debits will start on the scheduled date.');
      setBankDetails({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        branchCode: '',
        accountType: 'cheque'
      });
      setSelectedLoan(null);
      
      // Refresh loans
      fetchLoans();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve debit order');
      setTimeout(() => setError(''), 5000);
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

                {/* Pending DebiCheck Approval */}
                {loan.debitOrder?.status === 'pending_approval' && (
                  <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #fbbf24' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#92400e' }}>
                      🏦 DebiCheck Approval Required
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1rem' }}>
                      Your lender has requested to set up a debit order mandate for <strong>R{loan.debitOrder.amount?.toFixed(2)}</strong> per month.
                      Please provide your bank details to authorize this debit order.
                    </p>
                    
                    <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: '#1e40af' }}>
                        Bank Account Details
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Account Holder Name</label>
                          <input
                            type="text"
                            value={bankDetails.accountHolder}
                            onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                            placeholder="Full name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Account Number</label>
                          <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                            placeholder="Account number"
                          />
                        </div>
                        <div className="form-group">
                          <label>Bank Name</label>
                          <select
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                          >
                            <option value="">Select Bank</option>
                            <option value="ABSA">ABSA</option>
                            <option value="Standard Bank">Standard Bank</option>
                            <option value="FNB">FNB</option>
                            <option value="Nedbank">Nedbank</option>
                            <option value="Capitec">Capitec</option>
                            <option value="African Bank">African Bank</option>
                            <option value="TymeBank">TymeBank</option>
                            <option value="Discovery Bank">Discovery Bank</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Branch Code</label>
                          <input
                            type="text"
                            value={bankDetails.branchCode}
                            onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                            placeholder="6-digit code"
                            maxLength="6"
                          />
                        </div>
                        <div className="form-group">
                          <label>Account Type</label>
                          <select
                            value={bankDetails.accountType}
                            onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
                          >
                            <option value="cheque">Cheque/Current</option>
                            <option value="savings">Savings</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '4px', marginTop: '1rem', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#78350f' }}>
                        ⚠️ <strong>Authorization:</strong> By approving, you authorize automatic monthly debits of <strong>R{loan.debitOrder.amount?.toFixed(2)}</strong> from your account until the loan is fully paid.
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApproveDebitOrder(loan._id)}
                      >
                        ✓ Approve DebiCheck
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setBankDetails({
                            accountHolder: '',
                            accountNumber: '',
                            bankName: '',
                            branchCode: '',
                            accountType: 'cheque'
                          });
                        }}
                      >
                        Clear Form
                      </button>
                    </div>
                  </div>
                )}

                {/* Active DebiCheck Status */}
                {(loan.debitOrder?.status === 'approved' || loan.debitOrder?.status === 'active') && (
                  <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #10b981' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#065f46' }}>
                      ✓ DebiCheck Active
                    </h4>
                    <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                      <p>Monthly Debit: <strong>R{loan.debitOrder.amount?.toFixed(2)}</strong></p>
                      <p>Bank: {loan.debitOrder.bankDetails?.bankName}</p>
                      <p>Account: ****{loan.debitOrder.bankDetails?.accountNumber?.slice(-4)}</p>
                      <p>Next Debit: {loan.debitOrder.nextDebitDate ? new Date(loan.debitOrder.nextDebitDate).toLocaleDateString() : 'Pending'}</p>
                    </div>
                  </div>
                )}

                {selectedLoan?._id === loan._id ? (
                  <form onSubmit={handleMakePayment} style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Make Payment</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: (paymentMethod === 'easypay' || paymentMethod === 'debit_order') ? '1rem' : '0' }}>
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
                          onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setError('');
                          }}
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="card">Card</option>
                          <option value="easypay">🏦 EasyPay Debit Order</option>
                          <option value="debit_order">Debit Order</option>
                        </select>
                      </div>
                      {(paymentMethod !== 'easypay' && paymentMethod !== 'debit_order') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="submit" className="btn btn-success">Submit Payment</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bank Details for Debit Order */}
                    {(paymentMethod === 'easypay' || paymentMethod === 'debit_order') && (
                      <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #93c5fd' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: '#1e40af' }}>
                          🏦 Bank Account Details for Debit Order
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label>Account Holder Name</label>
                            <input
                              type="text"
                              value={bankDetails.accountHolder}
                              onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                              placeholder="Full name"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Account Number</label>
                            <input
                              type="text"
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                              placeholder="Account number"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Bank Name</label>
                            <select
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                              required
                            >
                              <option value="">Select Bank</option>
                              <option value="ABSA">ABSA</option>
                              <option value="Standard Bank">Standard Bank</option>
                              <option value="FNB">FNB</option>
                              <option value="Nedbank">Nedbank</option>
                              <option value="Capitec">Capitec</option>
                              <option value="African Bank">African Bank</option>
                              <option value="TymeBank">TymeBank</option>
                              <option value="Discovery Bank">Discovery Bank</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Branch Code</label>
                            <input
                              type="text"
                              value={bankDetails.branchCode}
                              onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                              placeholder="6-digit code"
                              maxLength="6"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Account Type</label>
                            <select
                              value={bankDetails.accountType}
                              onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
                              required
                            >
                              <option value="cheque">Cheque/Current</option>
                              <option value="savings">Savings</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '4px', marginTop: '1rem' }}>
                          <p style={{ fontSize: '0.75rem', color: '#78350f', marginBottom: '0.5rem' }}>
                            ⚠️ <strong>Debit Order Authorization</strong>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#78350f' }}>
                            By submitting, you authorize {paymentMethod === 'easypay' ? 'EasyPay' : 'us'} to deduct <strong>R{paymentAmount || loan.monthlyPayment.toFixed(2)}</strong> from your account on the due date.
                          </p>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === 'easypay' || paymentMethod === 'debit_order') && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-success">✓ Authorize Debit Order</button>
                        <button type="button" className="btn btn-secondary" onClick={() => {
                          setSelectedLoan(null);
                          setBankDetails({
                            accountHolder: '',
                            accountNumber: '',
                            bankName: '',
                            branchCode: '',
                            accountType: 'cheque'
                          });
                        }}>
                          Cancel
                        </button>
                      </div>
                    )}
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
