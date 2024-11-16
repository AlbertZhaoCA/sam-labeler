FROM ubuntu

LABEL authors="albert"

RUN apt-get update && apt-get install -y python3.10 python3-pip && apt-get install git --progress
WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]