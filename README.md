# ChatMina

A minimal, flat, elegant and formal white-themed conversational interface for the
**Mina1 Luna** and **Mina1 Numba** models (LoRA adapters fine-tuned from
`HuggingFaceTB/SmolLM2-360M`). The frontend is React + TypeScript + Vite; the model
service is a small FastAPI application.

## Architecture

```
Browser (ChatMina React app)
        │  HTTPS  (SSE streaming)
        ▼
GCS bucket (static website)  ──► Cloud Run service (FastAPI + torch CPU)
                                     │  reads at startup
                                     ▼
                               GCS bucket (LoRA adapters)
```

> **Important:** a Cloud Storage bucket is object storage. It can serve the built
> static website, but it cannot execute Python or load `torch`. The inference service
> therefore runs on **Cloud Run** (a container in the same Google Cloud project) and
> downloads the adapters from Cloud Storage when it starts.

## Project layout

```
ChatMina/
├── index.html
├── src/                     # React + TypeScript frontend
│   ├── components/
│   ├── hooks/
│   └── lib/
├── public/
├── server/                  # FastAPI model service
│   ├── app.py
│   ├── model_manager.py
│   ├── fetch_models.py
│   ├── entrypoint.sh
│   ├── Dockerfile
│   └── cloudbuild.yaml
└── .env.example
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.12+ (for local backend testing)
- Google Cloud SDK (`gcloud`, `gsutil`) authenticated to your project

Set the project once:

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com storage.googleapis.com artifactregistry.googleapis.com
```

## Local development

Frontend:

```bash
npm install
npm run dev
```

Backend (from the `server/` directory). Point the adapter variables at your local
`MiniModels` folders:

```bash
cd server
pip install -r requirements.txt
$env:MINA_LUNA_ADAPTER="C:/Users/Arthur/MiniModels/mina-luna-adapter/mina1-luna-smollm2-360m"
$env:MINA_NUMBA_ADAPTER="C:/Users/Arthur/MiniModels/mina-numba-adapter/mina1-numba-smollm2-360m"
uvicorn app:app --host 0.0.0.0 --port 8080
```

With the backend running, create a `.env` file (copy `.env.example`) and set
`VITE_API_BASE_URL=http://localhost:8080` so the local frontend calls it.

## 1. Build the frontend

```bash
npm install
npm run build
```

The production site is written to `dist/`. The build uses a relative base (`./`), so
the same files work at any bucket path.

## 2. Host the frontend on Cloud Storage

Create a bucket (skip if it already exists) and upload the build:

```bash
gsutil mb -l us-west1 gs://YOUR_WEB_BUCKET
gsutil -m rsync -r -d dist gs://YOUR_WEB_BUCKET
gsutil web set -m index.html -e index.html gs://YOUR_WEB_BUCKET
gsutil iam ch allUsers:objectViewer gs://YOUR_WEB_BUCKET
```

The site is then available at:

```
https://storage.googleapis.com/YOUR_WEB_BUCKET/index.html
```

(You can also map a custom domain or place a load balancer in front of the bucket.)

## 3. Upload the model adapters

Upload the two unzipped adapter folders to a private bucket:

```bash
gsutil mb -l us-west1 gs://YOUR_MODELS_BUCKET
gsutil -m rsync -r "C:/Users/Arthur/MiniModels/mina-luna-adapter/mina1-luna-smollm2-360m" gs://YOUR_MODELS_BUCKET/adapters/mina-luna
gsutil -m rsync -r "C:/Users/Arthur/MiniModels/mina-numba-adapter/mina1-numba-smollm2-360m" gs://YOUR_MODELS_BUCKET/adapters/mina-numba
```

## 4. Deploy the model service to Cloud Run

Build and submit using the provided pipeline (edit `server/cloudbuild.yaml` if your
bucket names differ), then deploy:

```bash
cd server
gcloud builds submit --config cloudbuild.yaml
```

Or deploy manually with a local container build:

```bash
gcloud run deploy chatmina-api `
  --source . `
  --region us-west1 `
  --port 8080 `
  --memory 2Gi --cpu 1 `
  --timeout 120 `
  --allow-unauthenticated `
  --set-env-vars "MINA_FETCH_MODELS=1,MINA_LUNA_GCS=gs://YOUR_MODELS_BUCKET/adapters/mina-luna,MINA_NUMBA_GCS=gs://YOUR_MODELS_BUCKET/adapters/mina-numba"
```

The Cloud Run runtime service account needs read access to the model bucket:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
  --member="serviceAccount:YOUR_PROJECT_ID-compute@developer.gserviceaccount.com" `
  --role="roles/storage.objectViewer"
```

## 5. Point the frontend at the backend

Get the service URL:

```bash
gcloud run services describe chatmina-api --region us-west1 --format "value(status.url)"
```

Set it before building the frontend, then rebuild and re-upload `dist/`:

```
# .env
VITE_API_BASE_URL=https://chatmina-api-xxxxxx-uw.a.run.app
```

If you serve the frontend through a reverse proxy that forwards `/v1/` to Cloud Run,
you can leave `VITE_API_BASE_URL` empty and call same-origin relative paths.

## 6. Lock down CORS (optional)

By default the API allows any origin. For production, restrict it to your site:

```bash
gcloud run services update chatmina-api --region us-west1 `
  --set-env-vars "MINA_CORS_ORIGINS=https://storage.googleapis.com,https://your-domain.example"
```

## Resource notes

- The base model is loaded once and both adapters are attached to it; requests switch
  the active adapter under a lock, so calls are serialized (appropriate for a small CPU
  service).
- Cloud Run **2 GiB memory / 1 CPU** is a practical starting point. First-request
  latency includes adapter download; subsequent warm instances start immediately.
- Conversation history is stored in the browser under the `chatmina.*` namespace and is
  not sent anywhere except the model API as part of each request.
