#!/bin/bash
export GEMINI_API_KEY="AQ.Ab8RN6JGVeaoQ9MLQFEVC4Im_a0JESWkT8NteFXdbhrY4Bks7g"

uv tool run --from google-adk==2.4.0 adk deploy cloud_run data-agent \
  --with_ui \
  --project $GOOGLE_CLOUD_PROJECT \
  --region us-central1 \
  --service_name bq-data-agent \
  --app_name data_agent \
  -- \
  --allow-unauthenticated \
  --max-instances 1 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY,GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT,GOOGLE_CLOUD_LOCATION=us-central1
