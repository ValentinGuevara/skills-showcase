resource "google_project_iam_member" "project" {
  project = "your-project-id"
  role    = "roles/container.clusterAdmin"
  member  = "serviceAccount:your-service-account-email"
}

resource "google_project_iam_member" "compute" {
  project = "your-project-id"
  role    = "roles/compute.networkAdmin"
  member  = "serviceAccount:your-service-account-email"
}