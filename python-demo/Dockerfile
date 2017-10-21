FROM python
RUN pip install requests
RUN pip install flask
COPY . /app
WORKDIR /app
ENTRYPOINT ["python"]
CMD ["app.py"]