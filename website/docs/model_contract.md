# Model Feature Contract
**Model:** `model.pkl` — `sklearn.ensemble.RandomForestRegressor`  
**SHA-256:** `1ac5c13683d64a163cbd1a192f7174262549f8f29e9ba94fdb85654bb047659e`  
**Contract version:** `1.0.0`  
**Frozen on:** 2026-02-26

---

## 1 · Raw Input Columns

These are the fields your API / data pipeline must supply **before** any transformation. The model itself never sees these names — they are transformed (see §3) into the 37 model features in §2.

| # | Raw Column | Kind | Required? |
|---|---|---|---|
| 1 | `loan_amnt` | numeric | ✅ |
| 2 | `term` | numeric / string | ✅ |
| 3 | `emp_length` | numeric / string | ✅ |
| 4 | `home_ownership` | categorical | ✅ |
| 5 | `annual_inc` | numeric | ✅ |
| 6 | `verification_status` | categorical | ✅ |
| 7 | `purpose` | categorical | ✅ |
| 8 | `dti` | numeric | ✅ |
| 9 | `delinq_2yrs` | numeric | ✅ |
| 10 | `earliest_cr_line` | date string | ✅ |
| 11 | `inq_last_6mths` | numeric | ✅ |
| 12 | `open_acc` | numeric | ✅ |
| 13 | `pub_rec` | numeric | ✅ |
| 14 | `revol_bal` | numeric | ✅ |
| 15 | `revol_util` | numeric | ✅ |
| 16 | `total_acc` | numeric | ✅ |
| 17 | `tot_cur_bal` | numeric | ✅ |
| 18 | `total_rev_hi_lim` | numeric | ✅ |
| 19 | `acc_open_past_24mths` | numeric | ✅ |
| 20 | `num_accts_ever_120_pd` | numeric | ✅ |
| 21 | `num_rev_accts` | numeric | ✅ |
| 22 | `num_tl_op_past_12m` | numeric | ✅ |
| 23 | `tot_hi_cred_lim` | numeric | ✅ |
| 24 | `total_bal_ex_mort` | numeric | ✅ |

---

## 2 · Frozen Model Feature Order (37 columns)

> ⚠️ **The order below is immutable.** Any change breaks the model.  
> Source of truth: object 0 of the pickle stream.

```python
FEATURE_ORDER = [
    # ── Numeric (passthrough) ────────────────────────────────────── idx 0–20
    "loan_amnt",                    # 0
    "term",                         # 1
    "emp_length",                   # 2
    "annual_inc",                   # 3
    "dti",                          # 4
    "delinq_2yrs",                  # 5
    "inq_last_6mths",               # 6
    "open_acc",                     # 7
    "pub_rec",                      # 8
    "revol_bal",                    # 9
    "revol_util",                   # 10
    "total_acc",                    # 11
    "tot_cur_bal",                  # 12
    "total_rev_hi_lim",             # 13
    "acc_open_past_24mths",         # 14
    "num_accts_ever_120_pd",        # 15
    "num_rev_accts",                # 16
    "num_tl_op_past_12m",           # 17
    "tot_hi_cred_lim",              # 18
    "total_bal_ex_mort",            # 19
    "cr_line_age_years",            # 20  ← derived from earliest_cr_line
    # ── home_ownership OHE ─────────────────────────────────────── idx 21–23
    "home_ownership_MORTGAGE",      # 21
    "home_ownership_OWN",           # 22
    "home_ownership_RENT",          # 23
    # ── verification_status OHE ────────────────────────────────── idx 24–25
    "verification_status_Source Verified",  # 24
    "verification_status_Verified",         # 25
    # ── purpose OHE ────────────────────────────────────────────── idx 26–36
    "purpose_credit_card",          # 26
    "purpose_debt_consolidation",   # 27
    "purpose_home_improvement",     # 28
    "purpose_house",                # 29
    "purpose_major_purchase",       # 30
    "purpose_medical",              # 31
    "purpose_moving",               # 32
    "purpose_other",                # 33
    "purpose_renewable_energy",     # 34
    "purpose_small_business",       # 35
    "purpose_vacation",             # 36
]
```

---

## 3 · Transformation Rules

### 3.1 Numeric Passthrough Features

These are clipped or validated and passed directly (no scaling). No StandardScaler was saved in the model.

| Raw column | Model column | Type | Valid range | Clip? | Notes |
|---|---|---|---|---|---|
| `loan_amnt` | `loan_amnt` | float | 500 – 40 000 | ✅ | LendingClub max $40k |
| `term` | `term` | int | {36, 60} | ❌ | Strip ` months` suffix if string, cast to int |
| `emp_length` | `emp_length` | float | 0 – 10 | ✅ | `< 1 year` → 0, `10+ years` → 10 |
| `annual_inc` | `annual_inc` | float | 0 – 10 000 000 | ✅ | Clip extreme outliers at $10M |
| `dti` | `dti` | float | 0 – 100 | ✅ | Clip at 100 (>100 is data error) |
| `delinq_2yrs` | `delinq_2yrs` | int | 0 – 30 | ✅ | Clip at 30 |
| `inq_last_6mths` | `inq_last_6mths` | int | 0 – 30 | ✅ | Clip at 30 |
| `open_acc` | `open_acc` | int | 0 – 90 | ✅ | Clip at 90 |
| `pub_rec` | `pub_rec` | int | 0 – 20 | ✅ | Clip at 20 |
| `revol_bal` | `revol_bal` | float | 0 – 2 500 000 | ✅ | |
| `revol_util` | `revol_util` | float | 0 – 150 | ✅ | >100 possible, clip at 150 |
| `total_acc` | `total_acc` | int | 0 – 200 | ✅ | |
| `tot_cur_bal` | `tot_cur_bal` | float | 0 – 9 999 999 | ✅ | |
| `total_rev_hi_lim` | `total_rev_hi_lim` | float | 0 – 9 999 999 | ✅ | |
| `acc_open_past_24mths` | `acc_open_past_24mths` | int | 0 – 60 | ✅ | |
| `num_accts_ever_120_pd` | `num_accts_ever_120_pd` | int | 0 – 40 | ✅ | |
| `num_rev_accts` | `num_rev_accts` | int | 0 – 120 | ✅ | |
| `num_tl_op_past_12m` | `num_tl_op_past_12m` | int | 0 – 30 | ✅ | |
| `tot_hi_cred_lim` | `tot_hi_cred_lim` | float | 0 – 9 999 999 | ✅ | |
| `total_bal_ex_mort` | `total_bal_ex_mort` | float | 0 – 9 999 999 | ✅ | |

---

### 3.2 Derived Features

#### `earliest_cr_line` → `cr_line_age_years` (index 20)

| Property | Value |
|---|---|
| Raw type | `str` — format `"Mon-YYYY"` e.g. `"Jan-2000"` or `"2000-01"` |
| Output type | `float` (years, 1 decimal) |
| Formula | `(reference_date.year - parsed_year) + (reference_date.month - parsed_month) / 12` |
| Reference date | **Date of prediction** (use `datetime.today()` at inference time) |
| Valid range | 0 – 60 years (clip at 60) |
| On parse error | Raise `ValueError` — do not silently impute |

```python
from datetime import datetime

def earliest_cr_line_to_age(raw: str, ref_date=None) -> float:
    ref = ref_date or datetime.today()
    for fmt in ("%b-%Y", "%Y-%m", "%m/%Y"):
        try:
            dt = datetime.strptime(raw.strip(), fmt)
            age = (ref.year - dt.year) + (ref.month - dt.month) / 12
            return round(min(max(age, 0.0), 60.0), 4)
        except ValueError:
            continue
    raise ValueError(f"Cannot parse earliest_cr_line: {raw!r}")
```

---

### 3.3 Categorical → One-Hot Encoding

> Drop-first columns are **absent** from the feature list. When a value maps to the dropped category, all OHE columns for that group are 0.

#### `home_ownership` (indices 21–23)

| Allowed value | `_MORTGAGE` | `_OWN` | `_RENT` |
|---|---|---|---|
| `"MORTGAGE"` | 1 | 0 | 0 |
| `"OWN"` | 0 | 1 | 0 |
| `"RENT"` | 0 | 0 | 1 |
| `"OTHER"` | 0 | 0 | 0 | ← dropped category |
| `"NONE"` | 0 | 0 | 0 | ← treated as OTHER |
| `"ANY"` | 0 | 0 | 0 | ← treated as OTHER |

**Allowed raw values:** `MORTGAGE`, `OWN`, `RENT`, `OTHER`, `NONE`, `ANY`  
**Normalisation:** uppercase + strip before matching.

---

#### `verification_status` (indices 24–25)

| Allowed value | `_Source Verified` | `_Verified` |
|---|---|---|
| `"Not Verified"` | 0 | 0 | ← dropped category |
| `"Source Verified"` | 1 | 0 |
| `"Verified"` | 0 | 1 |

**Allowed raw values:** `Not Verified`, `Source Verified`, `Verified`  
**Normalisation:** title-case + strip before matching.

---

#### `purpose` (indices 26–36)

| Allowed value | Dropped? |
|---|---|
| `car` | ✅ dropped (all zeros) |
| `credit_card` | index 26 |
| `debt_consolidation` | index 27 |
| `home_improvement` | index 28 |
| `house` | index 29 |
| `major_purchase` | index 30 |
| `medical` | index 31 |
| `moving` | index 32 |
| `other` | index 33 |
| `renewable_energy` | index 34 |
| `small_business` | index 35 |
| `vacation` | index 36 |

**Allowed raw values:** `car`, `credit_card`, `debt_consolidation`, `home_improvement`, `house`, `major_purchase`, `medical`, `moving`, `other`, `renewable_energy`, `small_business`, `vacation`  
**Normalisation:** lowercase + strip + replace spaces with `_`.

---

## 4 · Missing Value Policy

| Column | Allowed to be NaN? | Imputation |
|---|---|---|
| All numeric | ❌ | Raise `ContractViolation` — caller must impute upstream |
| `home_ownership` | ❌ | — |
| `verification_status` | ❌ | — |
| `purpose` | ❌ | — |
| `earliest_cr_line` | ❌ | — |

> **No automatic imputation** in the contract layer. Clean data must arrive here.

---

## 5 · Output Contract

| Field | Type | Description |
|---|---|---|
| Raw score | `float` | Direct RF regressor output |
| Grade | `str` | Result of `map_profile_score_to_grade(score)` → one of `A`, `B`, `C`, `D`, `E`, `F`, `G` |

---

## 6 · Validation Errors

Errors raised by `feature_contract.py`:

| Code | Meaning |
|---|---|
| `MISSING_COLUMN` | Required raw column absent from input |
| `NULL_VALUE` | Column contains NaN / None |
| `OUT_OF_RANGE` | Numeric value outside valid bounds (before clipping) |
| `INVALID_CATEGORY` | Categorical value not in allowed set |
| `PARSE_ERROR` | `earliest_cr_line` cannot be parsed |
| `FEATURE_ORDER_MISMATCH` | Produced vector does not match 37-column frozen order |

---

## 7 · Reference

| | |
|---|---|
| Model file | `model.pkl` |
| Model version | `1.0.0` |
| SHA-256 | `1ac5c13683d64a163cbd1a192f7174262549f8f29e9ba94fdb85654bb047659e` |
| sklearn version | `1.6.1` |
| Validator | `feature_contract.py` |
| Machine schema | `feature_contract.json` |
| Contract version | `1.0.0` |
| Frozen on | 2026-02-26 |
