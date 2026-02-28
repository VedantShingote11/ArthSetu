import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings

import os

# Suppress scikit-learn version warnings to prevent them from corrupting the JSON stdout
warnings.filterwarnings("ignore", category=UserWarning)
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass

# Placeholder function to satisfy joblib.load during unpickling.
def map_profile_score_to_grade(score):
    return "PLACEHOLDER_GRADE"

# Model path matches the root directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))
model_filename = os.path.join(script_dir, 'model.pkl')

try:
    loaded_pipeline_bundle = joblib.load(model_filename)
except Exception as e:
    print(json.dumps({"error": f"Failed to load model from {model_filename}. Make sure model.pkl is in the root directory. Error: {str(e)}"}))
    sys.exit(1)

# Extract components
loaded_model = loaded_pipeline_bundle['model']
loaded_scaler = loaded_pipeline_bundle['scaler']
loaded_categorical_cols = loaded_pipeline_bundle['categorical_cols']
loaded_numerical_features_to_scale = loaded_pipeline_bundle['numerical_features_to_scale']
loaded_X_columns = loaded_pipeline_bundle['X_columns']

# Define real function logic
def actual_map_profile_score_to_grade(score):
    if score >= 700:
        return "A"
    elif score >= 500:
        return "B"
    else:
        return "C"

loaded_grade_mapping_function = actual_map_profile_score_to_grade

def predict_loan_details(user_input_data):
    input_df = pd.DataFrame([user_input_data])
    
    # Process inputs
    input_df['term'] = input_df['term'].str.extract(r'(\d+)').astype(int)
    input_df['emp_length'] = input_df['emp_length'].str.extract(r'(\d+)', expand=False).fillna('0').astype(int)
    
    input_df['earliest_cr_line'] = pd.to_datetime(input_df['earliest_cr_line'], format='%Y-%m-%d')
    input_df['cr_line_age_years'] = pd.Timestamp.now().year - input_df['earliest_cr_line'].dt.year
    input_df = input_df.drop('earliest_cr_line', axis=1)

    # Convert categoricals
    input_df = pd.get_dummies(input_df, columns=loaded_categorical_cols, drop_first=True)

    # Missing columns handling
    missing_cols = set(loaded_X_columns) - set(input_df.columns)
    for c in missing_cols:
        input_df[c] = False
    
    input_df = input_df[loaded_X_columns]

    # Scale numerics
    # Use copy to avoid SettingWithCopyWarning
    scaled_features = loaded_scaler.transform(input_df[loaded_numerical_features_to_scale])
    input_df.loc[:, loaded_numerical_features_to_scale] = scaled_features

    # Predict
    predicted_profile_score = loaded_model.predict(input_df)[0]
    predicted_grade = loaded_grade_mapping_function(predicted_profile_score)

    return predicted_profile_score, predicted_grade

if __name__ == "__main__":
    try:
        # We read input data from a temporary JSON file path passed as the first CLI argument
        input_file = sys.argv[1]
        with open(input_file, 'r') as f:
            user_input_data = json.load(f)
            
        score, grade = predict_loan_details(user_input_data)
        
        # Output exactly valid JSON and nothing else
        print(json.dumps({
            "score": float(score),
            "grade": grade
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
