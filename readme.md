# Swedish Fuelprice poller

Pulls the fuelprices from Eric Hjelms API and exports to prometheus metric.

Run in docker container and use prometheus or grafana-agent for visualization.
Exposes port 9414 and endpoint is /metrics

This is only intended for personal use as the station is hardcoded. But made it public if you want to clone and change to your stations.