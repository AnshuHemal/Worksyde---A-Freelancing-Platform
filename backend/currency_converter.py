"""
Currency Converter for PayPal Integration
Handles INR to USD conversion for PayPal payments
"""

import requests
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CurrencyConverter:
    """Handle currency conversion for PayPal payments"""
    
    # Default exchange rate (fallback if API fails)
    DEFAULT_INR_TO_USD_RATE = 0.012  # 1 INR = 0.012 USD (approximately)
    
    @staticmethod
    def get_exchange_rate(from_currency='INR', to_currency='USD'):
        """
        Get current exchange rate from a free API
        Returns rate as float (1 INR = X USD)
        """
        try:
            # Using exchangerate-api.com (free tier allows 1500 requests/month)
            # You can replace this with your preferred currency API
            api_key = getattr(settings, 'EXCHANGE_RATE_API_KEY', None)
            
            if api_key:
                url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency}/{to_currency}"
            else:
                # Use free API without key (limited requests)
                url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"

            
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                if api_key:
                    # Paid API response format
                    rate = data.get('conversion_rate')
                else:
                    # Free API response format
                    rates = data.get('rates', {})
                    rate = rates.get(to_currency)
                
                if rate:
                    logger.info(f"Exchange rate fetched: 1 {from_currency} = {rate} {to_currency}")
                    return float(rate)
            
        except Exception as e:
            logger.warning(f"Failed to fetch exchange rate: {e}")
        
        # Return default rate if API fails
        logger.info(f"Using default exchange rate: 1 {from_currency} = {CurrencyConverter.DEFAULT_INR_TO_USD_RATE} {to_currency}")
        return CurrencyConverter.DEFAULT_INR_TO_USD_RATE
    
    @staticmethod
    def convert_inr_to_usd(inr_amount):
        """
        Convert INR amount to USD
        Returns tuple: (usd_amount, exchange_rate_used)
        """
        try:
            # Get current exchange rate
            rate = CurrencyConverter.get_exchange_rate('INR', 'USD')
            
            # Convert amount
            inr_decimal = Decimal(str(inr_amount))
            rate_decimal = Decimal(str(rate))
            usd_amount = inr_decimal * rate_decimal
            
            # Round to 2 decimal places for currency
            usd_rounded = round(float(usd_amount), 2)
            
            logger.info(f"Converted ₹{inr_amount} to ${usd_rounded} USD (rate: {rate})")
            
            return usd_rounded, rate
            
        except Exception as e:
            logger.error(f"Currency conversion failed: {e}")
            # Fallback conversion
            fallback_amount = round(float(inr_amount) * CurrencyConverter.DEFAULT_INR_TO_USD_RATE, 2)
            return fallback_amount, CurrencyConverter.DEFAULT_INR_TO_USD_RATE
    
    @staticmethod
    def convert_usd_to_inr(usd_amount):
        """
        Convert USD amount to INR
        Returns tuple: (inr_amount, exchange_rate_used)
        """
        try:
            # Get current exchange rate (USD to INR)
            rate = CurrencyConverter.get_exchange_rate('USD', 'INR')
            
            # Convert amount
            usd_decimal = Decimal(str(usd_amount))
            rate_decimal = Decimal(str(rate))
            inr_amount = usd_decimal * rate_decimal
            
            # Round to nearest rupee
            inr_rounded = round(float(inr_amount), 0)
            
            logger.info(f"Converted ${usd_amount} to ₹{inr_rounded} INR (rate: {rate})")
            
            return inr_rounded, rate
            
        except Exception as e:
            logger.error(f"Currency conversion failed: {e}")
            # Fallback conversion (1 USD = 83 INR approximately)
            fallback_amount = round(float(usd_amount) * 83, 0)
            return fallback_amount, 83


# Example usage functions
def convert_payment_amount(inr_amount):
    """
    Convert payment amount from INR to USD for PayPal
    Returns formatted amounts for display
    """
    usd_amount, rate = CurrencyConverter.convert_inr_to_usd(inr_amount)
    
    return {
        'original_amount': float(inr_amount),
        'original_currency': 'INR',
        'paypal_amount': usd_amount,
        'paypal_currency': 'USD',
        'exchange_rate': rate,
        'display_text': f"₹{inr_amount:,.0f} → ${usd_amount:.2f} USD"
    }


# Test function
def test_currency_conversion():
    """Test currency conversion with sample amounts"""
    test_amounts = [100, 500, 1000, 2650, 5000]
    
    print("Currency Conversion Test:")
    print("=" * 40)
    
    for amount in test_amounts:
        result = convert_payment_amount(amount)
        print(f"₹{amount:,} → ${result['paypal_amount']:.2f} USD (rate: {result['exchange_rate']:.4f})")
    
    print("=" * 40)


if __name__ == "__main__":
    test_currency_conversion()