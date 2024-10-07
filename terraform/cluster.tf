resource "google_container_cluster" "primary" {
  name                     = "gke-cluster"
  location                 = "us-central1-a"
  remove_default_node_pool = true
  initial_node_count       = 1

  node_config {
    machine_type = "e2-micro"
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
    ]
    disk_size_gb = 10
  }

  ip_allocation_policy {}
  network    = google_compute_network.vpc_network.id
  subnetwork = google_compute_subnetwork.gke_subnetwork.id
}
