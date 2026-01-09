import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';

function LoanApplication() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    duration: '1',
    purpose: ''
  });
  const [bankStatements, setBankStatements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  
  // Check for existing applications on mount
  useEffect(() => {
    checkExistingLoans();
  }, []);
  
  const checkExistingLoans = async () => {
    try {
      const response = await api.get('/loans/my-loans');
      const loans = response.data.data;
      const activeLoan = loans.find(loan => 
        ['pending', 'approved'].includes(loan.status)
      );
      
      if (activeLoan) {
        setHasActiveApplication(true);
        setError(`You already have a ${activeLoan.status} loan application. Please check "My Loans" page or wait for admin to process it.`);
      }
    } catch (err) {
      console.error('Error checking loans:', err);
    }
  };

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
      e.target.value = ''; // Reset the input
      return;
    }
    
    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max size is 5MB per file.`);
      e.target.value = ''; // Reset the input
      return;
    }
    
    setBankStatements(files);
    setError('');
    console.log('Files selected:', files.map(f => f.name));
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
    e.stopPropagation();
    
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('User:', user);
    console.log('Form data:', formData);
    console.log('Bank statements:', bankStatements);
    console.log('Token:', localStorage.getItem('token'));
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Check user role
    if (user && user.role !== 'customer') {
      setError('Only customers can apply for loans');
      setLoading(false);
      return;
    }

    if (bankStatements.length === 0) {
      setError('Please upload at least one bank statement');
      setLoading(false);
      return;
    }
    
    // Validate amount
    if (!formData.amount || formData.amount < 100 || formData.amount > 5000) {
      setError('Please enter a valid loan amount between R100 and R5,000');
      setLoading(false);
      return;
    }

    try {
      console.log('Preparing form data...');
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('purpose', formData.purpose);
      
      // Append bank statements
      bankStatements.forEach((file, index) => {
        console.log(`Appending file ${index + 1}:`, file.name, file.size, 'bytes');
        formDataToSend.append('bankStatements', file);
      });

      console.log('Sending request to /loans/apply...');
      console.log('API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/loans/apply', formDataToSend);
      
      console.log('=== SUBMISSION SUCCESSFUL ===');
      console.log('Response:', response.data);
      
      // Don't redirect immediately - show success message first
      setSuccess('Loan application submitted successfully! Redirecting in 2 seconds...');
      
      // Reset form
      setFormData({
        amount: '',
        duration: '1',
        purpose: ''
      });
      setBankStatements([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        navigate('/my-loans');
      }, 2000);
    } catch (err) {
      console.error('=== SUBMISSION FAILED ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error request:', err.request ? 'Request was made but no response' : 'No request made');
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (err.response) {
        // Server responded with error
        console.error('Server error response:', err.response.data);
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
        
        // Specific error messages
        if (err.response.status === 401) {
          errorMessage = 'You must be logged in to apply for a loan. Please login again.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid application data. Please check your inputs.';
        } else if (err.response.status === 413) {
          errorMessage = 'File(s) too large. Maximum total size is 10MB.';
        }
      } else if (err.request) {
        // Request made but no response
        console.error('No response from server');
        errorMessage = 'Cannot connect to server. Please check if the backend is running at http://localhost:5000';
      } else {
        // Error setting up request
        console.error('Request setup error:', err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Prevent any redirect - stay on the page to show error
      console.warn('Staying on page to display error');
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
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
              ref={fileInputRef}
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

          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading || hasActiveApplication}
            onClick={() => console.log('Button clicked!')}
          >
            {loading ? 'Submitting...' : hasActiveApplication ? 'You Have an Active Application' : 'Submit Application'}
          </button>
          
          {hasActiveApplication && (
            <p style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280' }}>
              Check your <Link to="/my-loans" style={{ color: '#0891b2' }}>My Loans</Link> page to view your application status.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoanApplication;
