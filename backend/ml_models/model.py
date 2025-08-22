import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

print("🚀 Starting budget prediction model training...")

# 1. Load dataset
try:
    dataset_path = "Final_Upwork_Dataset.xlsx"
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")
    
    print(f"📊 Loading dataset from {dataset_path}...")
    df = pd.read_excel(dataset_path)
    print(f"✅ Dataset loaded successfully! Shape: {df.shape}")
    
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    exit(1)

# 2. Data cleaning and preprocessing
print("🧹 Cleaning and preprocessing data...")

# Drop missing/invalid targets
initial_rows = len(df)
df = df.dropna(subset=["Job_Cost"])
df = df[df["Job_Cost"] > 0]
print(f"📉 Removed {initial_rows - len(df)} rows with invalid Job_Cost")

# 3. Clean numeric columns (convert ranges like "20 to 50" → 35)
def parse_range(val):
    if pd.isna(val):
        return np.nan
    
    if isinstance(val, str):
        val = str(val).strip().lower()
        if "to" in val:
            try:
                parts = val.split("to")
                low = float(parts[0].strip())
                high = float(parts[1].strip())
                return (low + high) / 2
            except:
                return np.nan
        elif val.replace('.', '').replace('-', '').isdigit():
            return float(val)
        else:
            return np.nan
    elif isinstance(val, (int, float)):
        return float(val)
    else:
        return np.nan

# Clean numeric columns
for col in ["Applicants_Num", "Freelancers_Num"]:
    if col in df.columns:
        df[col] = df[col].apply(parse_range)
        print(f"🔢 Cleaned {col}: {df[col].notna().sum()} valid values")

# Drop rows with missing numeric values
df = df.dropna(subset=["Applicants_Num", "Freelancers_Num"])
print(f"📊 Final dataset shape after cleaning: {df.shape}")

# 4. Rename columns to match prediction system
column_mapping = {
    "EX_level_demand": "experience_level",
    "Category_1": "category", 
    "Client_Country": "client_country",
    "Payment_type": "payment_type",
    "Description": "description",
    "Applicants_Num": "applicants_num",
    "Freelancers_Num": "freelancers_num"
}

# Only rename columns that exist
existing_columns = {old: new for old, new in column_mapping.items() if old in df.columns}
df = df.rename(columns=existing_columns)
print(f"🏷️ Renamed columns: {list(existing_columns.values())}")

# 5. Features & Target
categorical = ["experience_level", "category", "client_country", "payment_type"]
numeric = ["applicants_num", "freelancers_num"]
text = "description"

# Check which features exist in the dataset
available_categorical = [col for col in categorical if col in df.columns]
available_numeric = [col for col in numeric if col in df.columns]
available_text = text if text in df.columns else None

print(f"📋 Available features:")
print(f"   Categorical: {available_categorical}")
print(f"   Numeric: {available_numeric}")
print(f"   Text: {available_text}")

# Prepare feature matrix
feature_columns = available_categorical + available_numeric
if available_text:
    feature_columns.append(available_text)

X = df[feature_columns]
y = df["Job_Cost"]

print(f"🎯 Target variable 'Job_Cost' statistics:")
print(f"   Mean: ₹{y.mean():.2f}")
print(f"   Median: ₹{y.median():.2f}")
print(f"   Min: ₹{y.min():.2f}")
print(f"   Max: ₹{y.max():.2f}")

# Log-transform target for better model performance
y = np.log1p(y)
print(f"📊 Log-transformed target statistics:")
print(f"   Mean: {y.mean():.4f}")
print(f"   Std: {y.std():.4f}")

# 6. Create preprocessor
print("🔧 Creating preprocessing pipeline...")

transformers = []

# Add categorical preprocessing if categorical features exist
if available_categorical:
    transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), available_categorical))
    print(f"   ✅ Added categorical encoder for {len(available_categorical)} features")

# Add numeric preprocessing if numeric features exist
if available_numeric:
    transformers.append(("num", StandardScaler(), available_numeric))
    print(f"   ✅ Added numeric scaler for {len(available_numeric)} features")

# Add text preprocessing if text feature exists
if available_text:
    transformers.append(("text", TfidfVectorizer(max_features=500, dtype=np.float32, stop_words='english'), available_text))
    print(f"   ✅ Added text vectorizer with 500 features")

if not transformers:
    print("❌ No valid features found! Please check your dataset.")
    exit(1)

preprocessor = ColumnTransformer(transformers=transformers, remainder='drop')

# 7. Create full pipeline
print("🏗️ Building complete model pipeline...")
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", HistGradientBoostingRegressor(
        max_iter=500, 
        random_state=42,
        learning_rate=0.1,
        max_depth=8
    ))
])

# 8. Train-test split
print("✂️ Splitting data into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=None
)
print(f"   Training set: {X_train.shape[0]} samples")
print(f"   Test set: {X_test.shape[0]} samples")

# 9. Train model
print("🚀 Training model...")
model.fit(X_train, y_train)

# 10. Evaluate model
print("📊 Evaluating model performance...")
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

train_r2 = r2_score(y_train, y_train_pred)
test_r2 = r2_score(y_test, y_test_pred)
train_mae = mean_absolute_error(y_train, y_train_pred)
test_mae = mean_absolute_error(y_test, y_test_pred)

print(f"✅ Model training complete!")
print(f"📈 Train R²: {train_r2:.4f}")
print(f"📈 Test R²: {test_r2:.4f}")
print(f"📊 Train MAE: {train_mae:.4f}")
print(f"📊 Test MAE: {test_mae:.4f}")

# 11. Save model
model_path = "budget_model.pkl"
print(f"💾 Saving model to {model_path}...")
try:
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print("✅ Model saved successfully!")
    
    # Verify file size
    file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
    print(f"📁 Model file size: {file_size:.2f} MB")
    
except Exception as e:
    print(f"❌ Error saving model: {e}")
    exit(1)

# 12. Test prediction
print("🧪 Testing model with sample data...")
try:
    # Create sample data with available features
    sample_data = {}
    if available_categorical:
        for col in available_categorical:
            if col in df.columns:
                sample_data[col] = df[col].iloc[0]
    
    if available_numeric:
        for col in available_numeric:
            if col in df.columns:
                sample_data[col] = df[col].iloc[0]
    
    if available_text:
        sample_data[available_text] = df[available_text].iloc[0]
    
    # Create DataFrame for prediction
    sample_df = pd.DataFrame([sample_data])
    
    # Make prediction
    prediction = model.predict(sample_df)
    original_prediction = np.expm1(prediction[0])
    
    print(f"🎯 Sample prediction: ₹{original_prediction:.2f}")
    print(f"✅ Model is working correctly!")
    
except Exception as e:
    print(f"⚠️ Warning: Could not test sample prediction: {e}")

print("\n🎉 Budget prediction model training completed successfully!")
print("🔮 The model is ready to provide AI budget suggestions!")
