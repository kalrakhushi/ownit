# OwnIt - Complete Feature List

## 📱 **Core Pages & Navigation**

### 1. **Dashboard** (`/dashboard`)
- Main landing page with health data overview
- Data upload interface (CSV + Quick Entry)
- Wearable integration card
- Risk alerts display
- Data comparison views
- Health charts visualization
- Data table with all records

### 2. **Streaks** (`/streaks`)
- Streak tracking for daily health logging
- Current streak display
- Longest streak history
- Visual streak indicators

### 3. **Insights** (`/insights`)
- AI-powered pattern detection
- Correlation analysis between metrics
- Temporal patterns (weekday vs weekend)
- Trend detection
- Anomaly identification
- Pattern confidence scoring

### 4. **Coach** (`/coach`)
- AI-powered chat interface
- Personal health coach conversations
- Data-driven insights and explanations
- Google Generative AI integration
- Markdown-formatted responses

### 5. **Goals** (`/goals`)
- Challenge system with multiple types:
  - Steps challenges
  - Sleep challenges
  - Calories challenges
  - Protein challenges
  - Streak challenges
  - Consistency challenges
- Active challenges tracking
- Available challenges to start
- Completed challenges history
- Progress visualization
- Rewards & badges system
- Points accumulation

### 6. **Mood** (`/mood`)
- Daily mood logging (1-10 scale)
- Energy level tracking
- Stress level tracking
- Reflection/journal entries
- Tags for mood entries
- Mood history timeline
- Visual mood charts

### 7. **Influencers** (`/influencers`)
- Video submission interface
- Support for hosted video links (YouTube, Vimeo, etc.)
- Local file upload from Downloads
- Video preview functionality
- Description/notes for videos
- Session-based storage (ready for backend integration)

### 8. **ML Predictions** (`/ml`)
- Machine learning predictions for:
  - Steps
  - Sleep hours
  - Calories
  - Weight
- Linear regression predictions
- Moving average forecasts
- Confidence scoring
- Trend indicators (increasing/decreasing/stable)

---

## 🗄️ **Database Schema**

### Tables:
1. **HealthRecord** - Core health metrics
   - Date, weight, steps, sleep, calories, protein
   - Timestamps for creation/updates

2. **WearableSample** - Wearable device data
   - Source (apple_health, fitbit, google_fit, myfitnesspal)
   - Type (steps, calories, sleep, heart_rate, distance, nutrition)
   - Time ranges, values, units, metadata
   - Unique constraint for deduplication

3. **Streak** - Streak tracking
   - Current streak, longest streak
   - Last active date, streak start date

4. **Calendar** - Event calendar
   - Dates, titles, descriptions
   - Event types (goal, reminder, milestone, custom)
   - Color coding

5. **MoodEntry** - Mood tracking
   - Date, mood (1-10), energy, stress
   - Reflection text, tags

6. **Challenge** - Challenge definitions
   - Title, description, type
   - Target value, duration
   - Reward points, badges
   - Active status

7. **ChallengeProgress** - User challenge progress
   - Challenge ID, start date
   - Current progress, target value
   - Completion status, completion date

8. **Reward** - Rewards earned
   - Type (badge, points, achievement)
   - Title, description, icon
   - Points awarded
   - Linked challenge ID

---

## 🔌 **API Endpoints**

### 1. **Health Records** (`/api/health-records`)
- `GET` - Fetch all health records
- `POST` - Create single or batch health records

### 2. **Wearables** (`/api/wearables`)
- `GET` - Fetch wearable samples (filter by source/type, limit)
- `POST` - Ingest wearable data (batch support, deduplication)

### 3. **Streaks** (`/api/streaks`)
- `GET` - Get current streak information
- `POST` - Update streak data

### 4. **Challenges** (`/api/challenges`)
- `GET` - Get all challenges with progress
- `POST` - Start a new challenge

### 5. **Mood** (`/api/mood`)
- `GET` - Fetch all mood entries
- `POST` - Create new mood entry

### 6. **Patterns** (`/api/patterns`)
- `GET` - Detect patterns in health data
- Returns correlation, temporal, trend, and anomaly patterns

### 7. **Predictions** (`/api/predictions`)
- `GET` - Generate ML predictions
- Query parameter: `metric` (steps, sleep, calories, weight, or "all")
- Returns predictions with confidence and trends

### 8. **Risk Alerts** (`/api/risk-alerts`)
- `GET` - Detect health risks
- Returns alerts with severity levels (low/medium/high)
- Categories: sleep, activity, nutrition, weight, mood, consistency

### 9. **Comparison** (`/api/comparison`)
- `GET` - Compare periods (e.g., last 7 days vs previous 7 days)
- Returns percentage changes and insights

### 10. **Chat** (`/api/chat`)
- `POST` - AI chat endpoint
- Uses Google Generative AI
- Context-aware health data analysis

---

## 🎨 **UI Components**

### Data Management:
- **DataUploader** - CSV upload + quick entry form
- **DataTable** - Tabular health data display
- **DashboardOverview** - Summary cards with key metrics
- **HealthCharts** - Recharts-based visualizations

### Analytics & Insights:
- **PatternInsights** - Pattern detection results display
- **PredictionCard** - ML prediction visualization
- **RiskAlerts** - Health risk alert cards
- **ComparisonView** - Period comparison display

### Gamification:
- **ChallengeCard** - Challenge display with progress bars
- **RewardsDisplay** - Points and badges showcase
- **StreakTracker** - Visual streak indicators

### Social & Content:
- **InfluencerSubmissionCard** - Video submission interface
- **WearableIntegrationCard** - Integration instructions

### Communication:
- **ChatBot** - AI chat interface with markdown support
- **MoodLogger** - Daily mood entry form
- **MoodHistory** - Mood timeline visualization

### Navigation:
- **BottomNav** - Fixed bottom navigation bar
- **Section** - Reusable section wrapper
- **TogglePanel** - Collapsible content panels

---

## 🧠 **AI & ML Features**

### Pattern Detection:
- **Correlation Analysis** - Pearson correlation between metrics
- **Temporal Patterns** - Weekend vs weekday behavior
- **Trend Detection** - Long-term increases/decreases
- **Anomaly Detection** - Unusual data points
- **Time-lagged Correlations** - e.g., sleep affecting next day's steps

### Risk Detection:
- **Sleep Risks** - Insufficient sleep, irregular patterns
- **Activity Risks** - Low step counts, sedentary behavior
- **Nutrition Risks** - Calorie deficits, protein intake
- **Weight Risks** - Rapid changes, unhealthy trends
- **Consistency Risks** - Missing data, irregular logging

### Predictions:
- **Linear Regression** - Trend-based forecasting
- **Moving Average** - Recent average predictions
- **Confidence Scoring** - Based on data consistency
- **Trend Indicators** - Increasing/decreasing/stable

### AI Coach:
- **Context-Aware Chat** - Uses health data for responses
- **Natural Language Processing** - Google Generative AI
- **Markdown Support** - Formatted responses
- **Conversation History** - Maintains chat context

---

## 📊 **Data Visualization**

- **Line Charts** - Time series data (steps, sleep, calories, weight)
- **Bar Charts** - Comparison views
- **Progress Bars** - Challenge progress
- **Summary Cards** - Key metrics at a glance
- **Trend Indicators** - Visual up/down arrows
- **Confidence Meters** - Prediction reliability

---

## 🔗 **Integrations**

### Wearable Devices:
- **Apple Health** - HealthKit integration ready
- **Fitbit** - API integration ready
- **Google Fit** - API integration ready
- **MyFitnessPal** - Nutrition data integration ready

### Data Sources:
- **CSV Import** - Bulk data upload
- **Quick Entry** - Manual daily logging
- **Wearable API** - Automated data ingestion

---

## 🎯 **Gamification Features**

- **Challenges** - Multiple challenge types
- **Points System** - Earn points for completing challenges
- **Badges** - Achievement badges
- **Streaks** - Daily logging streaks
- **Progress Tracking** - Visual progress indicators
- **Rewards Display** - Showcase earned rewards

---

## 🛠️ **Technical Stack**

### Frontend:
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend:
- **Next.js API Routes** - Serverless API
- **Drizzle ORM** - Database ORM
- **SQLite** - Database (via better-sqlite3)
- **Google Generative AI** - AI chat

### Data Processing:
- **PapaParse** - CSV parsing
- **Custom ML Algorithms** - Pattern detection, predictions
- **Statistical Analysis** - Correlation, regression

---

## 📝 **Data Entry Methods**

1. **CSV Upload** - Bulk import historical data
2. **Quick Entry** - Daily manual logging form
3. **Wearable Integration** - Automated sync from devices
4. **Mood Logger** - Daily mood/energy/stress tracking

---

## 🔒 **Data Management**

- **Deduplication** - Prevents duplicate wearable samples
- **Data Validation** - Input validation and sanitization
- **Error Handling** - Graceful error messages
- **Loading States** - User feedback during operations
- **Auto-refresh** - Data updates after operations

---

## 🎨 **User Experience**

- **Responsive Design** - Mobile-friendly layout
- **Bottom Navigation** - Easy page switching
- **Loading Indicators** - Visual feedback
- **Empty States** - Helpful messages when no data
- **Success Messages** - Confirmation feedback
- **Error Messages** - Clear error communication

---

## 📈 **Analytics Capabilities**

- **Period Comparisons** - Compare time ranges
- **Trend Analysis** - Identify long-term patterns
- **Correlation Discovery** - Find metric relationships
- **Risk Assessment** - Health risk identification
- **Predictive Analytics** - Future value forecasting
- **Pattern Recognition** - Behavioral pattern detection

---

## 🚀 **Future-Ready Features**

- **Video Storage Integration** - Ready for S3/cloud storage
- **Backend API Hooks** - Placeholder for persistence
- **Moderation System** - Ready for content review
- **Multi-user Support** - Database schema supports expansion
- **Calendar Integration** - Event system in place

---

## 📱 **Mobile-First Design**

- Bottom navigation optimized for thumb reach
- Responsive grid layouts
- Touch-friendly form inputs
- Mobile-optimized charts
- Swipe-friendly interfaces

---

This is a comprehensive health tracking and analytics platform with AI-powered insights, gamification, and wearable device integration capabilities!
