import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoanApplication() {
  const [formData, setFormData] = useState({
    amount: '',
    duration: '1',
    purpose: ''
  });
  const [bankStatements, setBankStatements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('You can only upload up to 3 bank statements');
      return;
    }
    setBankStatements(files);
    setError('');
  };

  const calculateLoan = () => {
    if (formData.amount && formData.duration) {
      const amount = parseFloat(formData.amount);
      const interest = amount * 0.30; // 30% interest
      const total = amount + interest;
      const monthly = total / parseInt(formData.duration);
      return { total, monthly };
    }
    return null;
  };

  const loanCalc = calculateLoan();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (bankStatements.length === 0) {
      setError('Please upload at least one bank statement');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('purpose', formData.purpose);
      
      // Append bank statements
      bankStatements.forEach((file) => {
        formDataToSend.append('bankStatements', file);
      });

      await api.post('/loans/apply', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Loan application submitted successfully!');
      setTimeout(() => {
        navigate('/my-loans');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h2>Apply for Loan</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loan Amount (R)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="100"
              max="5000"
              step="100"
              placeholder="Enter amount (Max R5,000)"
            />
            <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
              Quick cash loans up to R5,000
            </small>
          </div>

          <div className="form-group">
            <label>Loan Duration (Months)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
            >
              <option value="1">1 month</option>
              <option value="2">2 months</option>
              <option value="3">3 months</option>
              <option value="4">4 months</option>
              <option value="5">5 months</option>
              <option value="6">6 months</option>
              <option value="7">7 months</option>
              <option value="8">8 months</option>
              <option value="9">9 months</option>
              <option value="10">10 months</option>
              <option value="11">11 months</option>
              <option value="12">12 months</option>
            </select>
          </div>

          <div className="form-group">
            <label>Purpose (Optional)</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows="3"
              placeholder="What will you use the loan for?"
            />
          </div>

          <div className="form-group">
            <label>Bank Statements (Last 3 Months) *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              required
            />
            <small style={{ color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>
              Upload 1-3 bank statements (PDF, JPG, PNG - Max 5MB each)
            </small>
            {bankStatements.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Selected files:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {bankStatements.map((file, index) => (
                    <li key={index} style={{ fontSize: '0.875rem' }}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {loanCalc && (
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Loan Summary ({formData.duration} Month{formData.duration > 1 ? 's' : ''} Term)</h4>
              <p><strong>Loan Amount:</strong> R{parseFloat(formData.amount).toLocaleString()}</p>
              <p><strong>Interest (30%):</strong> R{(parseFloat(formData.amount) * 0.30).toLocaleString()}</p>
              <p><strong>Total to Repay:</strong> R{loanCalc.total.toLocaleString()}</p>
              <p><strong>Monthly Payment:</strong> R{loanCalc.monthly.toFixed(2)}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoanApplication;
