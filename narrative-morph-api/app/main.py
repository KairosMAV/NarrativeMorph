from fastapi import FastAPI

app = FastAPI(title="Narrative Morph API")

@app.get("/")
async def root():
    return {"message": "Welcome to Narrative Morph API"}

# TODO: Add endpoint for article processing
# Example:
# @app.post("/transform_article/")
# async def transform_article(url: str):
#     # Initialize CrewAI, agents, tasks
#     # Start the process
#     return {"message": "Article transformation started", "article_url": url}
