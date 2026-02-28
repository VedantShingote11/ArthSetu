# model.pkl — Model Schema Documentation

## Identity

| Field | Value |
|---|---|
| **File** | `model.pkl` |
| **Model Version** | `1.0.0` |
| **SHA-256** | `1ac5c13683d64a163cbd1a192f7174262549f8f29e9ba94fdb85654bb047659e` |
| **File Size** | 438,329,768 bytes (418 MB) |
| **Pickle Protocol** | 4 |

---

## Model Type

| Field | Value |
|---|---|
| **Class** | `sklearn.ensemble.RandomForestRegressor` |
| **Module** | `sklearn.ensemble._forest` |
| **Internal Estimator** | `sklearn.tree.DecisionTreeRegressor` |
| **Is Pipeline** | ❌ No — raw estimator |
| **sklearn Version** | `1.6.1` |
| **Task** | Regression (predicts a numeric loan grade score) |

> **Note**: The pickle contains a broken module reference (`RandomForestRegressor.dtype` instead of `numpy.dtype`).  
> Loading requires a `PatchedUnpickler` — see `inspect_model.py`.

---

## Pickle Structure

The file serializes **two objects** sequentially in a single stream:

| Object # | Type | Description |
|---|---|---|
| 0 | `numpy.ndarray` shape `(37,)` dtype `object` | Feature names array (training column order) |
| 1 | `sklearn.ensemble.RandomForestRegressor` | Trained model |

---

## Preprocessing / Encoders

| Check | Status | Notes |
|---|---|---|
| **Categorical Encoder saved?** | ✅ Implicit | OHE columns are pre-baked into the feature array; no separate `ColumnTransformer` in pickle |
| **Scaler saved?** | ❌ No | No `StandardScaler` / `MinMaxScaler` found in the stream |
| **Label Encoder saved?** | ❌ No | Target is continuous numeric; no `LabelBinarizer` / `LabelEncoder` |
| **Grade mapping function?** | ✅ Yes | `map_profile_score_to_grade()` is stored as a callable in the pickle dict key `grade_mapping_function` |

---

## Target Variable

- **Type:** Regression — outputs a **continuous numeric score**  
- **Post-processing:** The raw numeric output is passed through `map_profile_score_to_grade()` to produce a letter grade (A–G)  
- **Format:** No one-hot or label encoding of the target is needed

---

## Input Schema — 37 Features (in training order)

### Numeric Features (21)

| # | Feature | Description |
|---|---|---|
| 0 | `loan_amnt` | Requested loan amount |
| 1 | `term` | Loan term in months (36 or 60) |
| 2 | `emp_length` | Employment length in years |
| 3 | `annual_inc` | Annual income |
| 4 | `dti` | Debt-to-income ratio |
| 5 | `delinq_2yrs` | Delinquencies in last 2 years |
| 6 | `inq_last_6mths` | Credit inquiries in last 6 months |
| 7 | `open_acc` | Number of open credit lines |
| 8 | `pub_rec` | Number of derogatory public records |
| 9 | `revol_bal` | Revolving credit balance |
| 10 | `revol_util` | Revolving credit utilization rate |
| 11 | `total_acc` | Total credit lines |
| 12 | `tot_cur_bal` | Total current balance |
| 13 | `total_rev_hi_lim` | Total revolving high credit limit |
| 14 | `acc_open_past_24mths` | Accounts opened in past 24 months |
| 15 | `num_accts_ever_120_pd` | Accounts ever 120+ days past due |
| 16 | `num_rev_accts` | Number of revolving accounts |
| 17 | `num_tl_op_past_12m` | Trade lines opened in past 12 months |
| 18 | `tot_hi_cred_lim` | Total high credit limit |
| 19 | `total_bal_ex_mort` | Total balance excluding mortgage |
| 20 | `cr_line_age_years` | Age of oldest credit line in years |

### One-Hot Encoded Features (16)

#### `home_ownership` (drop-first implied; missing = neither of the 3 = OTHER/NONE)

| # | Feature | Category |
|---|---|---|
| 21 | `home_ownership_MORTGAGE` | `"MORTGAGE"` |
| 22 | `home_ownership_OWN` | `"OWN"` |
| 23 | `home_ownership_RENT` | `"RENT"` |

#### `verification_status` (drop-first; 0,0 = "Not Verified")

| # | Feature | Category |
|---|---|---|
| 24 | `verification_status_Source Verified` | `"Source Verified"` |
| 25 | `verification_status_Verified` | `"Verified"` |

#### `purpose` (drop-first; 0,0,...,0 = implied dropped category)

| # | Feature | Category |
|---|---|---|
| 26 | `purpose_credit_card` | `"credit_card"` |
| 27 | `purpose_debt_consolidation` | `"debt_consolidation"` |
| 28 | `purpose_home_improvement` | `"home_improvement"` |
| 29 | `purpose_house` | `"house"` |
| 30 | `purpose_major_purchase` | `"major_purchase"` |
| 31 | `purpose_medical` | `"medical"` |
| 32 | `purpose_moving` | `"moving"` |
| 33 | `purpose_other` | `"other"` |
| 34 | `purpose_renewable_energy` | `"renewable_energy"` |
| 35 | `purpose_small_business` | `"small_business"` |
| 36 | `purpose_vacation` | `"vacation"` |

---

## How to Load

```python
import pickle, warnings
import numpy as np

class PatchedUnpickler(pickle.Unpickler):
    """Patches a broken dtype module reference in the pickle stream."""
    def find_class(self, module, name):
        if module == 'RandomForestRegressor' and name == 'dtype':
            return np.dtype
        return super().find_class(module, name)

with open('model.pkl', 'rb') as f:
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        feature_names = PatchedUnpickler(f).load()   # object 0: ndarray(37,)
        # object 1 (RF model) requires a second unpickler call on same stream
        # — see inspect_model.py for complete loading logic
```

---

## ⚠️ Known Issues

1. **Broken dtype reference** — The pickle has `module='RandomForestRegressor', name='dtype'` instead of `module='numpy', name='dtype'`. Causes `ModuleNotFoundError` on standard `pickle.load()`. The `PatchedUnpickler` above resolves this.  
2. **Large file     (418 MB)** — Loading takes 30–60 seconds depending on hardware.  
3. **Custom function** — `map_profile_score_to_grade` is defined in `__main__` scope at training time. It must be redefined before pickling or loading in production.

---

*Generated: 2026-02-26 | Inspector: `inspect_model.py`*
