import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { closeDb, createDb, runMigrations } from "../src/db/client";
import { passwordProblem } from "../src/lib/password";
import { sessionSecretProblem } from "../src/lib/session";
import {
  education,
  experiences,
  posts,
  projects,
  settings,
  skillGroups,
  users,
} from "../src/db/schema";

/**
 * Idempotent seed:
 * - creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist
 * - loads the starter portfolio content only on the very first run
 *   (when the settings row does not exist yet), so later edits are never overwritten.
 */
async function main() {
  // Fail the deploy early rather than letting sign-in break at runtime.
  if (process.env.VERCEL) {
    const problems = [
      sessionSecretProblem(),
      !process.env.ADMIN_EMAIL?.trim() && "ADMIN_EMAIL is not set.",
      !process.env.ADMIN_PASSWORD && "ADMIN_PASSWORD is not set.",
    ].filter(Boolean);
    if (problems.length) {
      throw new Error(`Missing Vercel environment variables:\n- ${problems.join("\n- ")}\nAdd them in Project Settings > Environment Variables (Production), then redeploy.`);
    }
  }

  const db = await createDb();
  await runMigrations(db);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const problem = passwordProblem(password);
    if (problem) throw new Error(problem);
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      await db.insert(users).values({ email, passwordHash: await bcrypt.hash(password, 12) });
      console.log(`Created admin user ${email}.`);
    } else {
      await db.update(users).set({ passwordHash: await bcrypt.hash(password, 12) }).where(eq(users.email, email));
      console.log(`Updated admin password for ${email}.`);
    }
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin user created.");
  }

  const existingPublished = await db.select({ id: posts.id }).from(posts).where(eq(posts.published, true));
  if (existingPublished.length === 0) {
    await db.insert(posts).values([
      {
        title: "Designing an End-to-End Event Ingestion Pipeline: GA4, BigQuery, and dbt",
        slug: "event-ingestion-ga4-bigquery-dbt",
        excerpt: "A comprehensive breakdown of streaming client and server-side events into BigQuery, applying dimensional modelling with dbt, and serving production Power BI reports.",
        tags: ["Data Pipelines", "BigQuery", "dbt", "GA4"],
        published: true,
        publishedAt: new Date("2026-08-15T10:00:00Z"),
        content: `Modern digital products produce millions of granular user interactions every day. Without a deliberate data architecture, teams end up with fragmented metrics, slow queries, and untrusted reports.

In this article, I break down the architecture I implemented to ingest marketing and user events at scale, model them in BigQuery using dbt, and provide actionable analytics to growth and engineering teams.

## 1. Architecture Overview & Ingestion Strategy

The objective was to create a resilient, low-latency pipeline capable of handling event spikes without schema fragility. Rather than relying on rigid batch dumps, we adopted an event-driven ingestion flow:

- **Client Tracking:** Google Tag Manager (GTM) captures interaction payloads (clicks, form submissions, purchases).
- **Streaming Pipeline:** Raw events stream directly into Google BigQuery partitioned tables.
- **Transformation Layer:** dbt (data build tool) orchestrates incremental transformations and enforces schema tests.
- **Consumption Layer:** Power BI dashboards and downstream ML feature stores.

> "The golden rule of modern analytics engineering: capture raw data idempotently, model incrementally, and test assumptions before data reaches stakeholders."

## 2. Event Taxonomy & Payload Normalization

Before streaming data, establishing a strict naming taxonomy is critical. Inconsistent event names (e.g. \`user_signup\` vs \`UserSignedUp\`) quickly degrade downstream analytics.

We standardized events with the following common schema:

| Field Name | Type | Description |
|---|---|---|
| \`event_timestamp\` | TIMESTAMP | UTC microsecond timestamp when event triggered |
| \`event_id\` | STRING | Unique UUID generated on client/server |
| \`user_pseudo_id\` | STRING | Anonymous device or session identifier |
| \`user_id\` | STRING | Authenticated customer identifier (nullable) |
| \`event_name\` | STRING | Snake_case event identifier (e.g., checkout_completed) |
| \`event_params\` | RECORD / JSON | Key-value pairs for contextual attributes |

## 3. BigQuery Streaming & Partition Pruning

Ingesting millions of rows into a data warehouse can become expensive if partitioning is neglected. We implemented ingestion-time partitioning combined with clustering on \`event_name\` and \`user_pseudo_id\`:

\`\`\`sql
CREATE OR REPLACE TABLE \`analytics_prod.events_raw\`
PARTITION BY DATE(event_timestamp)
CLUSTER BY event_name, user_pseudo_id
OPTIONS(
  partition_expiration_days = 730,
  require_partition_filter = true
);
\`\`\`

By enforcing \`require_partition_filter = true\`, all downstream queries must specify a date range, eliminating accidental full-table scans that would cost hundreds of dollars per query.

## 4. Incremental Transformations with dbt

We structured our dbt repository into three clean layers:

1. **Staging (\`stg_\`):** Unpacks JSON arrays, standardizes column types, and handles deduplication.
2. **Intermediate (\`int_\`):** Joins sessions, computes dwell times, and attributes acquisition channels.
3. **Marts (\`fct_\`, \`dim_\`):** Star-schema tables optimized for BI tools and ad-hoc analyst SQL.

Here is an example dbt incremental model used for user session aggregation:

\`\`\`sql
{{
  config(
    materialized = 'incremental',
    unique_key = 'session_id',
    partition_by = {
      "field": "session_start_date",
      "data_type": "date"
    }
  )
}}

with source_events as (
  select
    user_pseudo_id,
    event_timestamp,
    cast(event_timestamp as date) as session_start_date,
    event_name,
    (select value.string_value from unnest(event_params) where key = 'session_id') as session_id
  from {{ ref('stg_events_raw') }}
  {% if is_incremental() %}
    where event_timestamp >= (select max(event_timestamp) from {{ this }})
  {% endif %}
)

select
  session_id,
  user_pseudo_id,
  min(event_timestamp) as session_start,
  max(event_timestamp) as session_end,
  count(distinct event_name) as unique_actions,
  count(*) as total_events
from source_events
group by 1, 2;
\`\`\`

## 5. Automated Data Quality & Schema Contracts

To ensure dashboard consumers never see broken numbers, we set up continuous data testing in our CI/CD pipeline:

- **Uniqueness & Non-null:** Ensured primary keys (\`event_id\`, \`session_id\`) never duplicate.
- **Freshness Alerts:** Alerted on Slack if BigQuery received no new records for over 15 minutes.
- **Accepted Values:** Validated enum fields such as \`checkout_status\` against approved business values.

## 6. Business Impact & Performance Gains

Shifting to this architecture delivered measurable operational improvements:

- **Query Speed:** 78% reduction in p95 query latency for business intelligence dashboards.
- **Cloud Costs:** Reduced monthly BigQuery compute costs by 42% through partition pruning and incremental dbt builds.
- **Stakeholder Confidence:** Automated tests eliminated reporting discrepancies between marketing and finance.

## 7. Key Takeaways for Data Engineers

Building reliable data products requires treating data as code. Key lessons from this implementation:

1. Never allow unvalidated payloads directly into business-facing data marts.
2. Structure your warehouse into immutable raw layers and well-documented transformation layers.
3. Always partition and cluster early — retrofitting partition logic on terabyte tables is costly.
`,
      },
      {
        title: "Time Series Forecasting in Production: ARIMA vs. Prophet for Demand Planning",
        slug: "time-series-forecasting-production",
        excerpt: "A pragmatic evaluation of statistical time-series models versus Facebook Prophet on retail demand data, exploring seasonality, hyperparameter tuning, and real-world deployment.",
        tags: ["Machine Learning", "Python", "Forecasting", "Time Series"],
        published: true,
        publishedAt: new Date("2026-09-02T14:30:00Z"),
        content: `Accurate demand forecasting is the backbone of supply chain management, workforce scheduling, and inventory planning. In this article, I share empirical findings from building forecasting models for retail volume datasets, comparing classical statistical methods with modern additive decomposition.

## 1. Problem Framing & Dataset Characteristics

The objective was to forecast weekly loan application and retail demand volume across multi-region branches. The dataset presented three distinct characteristics:

- **Strong Weekly Seasonality:** Significant volume spikes on Mondays and Tuesdays.
- **Holiday Volatility:** Pronounced dips during national holidays and bank closures.
- **Trend Shifts:** Macroeconomic policy adjustments causing abrupt baseline shifts.

## 2. Testing for Stationarity

Before fitting classical models like ARIMA, the time series must be stationary (constant mean and variance over time). We performed the Augmented Dickey-Fuller (ADF) test:

\`\`\`python
from statsmodels.tsa.stattools import adfuller

def check_stationarity(timeseries):
    result = adfuller(timeseries.dropna())
    print(f'ADF Statistic: {result[0]:.4f}')
    print(f'p-value: {result[1]:.4f}')
    return result[1] <= 0.05
\`\`\`

Because the raw series was non-stationary ($p > 0.05$), first-order differencing ($d = 1$) was applied to stabilize the mean.

## 3. Evaluating SARIMA vs. Prophet

We compared two primary model architectures:

### Seasonal ARIMA (SARIMA)
SARIMA extends ARIMA by incorporating seasonal terms: \`SARIMA(p, d, q) x (P, D, Q)s\`.

- **Strengths:** Statistically rigorous, highly interpretable parameters, lightweight memory footprint.
- **Weaknesses:** Computationally intensive grid searches for optimal orders, sensitive to missing data points.

### Facebook Prophet
An additive regression model decomposing trend, multi-period seasonality, and holiday effects:

- **Strengths:** Robust to missing dates, built-in holiday calendars, rapid prototyping.
- **Weaknesses:** Prone to overfitting non-linear trends if saturation capacities are misconfigured.

## 4. Comparative Model Performance

We trained both models using walk-forward validation across a 12-week test horizon:

| Model Architecture | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Mean Absolute Percentage Error (MAPE) | Training Time |
|---|---|---|---|---|
| **SARIMA(1,1,2)(1,1,1)[52]** | **142.3** | **184.6** | **6.2%** | 4.8s |
| Facebook Prophet | 168.1 | 212.4 | 8.4% | 1.2s |
| Naive Baseline (Lag 1) | 310.5 | 398.2 | 14.8% | <0.1s |

SARIMA demonstrated superior precision on regular weekly cycles, while Prophet excelled when custom holiday regressors were injected during peak retail quarters.

## 5. Deployment Architecture with Streamlit & Docker

To make predictions usable by operations teams, we containerized the Python forecasting engine and exposed it via an interactive Streamlit UI:

1. **Scheduled Batch Retraining:** An automated workflow checks model drift every Sunday night and retrains on the latest 24 months of data.
2. **Interactive UI:** Branch managers can adjust scenarios (e.g. promotional discounts or regional events) to inspect confidence intervals.
3. **Automated Export:** Predictions sync into Google Sheets and BigQuery for downstream ERP consumption.

## 6. Conclusion & Recommendations

For operational demand forecasting:
- If your data has clear cyclical periodicity and low noise, tuned **SARIMA** remains remarkably competitive.
- For business datasets with erratic holidays and marketing campaign spikes, **Prophet with custom regressors** reduces maintenance overhead.
`,
      },
    ]).onConflictDoNothing({ target: posts.slug });
    console.log("Seeded published technical articles.");
  }

  const [existingSettings] = await db.select({ id: settings.id }).from(settings);
  if (existingSettings) {
    console.log("Settings already seeded; leaving untouched.");
    await closeDb(db);
    return;
  }

  await db.insert(settings).values({
    id: 1,
    firstName: "Ifiok",
    lastName: "",
    brand: "Ifiok.",
    role: "Data Engineer & Analyst",
    location: "Based in the United Kingdom",
    eyebrow: "Data Engineer · Python · SQL · BigQuery",
    headline: "Building data pipelines teams can trust",
    intro:
      "I design tracking plans, warehouse models and reporting layers that turn scattered event and operational data into dashboards people actually rely on.",
    about: [
      "I build the plumbing behind reliable reporting: tracking plans that capture the right events, warehouse models that keep definitions consistent, and dashboards that teams use to make decisions. My work spans GA4 and Tag Manager instrumentation, SQL in BigQuery, Python transformation and forecasting, and Power BI reporting.",
      "I hold an MSc in Artificial Intelligence and Data Science (Distinction) from the University of Hull. I started out in engineering, which is where I learned to care about systems that hold up under real-world load.",
    ].join("\n\n"),
    contactEyebrow: "Open to data engineering roles",
    contactHeading: "Have data that needs a dependable pipeline?",
    contactText: "I'm happy to talk about roles, contracts or a project you're scoping.",
    footerTagline: "Python · SQL · BigQuery · Power BI",
    seoDescription:
      "Data engineer building tracking plans, BigQuery warehouse models and Power BI reporting that teams can trust.",
  });

  await db.insert(skillGroups).values([
    { title: "Ingestion & Tracking", icon: "ingest", sortOrder: 1, items: ["GA4 & Google Tag Manager", "Custom event design", "n8n workflow automation", "Node.js"] },
    { title: "Storage & Warehousing", icon: "storage", sortOrder: 2, items: ["Google BigQuery", "SQL data modelling", "Data quality checks"] },
    { title: "Transformation", icon: "transform", sortOrder: 3, items: ["Python", "Power Query (M)", "DAX measures", "Cleaning & deduplication"] },
    { title: "Analytics & ML", icon: "analytics", sortOrder: 4, items: ["Power BI dashboards", "ARIMA / SARIMA forecasting", "Streamlit apps", "A/B test support"] },
  ]);

  await db.insert(projects).values([
    { sortOrder: 1, category: "Pipelines", thumbnail: "flow", slug: "marketing-event-data-pipeline", title: "Marketing Event Data Pipeline", tags: ["GA4", "GTM", "BigQuery", "SQL"], description: "Instrumented GA4 and Google Tag Manager (tags, triggers, custom events), landed the data in BigQuery, modelled it in SQL and served Power BI dashboards to product and acquisition teams." },
    { sortOrder: 2, category: "Pipelines", thumbnail: "flow", slug: "loan-dataset-cleaning", title: "Loan Dataset Cleaning", tags: ["Python", "Data quality", "Dedup"], description: "A repeatable cleaning pass on a Nigerian loan dataset: record de-duplication and standardised phone number formats, ready for downstream analysis." },
    { sortOrder: 3, category: "Machine Learning", thumbnail: "chart", slug: "demand-forecasting-models", title: "Demand Forecasting Models", tags: ["Python", "SARIMA", "Time series"], description: "ARIMA and SARIMA models in Python that capture trend and seasonality in volume data, feeding capacity and operational planning." },
    { sortOrder: 4, category: "Analytics", thumbnail: "grid", slug: "school-performance-reporting", title: "School Performance Reporting", tags: ["Power Query", "DAX", "Power BI"], description: "KS2 results shaped with Power Query transformations and custom DAX measures into a multi-page Power BI report and companion Excel workbook." },
    { sortOrder: 5, category: "Analytics", thumbnail: "chart", slug: "world-cup-2026-player-dashboard", title: "World Cup 2026 Player Dashboard", tags: ["HTML", "SVG", "JavaScript"], description: "An interactive HTML dashboard with hand-built SVG charts comparing players across performance dimensions." },
    { sortOrder: 6, category: "Machine Learning", thumbnail: "grid", slug: "hiring-prediction-tool", title: "Hiring Prediction Tool", tags: ["Python", "Streamlit", "ML"], description: "A machine learning model wrapped in a Streamlit app that scores candidates to support hiring decisions." },
  ]);

  // Dates the design left as placeholders stay empty; fill them in from the admin.
  await db.insert(experiences).values([
    { sortOrder: 1, role: "AI Trainer & Evaluator", company: "Mercor", startDate: null, endDate: null },
    { sortOrder: 2, role: "Technical Founder & Marketing Analyst", company: "Reenite", startDate: null, endDate: null },
    { sortOrder: 3, role: "Marketing Analyst", company: "Digitstem Limited", startDate: null, endDate: null },
    { sortOrder: 4, role: "Data Analytics Lead Instructor", company: "Tekskillup Academy", startDate: null, endDate: null },
  ]);

  await db.insert(education).values([
    { sortOrder: 1, degree: "MSc Artificial Intelligence & Data Science (Distinction)", institution: "University of Hull" },
    { sortOrder: 2, degree: "BEng", institution: "", endYear: "2021" },
  ]);

  await db.insert(posts).values({
    title: "Welcome to the blog",
    slug: "welcome",
    excerpt: "A draft post to show how the blog works. Edit or delete it from the admin.",
    content: "This is a **draft** post. Write in Markdown, add images from the editor, and publish when you're ready.\n\n## What you can use\n\n- Headings, lists and links\n- `inline code` and fenced code blocks\n- Tables\n\n```sql\nselect event_name, count(*) from events group by 1;\n```",
    tags: ["meta"],
    published: false,
  });

  console.log("Seeded starter content.");
  await closeDb(db);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
