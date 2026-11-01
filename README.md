# E-Commerce Customer Segmentation Using K-Means++

A production-quality machine learning web application built for the college CCE capstone project. The application faithfully implements unsupervised customer segmentation using **StandardScaler** and **K-Means++** clustering on the benchmark Mall Customers dataset (`Mall_Customers.csv`).

---

## 📌 Project Overview

Customer segmentation divides a heterogeneous customer base into distinct groups of individuals that share similar spending habits and income levels. By identifying these natural cohorts, retail and e-commerce businesses can design high-converting, personalized marketing strategies.

### Target Features
The unsupervised model clusters customers across a **2-dimensional feature space**:
1. **Annual Income (k$)**
2. **Spending Score (1-100)**

*Note: Demographics such as `Age` and `Gender` are tracked as descriptive profile attributes and are not fed into the K-Means clustering algorithm, preserving the original project methodology.*

---

## 🔬 Machine Learning Pipeline & Lifecycle

```text
Mall_Customers.csv (200 records)
       │
       ▼
Data Inspection & Schema Validation (0 missing values, 0 duplicate rows)
       │
       ▼
Feature Selection: [Annual Income (k$), Spending Score (1-100)]
       │
       ▼
StandardScaler (Z-Score Normalization: μ=0, σ=1)
       │
       ▼
Hyperparameter Evaluation:
├── Elbow Method (Inertia for K = 1 to 10)
└── Silhouette Analysis (Score for K = 2 to 10)
       │
       ▼
Final Model Selection:
KMeans(n_clusters=5, init="k-means++", n_init=10, random_state=42)
       │
       ▼
Dynamic Business Interpretation & Marketing Strategy Assignment
       │
       ▼
REST API & Real-Time Inference (Using the exact fitted scaler & centroids)
```

### Final Model Specifications
- **Algorithm**: K-Means with probabilistic centroid seeding (`k-means++`)
- **Clusters ($K$)**: `5`
- **Inits ($n\_init$)**: `10`
- **Random State**: `42`
- **Silhouette Score**: `~0.5547` (Peak across tested $K \in [2, 10]$)
- **Inertia at $K=5$**: `65.57`

### Dynamic Cluster Profiles Derived from Data
1. **High Income • High Spending** (*VIP / Premium Customer*): Exclusive offers, luxury loyalty perks, early access, and concierge service.
2. **High Income • Low Spending** (*Under-Engaged / Potential Target*): Premium product showcases, personalized value propositions, and targeted reactivation.
3. **Low Income • High Spending** (*Carefree / Value Spender*): Trendy budget bundles, flash sales, festive discount promotions, and reward points.
4. **Low Income • Low Spending** (*Budget-Conscious / Cautious Shopper*): Clearance deals, entry-level discount campaigns, and essential bulk offerings.
5. **Moderate Income • Moderate Spending** (*Mainstream / Core Customer*): Seasonal campaigns, cross-sell/up-sell incentives, and loyalty tiers.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**
- **Flask**: Lightweight RESTful API server
- **Flask-CORS**: Cross-origin resource sharing
- **Scikit-learn**: `StandardScaler`, `KMeans`, `silhouette_score`
- **Pandas & NumPy**: Data processing and statistical analysis

### Frontend
- **React 18**
- **Vite**: High-performance frontend build tool
- **Tailwind CSS**: Modern utility-first styling and dark mode UI
- **Recharts**: Responsive charting library for scatter, donut, line, and bar charts
- **Lucide React**: Clean, modern iconography

---

## 📂 Project Structure

```text
customer-segmentation-webapp/
├── backend/
│   ├── app.py                      # Flask REST API endpoints
│   ├── model/
│   │   ├── __init__.py
│   │   └── segmentation.py        # Dedicated ML service & lifecycle pipeline
│   ├── data/
│   │   └── Mall_Customers.csv      # Source dataset (200 records)
│   ├── requirements.txt            # Python dependencies
│   └── train_model.py              # Standalone training script
├── frontend/
│   ├── index.html                  # HTML5 entry with Inter font
│   ├── package.json                # Frontend dependencies & scripts
│   ├── vite.config.js              # Vite server & proxy configuration
│   ├── tailwind.config.js          # Tailwind theme tokens
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                # React DOM root
│       ├── App.jsx                 # App shell, routing & health management
│       ├── index.css               # Global Tailwind CSS and glassmorphism
│       ├── services/
│       │   └── api.js              # API client service layer
│       ├── components/
│       │   ├── Sidebar.jsx         # Modern navigation sidebar
│       │   ├── Header.jsx          # Top status bar & export actions
│       │   └── LoadingSpinner.jsx  # Polished loading states
│       └── pages/
│           ├── DashboardHome.jsx          # Executive KPI cards & scatter overview
│           ├── DatasetPage.jsx            # Searchable, sortable dataset table
│           ├── EdaPage.jsx                # Demographic & feature distributions
│           ├── ClusterAnalysisPage.jsx    # Interactive cluster visualization
│           ├── CustomerSegmentationPage.jsx# Live inference form & persona testing
│           ├── ModelEvaluationPage.jsx    # Elbow & Silhouette analysis
│           └── AboutProjectPage.jsx       # Academic background & limitations
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask API server
python app.py
```
The backend API will start at `http://127.0.0.1:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The React application will launch at `http://localhost:5173`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Model health status, records count, and algorithm metadata |
| `GET` | `/api/dashboard` | Consolidated overview KPIs, silhouette score, and cluster counts |
| `GET` | `/api/dataset` | Paginated, searchable, and sortable dataset with cluster tags |
| `GET` | `/api/statistics` | Numerical descriptive statistics & gender distribution |
| `GET` | `/api/eda` | Histograms and scatter data for exploratory analysis |
| `GET` | `/api/elbow` | Inertia values for $K \in [1, 10]$ |
| `GET` | `/api/silhouette` | Silhouette scores for $K \in [2, 10]$ |
| `GET` | `/api/clusters` | 2D coordinates for all customer points and centroids |
| `GET` | `/api/cluster-summary` | Dynamic cluster profiles, averages, and recommendations |
| `POST` | `/api/predict` | Predicts cluster for new customer inputs using fitted scaler |
| `GET` | `/api/results/export?type=customers` | Download `Customer_Segmentation_Results.csv` |
| `GET` | `/api/results/export?type=summary` | Download `Cluster_Summary.csv` |

### Sample Live Prediction Request
`POST /api/predict`
```json
{
  "age": 28,
  "gender": "Female",
  "income": 85,
  "spending_score": 82
}
```
**Response:**
```json
{
  "assigned_cluster": 1,
  "segment_name": "High Income • High Spending",
  "persona": "VIP / Premium Customer",
  "badge": "VIP Tier",
  "color": "#10B981",
  "distance_to_centroid": 0.1852,
  "marketing_strategy": "VIP loyalty perks, exclusive product launches, personalized concierge service, and premium brand rewards.",
  "cluster_statistics": {
    "centroid_income": 86.54,
    "centroid_spending": 82.13,
    "customer_count": 39,
    "percentage_of_mall": 19.5
  }
}
```

---

## ⚠️ Academic Disclosure & Dataset Limitations

> **Important Notice:**
> *"The current dataset is mall-customer information and does not represent real online transaction histories or RFM analysis."*

The benchmark dataset records mall visitor summary attributes rather than time-series transaction events. Consequently:
- Recency, Frequency, and Monetary (RFM) transaction dynamics are not present.
- Returns or cart abandonment behaviors are not captured.

### Future Scope
1. **Multi-Feature Clustering**: Expand feature vectors to include `Age` and browsed product categories.
2. **RFM Modeling**: Ingest live e-commerce transactional database feeds.
3. **Alternative Algorithms**: Benchmark K-Means++ against DBSCAN and Hierarchical Agglomerative Clustering.
4. **Automated CRM Integration**: Connect inferred clusters directly to personalized email marketing workflows.
