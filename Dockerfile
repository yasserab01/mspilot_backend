# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables to reduce Python bytecode files and buffer I/O for stdout and stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container to /code
WORKDIR /code

# Copy the requirements file from your host to the container's working directory
COPY requirements.txt /code/

# Install dependencies using pip directly from the requirements.txt file
RUN pip install --no-cache-dir -r requirements.txt


# Copy the rest of your application's code from your host to the container's working directory
COPY . /code/

# run migrations
RUN python manage.py makemigrations
RUN python manage.py migrate

# collect static files
# RUN python manage.py collectstatic --noinput

EXPOSE 8000
