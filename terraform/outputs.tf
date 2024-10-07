output "kubernetes_cluster_name" {
  value = google_container_cluster.primary.name
}

output "region" {
  value = google_container_cluster.primary.location
}

output "endpoint" {
  value = google_container_cluster.primary.endpoint
}

output "kubeconfig" {
  value = google_container_cluster.primary.kubeconfig_raw
}