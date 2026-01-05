import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1>� FlexiCash SA</h1>
        {user && (
          <nav>
            <Link to="/">Dashboard</Link>
            {user.role === 'customer' && (
              <>
                <Link to="/apply">Apply for Loan</Link>
                <Link to="/my-loans">My Loans</Link>
              </>
            )}
            <span style={{ opacity: 0.8 }}>
              {user.name} ({user.role})
            </span>
            <button onClick={logout}>Logout</button>
          </nav>
        )}
      </div>
    </div>
  );
}

export default Navbar;
