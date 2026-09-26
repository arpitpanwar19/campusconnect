# Load Testing

Using [Locust](https://locust.io/) for load testing.

## Run

```bash
cd tests/load
locust -f locustfile.py --host http://localhost:8000 --headless -u 500 -r 50 --run-time 2m
```

## Metrics Tracked
- Average response time
- p95 response time  
- Error rate
- Requests per second

## Note
Load test results must be documented honestly. Do NOT fabricate performance numbers.
