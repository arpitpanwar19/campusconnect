from locust import HttpUser, task, between

class CampusUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def browse_events(self):
        self.client.get("/api/events?page=1&page_size=20")
    
    @task(2)
    def search_events(self):
        self.client.get("/api/events?search=workshop&page=1")
    
    @task(2)
    def view_event(self):
        self.client.get("/api/events/intro-to-ml-workshop")
    
    @task(1)
    def health_check(self):
        self.client.get("/api/health")
    
    @task(1)
    def view_calendar(self):
        self.client.get("/api/events/calendar?start_date=2026-09-01&end_date=2026-10-31")
