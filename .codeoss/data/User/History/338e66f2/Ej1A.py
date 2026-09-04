import os
import google.auth
from google.auth.transport.requests import Request
from google.adk.agents import LlmAgent
from google.adk.models import Gemini
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams

# 1. Autentikasi ADC untuk GCP
_application_default_credentials, project_id_adc = google.auth.default()
_request = Request()
if not _application_default_credentials.valid:
    _application_default_credentials.refresh(_request)

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", project_id_adc)
if not project_id:
    raise ValueError("GOOGLE_CLOUD_PROJECT environment variable is not set.")

def _adc_auth_header_provider(context=None) -> dict[str, str]:
    if not _application_default_credentials.valid:
        _application_default_credentials.refresh(_request)

    return {
        "Authorization": f"Bearer {_application_default_credentials.token}",
        "x-goog-user-project": project_id
    }

# 2. Inisialisasi MCP Toolset BigQuery
bigquery_toolset = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="https://bigquery.googleapis.com/mcp",
        tool_filter=[
            'get_dataset_info',
            'list_table_ids',
            'get_table_info',
            'execute_sql_readonly',
        ]
    ),
    header_provider=_adc_auth_header_provider
)

# 3. PERBAIKAN MODEL: Gunakan Gemini Provider VertexAI resmi (Bukan string typo)
model = Gemini(
    model_name="gemini-1.5-flash",
    provider="vertexai"
)

# 4. System Instruction
system_instruction = f"""
You are a helpful assistant that can answer questions about data in BigQuery.
To answer the user's question, use data you have access to by using tools `list_table_ids` and `get_table_info`.
Your data is in `bigquery-public-data.new_york_citibike` dataset (Citi Bike trips and stations in the NYC area.)

Plan of action:
0. ALWAYS start by analyzing dataset.
1. Analyze your data, investigate schema and dimensions by querying distinct values of columns using `execute_sql_readonly`.
   Output information about tables, columns, their data types and sets of values (for dimensions).
   Note which columns can be joined or used in aggregations/filters, and what type conversion may be needed for joining or aggregating.
   DO NOT MAKE ASSUMPTIONS ABOUT DATA. ALWAYS VERIFY YOUR ASSUMPTIONS.
2. Understand and interpret the user's question.
3. Formulate a plan to answer the user's question.
4. Write a SQL query to retrieve relevant data in necessary form.
5. Retrieve data by generating BigQuery SQL and using `execute_sql_readonly`.
   Use `{project_id}` to run BigQuery queries (`project_id` parameter of `execute_sql_readonly`).

Do not use LaTeX in your responses. When giving a final answer, use Markdown.
"""

# 5. Inisialisasi LlmAgent
root_agent = LlmAgent(
    model=model,
    name="data_agent",
    instruction=system_instruction,
    description="A helpful assistant that can answer questions using NYC Citibike data.",
    tools=[bigquery_toolset]
)