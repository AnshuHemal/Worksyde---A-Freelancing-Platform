import React, { useState } from 'react';
import axios from 'axios';

// Predefined ban reasons
const BAN_REASONS = [
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'spam_violation', label: 'Spam or Violation of Terms' },
  { value: 'fake_profile', label: 'Fake Profile or Identity' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'fraudulent_activity', label: 'Fraudulent Activity' },
  { value: 'multiple_violations', label: 'Multiple Policy Violations' },
  { value: 'security_concern', label: 'Security Concern' },
  { value: 'other', label: 'Other (Please specify)' }
];

const BanModal = ({ 
  isOpen, 
  onClose, 
  user, 
  action, // 'ban' or 'unban'
  onSuccess 
}) => {
  const [selectedBanReason, setSelectedBanReason] = useState('');
  const [customBanReason, setCustomBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = "http://localhost:5000/api/admin/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (action === 'ban' && !selectedBanReason) {
      setError('Please select a reason for banning this user');
      return;
    }

    if (action === 'ban' && selectedBanReason === 'other' && !customBanReason.trim()) {
      setError('Please provide a custom reason for banning this user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = action === 'ban' ? 'ban-user/' : 'unban-user/';
      const data = {
        userId: user._id,
        ...(action === 'ban' && { 
          banReason: selectedBanReason === 'other' ? customBanReason.trim() : selectedBanReason 
        })
      };

      const response = await axios.post(`${API_URL}/${endpoint}`, data, {
        withCredentials: true
      });

      if (response.data.success) {
        onSuccess(response.data.message, response.data.user);
        onClose();
        setBanReason('');
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      setError(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedBanReason('');
      setCustomBanReason('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isBanAction = action === 'ban';
  const modalTitle = isBanAction ? 'Ban User' : 'Unban User';
  const actionButtonText = isBanAction ? 'Ban User' : 'Unban User';
  const actionButtonClass = isBanAction ? 'btn-danger' : 'btn-success';

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }} 
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 10001 }}>
        <div 
          className="modal-content" 
          style={{ position: 'relative', zIndex: 10001 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h5 className="modal-title">
              {isBanAction ? '🚫 Ban User' : '✅ Unban User'}
            </h5>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <h6>User Details:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Role:</strong> 
                      <span className={`badge ms-2 ${
                        user?.role === 'superadmin' ? 'bg-danger' : 
                        user?.role === 'admin' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {user?.role}
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        user?.isBanned ? 'bg-danger' : 'bg-success'
                      }`}>
                        {user?.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {isBanAction && (
                <div className="mb-3">
                  <label htmlFor="banReason" className="form-label">
                    <strong>Reason for Banning:</strong>
                  </label>
                  <select
                    id="banReason"
                    className="form-select"
                    value={selectedBanReason}
                    onChange={(e) => {
                      setSelectedBanReason(e.target.value);
                      if (e.target.value !== 'other') {
                        setCustomBanReason('');
                      }
                      if (error) setError('');
                    }}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a reason...</option>
                    {BAN_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  
                  {selectedBanReason === 'other' && (
                    <div className="mt-3">
                      <label htmlFor="customBanReason" className="form-label">
                        <strong>Custom Reason:</strong>
                      </label>
                      <textarea
                        id="customBanReason"
                        className="form-control"
                        rows="3"
                        placeholder="Please provide a custom reason for banning this user..."
                        value={customBanReason}
                        onChange={(e) => {
                          setCustomBanReason(e.target.value);
                          if (error) setError('');
                        }}
                        required
                        disabled={loading}
                      />
                    </div>
                  )}
                  
                  <div className="form-text mt-2">
                    This reason will be recorded and may be shared with the user.
                  </div>
                </div>
              )}

              {!isBanAction && (
                <div className="mb-3">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> Unbanning this user will restore their account access immediately.
                    {user?.banReason && (
                      <div className="mt-2">
                        <strong>Previous ban reason:</strong> {user.banReason}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer d-flex justify-content-end">
              <button
                type="button"
                className="post-button"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`login-button border-0 ${actionButtonClass}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  actionButtonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      ></div>
    </div>
  );
};

export default BanModal; 