FROM python:3.12-slim

RUN pip install --no-cache-dir streamlit plotly pandas

WORKDIR /app
COPY . /app

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"]