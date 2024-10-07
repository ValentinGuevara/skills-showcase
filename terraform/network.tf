resource "google_compute_network" "vpc_network" {
  name = "gke-network"
}

resource "google_compute_subnetwork" "gke_subnetwork" {
  name          = "gke-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.vpc_network.name
}