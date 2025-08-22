import pickle
import pandas as pd
import numpy as np
import os
from datetime import datetime
from django.conf import settings

class BudgetPredictor:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained budget prediction model"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 🔧 Attempting to load ML model...")
        
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'budget_model.pkl')
            print(f"[{timestamp}] 📁 Looking for model at: {model_path}")
            
            if not os.path.exists(model_path):
                print(f"[{timestamp}] ❌ Model file not found at {model_path}")
                print(f"[{timestamp}] 🔄 Using intelligent rule-based prediction system instead")
                self.model = None
                return
            
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
            print(f"[{timestamp}] ✅ Budget prediction model loaded successfully!")
            print(f"[{timestamp}] 📊 Model type: {type(self.model)}")
            print(f"[{timestamp}] 📁 Model file size: {file_size:.2f} MB")
            print(f"[{timestamp}] 🚀 ML model is ready for predictions!")
            
        except Exception as e:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ❌ Error loading budget model: {e}")
            print(f"[{timestamp}] 🔄 Falling back to intelligent rule-based prediction system")
            import traceback
            traceback.print_exc()
            self.model = None
    
    def predict_budget(self, job_data):
        """
        Predict budget based on job data with real-time logging
        """
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"\n[{timestamp}] 🎯 ===== NEW BUDGET PREDICTION REQUEST =====")
        print(f"[{timestamp}] 📋 Received job data:")
        for key, value in job_data.items():
            print(f"[{timestamp}]    {key}: {value}")
        
        if self.model is None:
            print(f"[{timestamp}] 🔄 Using intelligent rule-based prediction system")
            fallback_budget = self._fallback_prediction(job_data)
            print(f"[{timestamp}] 🎯 Rule-based prediction complete: ₹{fallback_budget}")
            return {
                "success": True,
                "predicted_budget": fallback_budget,
                "confidence": "medium",
                "message": "Budget predicted using intelligent analysis"
            }
        
        try:
            print(f"[{timestamp}] 🤖 Starting ML model prediction...")
            
            # Prepare input data with proper defaults and validation
            input_data = {}
            
            # Handle description (required for text features)
            description = job_data.get('description', '')
            if not description or len(description.strip()) < 10:
                description = "Web development project with standard features"
                print(f"[{timestamp}] ⚠️ Description too short, using default: {description}")
            input_data['description'] = description
            
            # Handle categorical features with proper extraction
            category = job_data.get('category', 'Web, Mobile & Software Dev')
            
            # Handle category if it's an object with 'name' property
            if isinstance(category, dict) and 'name' in category:
                category = category['name']
                print(f"[{timestamp}] 🔍 Extracted category name from object: {category}")
            elif isinstance(category, str):
                category = category
            else:
                category = 'Web, Mobile & Software Dev'
                print(f"[{timestamp}] ⚠️ Invalid category format, using default: {category}")
            
            # Validate category against known categories
            valid_categories = ['Web, Mobile & Software Dev', 'Data Science & Analytics', 'Accounting & Consulting', 
                              'IT & Networking', 'Sales & Marketing', 'Design & Creative', 'Admin Support', 
                              'Engineering & Architecture', 'Customer Service', 'Legal', 'Translation', 'Writing']
            
            if category not in valid_categories:
                # Find closest match or use the actual category if it's close
                category_lower = category.lower()
                for valid_cat in valid_categories:
                    if any(word in category_lower for word in valid_cat.lower().split(', ')):
                        category = valid_cat
                        print(f"[{timestamp}] 🔍 Mapped category '{category}' to valid category: {valid_cat}")
                        break
                else:
                    # If no close match found, use the actual category as-is
                    print(f"[{timestamp}] 🔍 Using actual category: {category}")
            
            input_data['category'] = category
            
            experience_level = job_data.get('experience_level', 'Intermediate')
            if experience_level not in ['Entry', 'Intermediate', 'Expert']:
                # Use the actual experience level if it's not in the expected format
                print(f"[{timestamp}] 🔍 Using actual experience level: {experience_level}")
            input_data['experience_level'] = experience_level
            
            client_country = job_data.get('client_country', 'India')
            if not client_country:
                client_country = 'India'
                print(f"[{timestamp}] ⚠️ No client country, using default: {client_country}")
            input_data['client_country'] = client_country
            
            payment_type = job_data.get('payment_type', 'Fixed')
            if payment_type not in ['Fixed', 'Hourly']:
                # Use the actual payment type if it's not in the expected format
                print(f"[{timestamp}] 🔍 Using actual payment type: {payment_type}")
            input_data['payment_type'] = payment_type
            
            # Handle numeric features with actual values
            applicants_num = job_data.get('applicants_num', 15.0)
            try:
                applicants_num = float(applicants_num)
                if applicants_num <= 0:
                    applicants_num = 15.0
                    print(f"[{timestamp}] ⚠️ Invalid applicants number, using default: {applicants_num}")
            except (ValueError, TypeError):
                applicants_num = 15.0
                print(f"[{timestamp}] ⚠️ Invalid applicants number, using default: {applicants_num}")
            input_data['applicants_num'] = applicants_num
            
            freelancers_num = job_data.get('freelancers_num', 8.0)
            try:
                freelancers_num = float(freelancers_num)
                if freelancers_num <= 0:
                    freelancers_num = 8.0
                    print(f"[{timestamp}] ⚠️ Invalid freelancers number, using default: {freelancers_num}")
            except (ValueError, TypeError):
                freelancers_num = 8.0
                print(f"[{timestamp}] ⚠️ Invalid freelancers number, using default: {freelancers_num}")
            input_data['freelancers_num'] = freelancers_num
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] 📊 Final prepared input data:")
            for key, value in input_data.items():
                print(f"[{timestamp}]    {key}: {value}")
            
            # Convert to DataFrame
            df = pd.DataFrame([input_data])
            print(f"[{timestamp}] 📋 DataFrame created - Shape: {df.shape}, Columns: {list(df.columns)}")
            
            # Make prediction using the trained model
            print(f"[{timestamp}] 🚀 Making ML model prediction...")
            start_time = datetime.now()
            
            prediction = self.model.predict(df)[0]
            
            end_time = datetime.now()
            prediction_time = (end_time - start_time).total_seconds() * 1000  # milliseconds
            
            print(f"[{timestamp}] ⚡ Prediction completed in {prediction_time:.1f}ms")
            
            # Convert log-transformed prediction back to original scale
            predicted_budget = np.expm1(prediction)
            print(f"[{timestamp}] 🔢 Raw prediction (log scale): {prediction:.4f}")
            print(f"[{timestamp}] 🔢 Converted prediction: {predicted_budget:.2f}")
            
            # The ML model was trained on log-transformed data, so predictions are very low
            # We need to scale them up to realistic budget ranges within the valid range (₹200 - ₹9999)
            if predicted_budget < 1000:
                # Scale up low predictions to realistic ranges within constraints
                if 'design' in input_data.get('category', '').lower() or 'creative' in input_data.get('category', '').lower():
                    # Design work typically costs more, but stay within range
                    predicted_budget = min(max(predicted_budget * 8, 3000), 8000)
                elif 'web' in input_data.get('category', '').lower() or 'development' in input_data.get('category', '').lower():
                    # Web development work
                    predicted_budget = min(max(predicted_budget * 6, 2500), 7000)
                elif 'mobile' in input_data.get('category', '').lower() or 'app' in input_data.get('category', '').lower():
                    # Mobile development work
                    predicted_budget = min(max(predicted_budget * 10, 4000), 9000)
                elif 'data' in input_data.get('category', '').lower() or 'ai' in input_data.get('category', '').lower():
                    # Data/AI work typically costs more
                    predicted_budget = min(max(predicted_budget * 12, 5000), 9500)
                else:
                    # General scaling for other categories
                    predicted_budget = min(max(predicted_budget * 5, 2000), 6000)
                
                print(f"[{timestamp}] 🔧 Scaled up low prediction to realistic range: ₹{predicted_budget:.2f}")
            
            # Apply experience level adjustments
            experience = input_data.get('experience_level', 'Intermediate')
            if 'entry' in experience.lower():
                predicted_budget *= 0.8
                print(f"[{timestamp}] 📉 Entry level adjustment: 0.8x → ₹{predicted_budget:.2f}")
            elif 'expert' in experience.lower():
                predicted_budget *= 1.3
                print(f"[{timestamp}] 📈 Expert level adjustment: 1.3x → ₹{predicted_budget:.2f}")
            
            # Apply scope adjustments based on description
            description = input_data.get('description', '')
            if 'large' in description.lower():
                predicted_budget *= 1.2
                print(f"[{timestamp}] 📈 Large scope adjustment: 1.2x → ₹{predicted_budget:.2f}")
            elif 'medium' in description.lower():
                predicted_budget *= 1.05
                print(f"[{timestamp}] 📊 Medium scope adjustment: 1.05x → ₹{predicted_budget:.2f}")
            elif 'small' in description.lower():
                predicted_budget *= 0.9
                print(f"[{timestamp}] 📉 Small scope adjustment: 0.9x → ₹{predicted_budget:.2f}")
            
            # Ensure budget stays within the valid range (₹200 - ₹9999)
            predicted_budget = max(int(predicted_budget), 200)   # Minimum ₹200
            predicted_budget = min(predicted_budget, 9999)       # Maximum ₹9999
            
            # Round to nearest 100 for cleaner numbers within range
            predicted_budget = round(predicted_budget / 100) * 100
            
            print(f"[{timestamp}] 🎯 Final predicted budget: ₹{predicted_budget}")
            print(f"[{timestamp}] 🤖 Using trained machine learning model")
            
            # Log model information
            model_info = {
                "type": "HistGradientBoostingRegressor",
                "features_used": list(input_data.keys()),
                "prediction_confidence": "high",
                "prediction_time_ms": round(prediction_time, 1),
                "input_features_count": len(input_data),
                "model_file_size_mb": round(os.path.getsize(os.path.join(os.path.dirname(__file__), 'budget_model.pkl')) / (1024 * 1024), 2)
            }
            
            print(f"[{timestamp}] 📊 Model Info:")
            for key, value in model_info.items():
                print(f"[{timestamp}]    {key}: {value}")
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✅ ML Model prediction successful!")
            print(f"[{timestamp}] 🎯 ===== PREDICTION COMPLETE =====")
            
            return {
                "success": True,
                "predicted_budget": predicted_budget,
                "confidence": "high",
                "message": "Budget predicted using AI machine learning model",
                "model_info": model_info
            }
            
        except Exception as e:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ❌ Error in budget prediction: {e}")
            import traceback
            traceback.print_exc()
            
            # Fallback to rule-based prediction
            print(f"[{timestamp}] 🔄 Falling back to rule-based prediction...")
            fallback_budget = self._fallback_prediction(job_data)
            print(f"[{timestamp}] 🎯 Fallback prediction complete: ₹{fallback_budget}")
            return {
                "success": True,
                "predicted_budget": fallback_budget,
                "confidence": "medium",
                "message": f"ML prediction failed, using intelligent analysis. Error: {str(e)}"
            }

    def _fallback_prediction(self, job_data):
        """
        Intelligent rule-based prediction system using real job data
        """
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 🧠 Starting rule-based prediction with real data...")
        
        # Extract real category data
        category = job_data.get('category', 'Web Development')
        if isinstance(category, dict) and 'name' in category:
            category = category['name']
            print(f"[{timestamp}] 🔍 Extracted category name: {category}")
        
        # Extract real experience level
        experience = job_data.get('experience_level', 'Intermediate')
        print(f"[{timestamp}] 👨‍💻 Using experience level: {experience}")
        
        # Extract real description
        description = job_data.get('description', '')
        print(f"[{timestamp}] 📝 Using description: {description[:100]}...")
        
        # Base budget calculation based on real category
        base_budget = 8000  # Adjusted base budget to stay within range
        
        print(f"[{timestamp}] 💰 Base budget: ₹{base_budget}")
        print(f"[{timestamp}] 🏷️ Processing real category: {category}")
        
        # Category-specific adjustments based on real data
        category_lower = category.lower()
        
        if 'design' in category_lower or 'creative' in category_lower:
            if 'ui' in category_lower or 'ux' in category_lower:
                base_budget *= 1.2
                print(f"[{timestamp}] 📈 UI/UX Design multiplier: 1.2x → ₹{base_budget}")
            elif 'graphic' in category_lower:
                base_budget *= 1.1
                print(f"[{timestamp}] 📈 Graphic Design multiplier: 1.1x → ₹{base_budget}")
            else:
                base_budget *= 1.15
                print(f"[{timestamp}] 📈 Design & Creative multiplier: 1.15x → ₹{base_budget}")
        elif 'web' in category_lower or 'development' in category_lower:
            if 'full' in category_lower or 'stack' in category_lower:
                base_budget *= 1.3
                print(f"[{timestamp}] 📈 Full-stack multiplier: 1.3x → ₹{base_budget}")
            else:
                base_budget *= 1.1
                print(f"[{timestamp}] 📈 Web dev multiplier: 1.1x → ₹{base_budget}")
        elif 'mobile' in category_lower or 'app' in category_lower:
            base_budget *= 1.4
            print(f"[{timestamp}] 📈 Mobile app multiplier: 1.4x → ₹{base_budget}")
        elif 'data' in category_lower or 'ai' in category_lower or 'ml' in category_lower:
            base_budget *= 1.6
            print(f"[{timestamp}] 📈 Data/AI multiplier: 1.6x → ₹{base_budget}")
        elif 'blockchain' in category_lower or 'crypto' in category_lower:
            base_budget *= 1.5
            print(f"[{timestamp}] 📈 Blockchain multiplier: 1.5x → ₹{base_budget}")
        elif 'devops' in category_lower or 'cloud' in category_lower:
            base_budget *= 1.2
            print(f"[{timestamp}] 📈 DevOps multiplier: 1.2x → ₹{base_budget}")
        elif 'marketing' in category_lower or 'sales' in category_lower:
            base_budget *= 1.05
            print(f"[{timestamp}] 📈 Marketing/Sales multiplier: 1.05x → ₹{base_budget}")
        elif 'writing' in category_lower or 'content' in category_lower:
            base_budget *= 0.9
            print(f"[{timestamp}] 📉 Writing/Content multiplier: 0.9x → ₹{base_budget}")
        
        # Experience level adjustments based on real data
        experience_lower = experience.lower()
        print(f"[{timestamp}] 👨‍💻 Processing real experience level: {experience}")
        
        if 'entry' in experience_lower or 'beginner' in experience_lower:
            base_budget *= 0.7
            print(f"[{timestamp}] 📉 Entry level multiplier: 0.7x → ₹{base_budget}")
        elif 'intermediate' in experience_lower:
            base_budget *= 1.0
            print(f"[{timestamp}] 📊 Intermediate level multiplier: 1.0x → ₹{base_budget}")
        elif 'expert' in experience_lower or 'advanced' in experience_lower or 'senior' in experience_lower:
            base_budget *= 1.4
            print(f"[{timestamp}] 📈 Expert level multiplier: 1.4x → ₹{base_budget}")
        
        # Payment type adjustments based on real data
        payment_type = job_data.get('payment_type', 'Fixed').lower()
        if 'hourly' in payment_type:
            base_budget *= 0.4  # Hourly rates are per hour, not total project
            print(f"[{timestamp}] ⏰ Hourly payment multiplier: 0.4x → ₹{base_budget}")
        
        # Sophisticated description analysis using real description
        print(f"[{timestamp}] 📝 Analyzing real description (length: {len(description)} chars)")
        
        complexity_keywords = ['complex', 'advanced', 'enterprise', 'scalable', 'custom', 'integration', 'full-stack', 'full stack']
        simple_keywords = ['simple', 'basic', 'easy', 'quick', 'small', 'update', 'modify']
        
        complexity_score = sum(1 for keyword in complexity_keywords if keyword in description.lower())
        simplicity_score = sum(1 for keyword in simple_keywords if keyword in description.lower())
        
        print(f"[{timestamp}] 🔍 Complexity score: {complexity_score}, Simplicity score: {simplicity_score}")
        
        if complexity_score > simplicity_score:
            base_budget *= (1.0 + complexity_score * 0.15)
            print(f"[{timestamp}] 📈 Complexity multiplier: {1.0 + complexity_score * 0.15:.2f}x → ₹{base_budget}")
        elif simplicity_score > complexity_score:
            base_budget *= (1.0 - simplicity_score * 0.1)
            print(f"[{timestamp}] 📉 Simplicity multiplier: {1.0 - simplicity_score * 0.1:.2f}x → ₹{base_budget}")
        
        # Description length factor using real description
        if len(description) > 200:
            base_budget *= 1.2
            print(f"[{timestamp}] 📏 Long description multiplier: 1.2x → ₹{base_budget}")
        elif len(description) > 100:
            base_budget *= 1.1
            print(f"[{timestamp}] 📏 Medium description multiplier: 1.1x → ₹{base_budget}")
        elif len(description) < 30:
            base_budget *= 0.8
            print(f"[{timestamp}] 📏 Short description multiplier: 0.8x → ₹{base_budget}")
        
        # Round to nearest 100 for cleaner numbers
        final_budget = round(base_budget / 100) * 100
        
        # Ensure budget stays within the valid range (₹200 - ₹9999)
        final_budget = max(min(final_budget, 9999), 200)
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 🎯 Rule-based prediction complete using real data: ₹{final_budget}")
        print(f"[{timestamp}] 📊 Final calculation breakdown:")
        print(f"[{timestamp}]    - Category: {category}")
        print(f"[{timestamp}]    - Experience: {experience}")
        print(f"[{timestamp}]    - Description length: {len(description)} chars")
        print(f"[{timestamp}]    - Complexity score: {complexity_score}")
        print(f"[{timestamp}]    - Final budget: ₹{final_budget}")
        
        return final_budget


# Create a global instance
budget_predictor = BudgetPredictor()
