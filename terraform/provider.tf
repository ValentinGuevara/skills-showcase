provider "google" {
  credentials = file("path/to/your/service-account-file.json")
  project     = "primeval-rain-437907-j9"
  region      = "us-central1"
}
