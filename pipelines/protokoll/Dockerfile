FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml ./
COPY src ./src
RUN pip install --no-cache-dir ".[bq]"
ENTRYPOINT ["python", "-m", "protokoll.run"]
