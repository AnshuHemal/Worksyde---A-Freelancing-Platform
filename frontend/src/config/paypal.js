// PayPal Configuration
export const PAYPAL_CONFIG = {
  // PayPal Sandbox Client ID (for testing)
  "client-id": "Afups2A6AknaMzjVclJQDgcwt16OMXewOpQ71Jwswp54zNi2vpe8-84jGj2at_WmMnn_knmzR4SHwl4Y",
  
  // Environment: 'sandbox' for testing, 'production' for live
  environment: "sandbox",
  
  // Currency settings - USD for PayPal compatibility
  currency: "USD",
  
  // Intent: 'capture' for immediate payment, 'authorize' for authorization only
  intent: "capture",
  
  // Disable funding sources that might cause issues
  "disable-funding": "venmo,paylater,card",
  
  // Additional options for compatibility
  locale: "en_US"
};

// PayPal Button Styles
export const PAYPAL_BUTTON_STYLES = {
  layout: "horizontal",
  color: "blue",
  shape: "rect",
  label: "pay",
  tagline: false,
  fundingSource: "paypal",  // Only show PayPal, not credit cards
  width: "100%"
};

// PayPal order creation options
export const createPayPalOrderOptions = (amount, description) => ({
  purchase_units: [
    {
      amount: {
        value: amount.toString(),
        currency_code: PAYPAL_CONFIG.currency,
      },
      description: description,
    },
  ],
  application_context: {
    shipping_preference: "NO_SHIPPING",
  },
}); 