import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import HistGradientBoostingRegressor

# 1. Load dataset
df = pd.read_excel("Final_Upwork_Dataset.xlsx")

# 2. Drop missing/invalid targets
df = df.dropna(subset=["Job_Cost"])
df = df[df["Job_Cost"] > 0]

# 3. Clean numeric columns (convert ranges like "20 to 50" → 35)
def parse_range(val):
    if isinstance(val, str) and "to" in val:
        try:
            parts = val.split("to")
            low = float(parts[0].strip())
            high = float(parts[1].strip())
            return (low + high) / 2
        except:
            return np.nan
    try:
        return float(val)
    except:
        return np.nan

for col in ["Applicants_Num", "Freelancers_Num"]:
    df[col] = df[col].apply(parse_range)

df = df.dropna(subset=["Applicants_Num", "Freelancers_Num"])

# 4. Rename columns to match prediction system
df = df.rename(columns={
    "EX_level_demand": "experience_level",
    "Category_1": "category", 
    "Client_Country": "client_country",
    "Payment_type": "payment_type",
    "Description": "description",
    "Applicants_Num": "applicants_num",
    "Freelancers_Num": "freelancers_num"
})

# 5. Features & Target
categorical = ["experience_level", "category", "client_country", "payment_type"]
numeric = ["applicants_num", "freelancers_num"]
text = "description"

X = df[categorical + numeric + [text]]
y = df["Job_Cost"]

# Log-transform target
y = np.log1p(y)

# 6. Preprocessor (force dense output)
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
        ("num", "passthrough", numeric),
        ("text", TfidfVectorizer(max_features=500, dtype=np.float32), text),  # dense output
    ]
)

# 7. Full pipeline
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", HistGradientBoostingRegressor(max_iter=300, random_state=42))
])

# 8. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 9. Train
model.fit(X_train, y_train)

print("✅ Model training complete.")
print("Train R²:", model.score(X_train, y_train))
print("Test R²:", model.score(X_test, y_test))

# 10. Save model
with open("budget_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model saved successfully!")
