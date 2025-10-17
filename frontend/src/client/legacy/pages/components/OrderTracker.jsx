import React from 'react';

const OrderTracker = ({ status }) => {
  const statuses = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = statuses.indexOf(status);

  // A helper to determine the CSS class for each step in the tracker
  const getStatusClass = (stepIndex) => {
    if (stepIndex < currentStatusIndex) {
      return 'completed'; // Green for past steps
    } else if (stepIndex === currentStatusIndex) {
      return 'active'; // Orange for the current step
    } else {
      return 'pending'; // Gray for future steps
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Track Your Order</h2>
      <div className="flex justify-between items-center w-full">
        {statuses.map((step, index) => (
          <React.Fragment key={step}>
            <div className={`step ${getStatusClass(index)}`}>
              <div className="step-icon">
                {/* Icons for each step */}
                {step === 'Confirmed' && '📝'}
                {step === 'Preparing' && '👨‍🍳'}
                {step === 'Out for Delivery' && '🛵'}
                {step === 'Delivered' && '🏠'}
              </div>
              <p className="step-label">{step}</p>
            </div>
            {/* Render a progress bar line between steps */}
            {index < statuses.length - 1 && (
              <div className={`progress-bar ${getStatusClass(index)}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Basic CSS for the tracker component */}
      <style>{`
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 80px;
        }
        .step-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
          border: 3px solid;
        }
        .step-label {
          margin-top: 8px;
          font-semibold: 14px;
          transition: all 0.3s ease;
        }
        .progress-bar {
          flex-grow: 1;
          height: 5px;
          transition: background-color 0.3s ease;
        }
        
        /* Color styles based on status */
        .step.completed .step-icon, .progress-bar.completed {
          background-color: #10B981; /* Green */
          border-color: #10B981;
          color: white;
        }
        .step.active .step-icon {
          background-color: #F97316; /* Orange */
          border-color: #F97316;
          color: white;
        }
         .step.active .step-label {
          color: #F97316; /* Orange text */
        }
        .step.pending .step-icon {
          background-color: #F3F4F6; /* Gray */
          border-color: #D1D5DB;
          color: #6B7280;
        }
        .progress-bar.pending {
            background-color: #E5E7EB; /* Gray */
        }
      `}</style>
    </div>
  );
};

export default OrderTracker;