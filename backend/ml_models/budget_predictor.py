import pickle
import pandas as pd
import numpy as np
import os
from django.conf import settings

class BudgetPredictor:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained budget prediction model"""
        print("🔍 Attempting to load ML model...")
        
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'budget_model.pkl')
            print(f"🔍 Looking for model at: {model_path}")
            print(f"📁 Directory contents: {os.listdir(os.path.dirname(__file__))}")
            print(f"📄 Model file exists: {os.path.exists(model_path)}")
            
            if not os.path.exists(model_path):
                print(f"❌ Model file not found at {model_path}")
                print("✅ Using intelligent rule-based prediction system instead")
                self.model = None
                return
            
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            print("✅ Budget prediction model loaded successfully!")
            print(f"🤖 Model type: {type(self.model)}")
            print("🎉 ML model is ready for predictions!")
            
        except Exception as e:
            print(f"❌ Error loading budget model: {e}")
            print("✅ Falling back to intelligent rule-based prediction system")
            import traceback
            traceback.print_exc()
            self.model = None
    
    def predict_budget(self, job_data):
        """
        Predict budget based on job data
        
        Args:
            job_data (dict): Dictionary containing job details
                - description: Job description text
                - category: Job category
                - experience_level: Required experience level
                - client_country: Client's country
                - payment_type: Payment type (Hourly/Fixed)
                - applicants_num: Number of applicants (optional)
                - freelancers_num: Number of freelancers (optional)
        
        Returns:
            dict: Prediction result with success status and predicted budget
        """
        print(f"🔍 predict_budget called with data: {job_data}")
        
        if self.model is None:
            print("✅ Using intelligent rule-based prediction system")
            # Fallback prediction based on intelligent rules
            fallback_budget = self._fallback_prediction(job_data)
            return {
                "success": True,
                "predicted_budget": fallback_budget,
                "confidence": "medium",
                "message": "Budget predicted using intelligent analysis"
            }
        
        try:
            # Prepare input data dynamically from job_data
            input_data = {
                'description': job_data.get('description', ''),
                'category': job_data.get('category', 'Web Development'),
                'experience_level': job_data.get('experience_level', 'Intermediate'),
                'client_country': job_data.get('client_country', 'India'),
                'payment_type': job_data.get('payment_type', 'Fixed'),
                'applicants_num': float(job_data.get('applicants_num', 15.0)),
                'freelancers_num': float(job_data.get('freelancers_num', 8.0))
            }
            
            print(f"📊 Prepared input data: {input_data}")
            
            # Convert to DataFrame
            df = pd.DataFrame([input_data])
            print(f"📋 DataFrame shape: {df.shape}")
            print(f"📋 DataFrame columns: {df.columns.tolist()}")
            
            # Make prediction
            prediction = self.model.predict(df)[0]
            predicted_budget = max(int(prediction), 500)  # Ensure minimum budget
            
            print(f"🎯 ML Model prediction: ₹{predicted_budget}")
            print("🤖 Using trained machine learning model")
            
            return {
                "success": True,
                "predicted_budget": predicted_budget,
                "confidence": "high",
                "message": "Budget predicted using AI machine learning model"
            }
            
        except Exception as e:
            print(f"❌ Error in budget prediction: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "message": f"Prediction failed: {str(e)}",
                "predicted_budget": None
            }

    def _fallback_prediction(self, job_data):
        """
        Intelligent rule-based prediction system
        """
        base_budget = 8000  # Increased base budget in INR
        
        # Adjust based on category with more nuanced pricing
        category = job_data.get('category', 'Web Development').lower()
        if 'web' in category or 'development' in category:
            if 'full' in category or 'stack' in category:
                base_budget *= 1.5
            else:
                base_budget *= 1.2
        elif 'design' in category:
            if 'ui' in category or 'ux' in category:
                base_budget *= 1.3
            else:
                base_budget *= 1.0
        elif 'mobile' in category or 'app' in category:
            if 'ios' in category or 'android' in category:
                base_budget *= 1.6
            else:
                base_budget *= 1.4
        elif 'data' in category or 'ai' in category or 'ml' in category:
            base_budget *= 2.0
        elif 'blockchain' in category or 'crypto' in category:
            base_budget *= 1.8
        elif 'devops' in category or 'cloud' in category:
            base_budget *= 1.4
        
        # Adjust based on experience level
        experience = job_data.get('experience_level', 'Intermediate').lower()
        if 'entry' in experience or 'beginner' in experience:
            base_budget *= 0.7
        elif 'intermediate' in experience:
            base_budget *= 1.0
        elif 'expert' in experience or 'advanced' in experience or 'senior' in experience:
            base_budget *= 1.6
        
        # Adjust based on payment type
        payment_type = job_data.get('payment_type', 'Fixed').lower()
        if 'hourly' in payment_type:
            base_budget *= 0.4  # Hourly rates are per hour, not total project
        
        # Sophisticated description analysis
        description = job_data.get('description', '').lower()
        complexity_keywords = ['complex', 'advanced', 'enterprise', 'scalable', 'custom', 'integration']
        simple_keywords = ['simple', 'basic', 'easy', 'quick', 'small']
        
        complexity_score = sum(1 for keyword in complexity_keywords if keyword in description)
        simplicity_score = sum(1 for keyword in simple_keywords if keyword in description)
        
        if complexity_score > simplicity_score:
            base_budget *= (1.0 + complexity_score * 0.2)
        elif simplicity_score > complexity_score:
            base_budget *= (1.0 - simplicity_score * 0.1)
        
        # Description length factor
        if len(description) > 200:
            base_budget *= 1.3
        elif len(description) > 100:
            base_budget *= 1.15
        elif len(description) < 30:
            base_budget *= 0.8
        
        # Round to nearest 500 for cleaner numbers
        final_budget = round(base_budget / 500) * 500
        
        # Ensure reasonable bounds
        final_budget = max(min(final_budget, 50000), 1500)
        
        print(f"🎯 Intelligent prediction: ₹{final_budget} (category: {job_data.get('category', 'N/A')}, experience: {job_data.get('experience_level', 'N/A')})")
        return final_budget


# Create a global instance
budget_predictor = BudgetPredictor()
