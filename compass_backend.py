#!/usr/bin/env python3
"""
Simple Compass Backend API

Run:
  python3 compass_backend.py

Endpoints:
  GET  /health
  GET  /api/compass?lat=..&lng=..&heading=..
  POST /api/compass  (JSON: {"lat": .., "lng": .., "heading": ..})
"""

from __future__ import annotations

import json
import math
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, Optional, Tuple


KAABA_LAT = 21.4225
KAABA_LNG = 39.8262
TEST_UI_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Compass Backend Test UI</title>
  <style>
    body { font-family: sans-serif; margin: 24px; background: #0b1220; color: #e5e7eb; }
    .card { max-width: 760px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
    h1 { margin-top: 0; font-size: 22px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    label { display: block; font-size: 13px; margin-bottom: 4px; color: #9ca3af; }
    input, button { width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid #374151; background: #0f172a; color: #e5e7eb; padding: 10px; }
    button { background: #065f46; border-color: #047857; cursor: pointer; }
    button.secondary { background: #1f2937; border-color: #374151; }
    .row { margin-top: 12px; }
    pre { background: #0f172a; border: 1px solid #1f2937; border-radius: 8px; padding: 12px; overflow: auto; }
    .muted { color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Compass Backend Test UI</h1>
    <p class="muted">This page calls <code>/api/compass</code> on the same server.</p>

    <div class="grid">
      <div>
        <label for="lat">Latitude</label>
        <input id="lat" type="number" step="0.000001" value="30.0444" />
      </div>
      <div>
        <label for="lng">Longitude</label>
        <input id="lng" type="number" step="0.000001" value="31.2357" />
      </div>
      <div>
        <label for="heading">Heading (deg)</label>
        <input id="heading" type="number" step="0.1" value="0" />
      </div>
      <div>
        <label>&nbsp;</label>
        <button id="computeBtn">Compute</button>
      </div>
    </div>

    <div class="row grid">
      <div>
        <button id="sensorBtn" class="secondary">Use Device Heading</button>
      </div>
      <div>
        <button id="stopBtn" class="secondary">Stop Sensor</button>
      </div>
    </div>

    <div class="row">
      <p class="muted">Sensor status: <span id="sensorStatus">idle</span></p>
      <pre id="output">No response yet.</pre>
    </div>
  </div>

  <script>
    const latEl = document.getElementById("lat");
    const lngEl = document.getElementById("lng");
    const headingEl = document.getElementById("heading");
    const outputEl = document.getElementById("output");
    const sensorStatusEl = document.getElementById("sensorStatus");
    const computeBtn = document.getElementById("computeBtn");
    const sensorBtn = document.getElementById("sensorBtn");
    const stopBtn = document.getElementById("stopBtn");

    let sensorActive = false;
    let lastHeading = null;
    let throttleTs = 0;

    function normalizeDegrees(x) {
      return ((x % 360) + 360) % 360;
    }

    function sensorHeadingFromEvent(event) {
      if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
        return normalizeDegrees(event.webkitCompassHeading);
      }
      if (event.alpha === null || event.alpha === undefined) return null;
      return normalizeDegrees(360 - event.alpha);
    }

    async function compute() {
      const lat = Number(latEl.value);
      const lng = Number(lngEl.value);
      const heading = Number(headingEl.value);

      const url = new URL("/api/compass", window.location.origin);
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lng", String(lng));
      url.searchParams.set("heading", String(heading));

      try {
        const res = await fetch(url.toString());
        const data = await res.json();
        outputEl.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        outputEl.textContent = "Request failed: " + String(e);
      }
    }

    function onDeviceOrientation(event) {
      if (!sensorActive) return;
      const h = sensorHeadingFromEvent(event);
      if (h === null) return;
      lastHeading = h;
      headingEl.value = h.toFixed(1);
      sensorStatusEl.textContent = "active (" + h.toFixed(1) + "°)";

      const now = Date.now();
      if (now - throttleTs > 300) {
        throttleTs = now;
        compute();
      }
    }

    async function startSensor() {
      try {
        if (typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function") {
          const p = await DeviceOrientationEvent.requestPermission();
          if (p !== "granted") {
            sensorStatusEl.textContent = "permission denied";
            return;
          }
        }

        sensorActive = true;
        sensorStatusEl.textContent = "active (waiting for events)";
        window.addEventListener("deviceorientationabsolute", onDeviceOrientation, { passive: true });
        window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
      } catch (e) {
        sensorStatusEl.textContent = "error: " + String(e);
      }
    }

    function stopSensor() {
      sensorActive = false;
      sensorStatusEl.textContent = lastHeading === null ? "stopped" : ("stopped (last " + lastHeading.toFixed(1) + "°)");
      window.removeEventListener("deviceorientationabsolute", onDeviceOrientation);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
    }

    computeBtn.addEventListener("click", compute);
    sensorBtn.addEventListener("click", startSensor);
    stopBtn.addEventListener("click", stopSensor);
    compute();
  </script>
</body>
</html>
"""


def normalize_degrees(angle: float) -> float:
    return (angle % 360.0 + 360.0) % 360.0


def shortest_angle_delta(from_deg: float, to_deg: float) -> float:
    return ((to_deg - from_deg + 540.0) % 360.0) - 180.0


def calculate_qibla_bearing(lat: float, lng: float) -> float:
    user_lat = math.radians(lat)
    user_lng = math.radians(lng)
    kaaba_lat = math.radians(KAABA_LAT)
    kaaba_lng = math.radians(KAABA_LNG)

    delta_lng = kaaba_lng - user_lng
    y = math.sin(delta_lng) * math.cos(kaaba_lat)
    x = (
        math.cos(user_lat) * math.sin(kaaba_lat)
        - math.sin(user_lat) * math.cos(kaaba_lat) * math.cos(delta_lng)
    )
    return normalize_degrees(math.degrees(math.atan2(y, x)))


def fetch_declination(lat: float, lng: float) -> Tuple[float, str]:
    year = datetime.now(timezone.utc).year
    params = urllib.parse.urlencode(
        {
            "lat1": lat,
            "lon1": lng,
            "model": "WMM",
            "startYear": year,
            "resultFormat": "json",
        }
    )
    url = f"https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?{params}"

    try:
        with urllib.request.urlopen(url, timeout=6) as response:
            payload = json.loads(response.read().decode("utf-8"))
        value = payload.get("result", [{}])[0].get("declination")
        if isinstance(value, (int, float)):
            return float(value), "NOAA WMM API"
    except (urllib.error.URLError, ValueError, KeyError, IndexError, TypeError):
        pass

    return 0.0, "Fallback 0°"


def compass_result(lat: float, lng: float, heading: float) -> Dict[str, Any]:
    qibla_bearing = calculate_qibla_bearing(lat, lng)
    declination, declination_source = fetch_declination(lat, lng)
    true_heading = normalize_degrees(heading + declination)
    needle_rotation = normalize_degrees(qibla_bearing - true_heading)
    qibla_error = abs(shortest_angle_delta(true_heading, qibla_bearing))

    return {
        "lat": lat,
        "lng": lng,
        "input_heading": normalize_degrees(heading),
        "true_heading": true_heading,
        "declination": declination,
        "declination_source": declination_source,
        "qibla_bearing": qibla_bearing,
        "needle_rotation": needle_rotation,
        "qibla_error": qibla_error,
        "on_target": qibla_error <= 5.0,
        "very_close": qibla_error <= 15.0,
    }


def parse_float(value: Optional[str]) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class CompassHandler(BaseHTTPRequestHandler):
    server_version = "CompassBackend/1.0"

    def _json(self, status: int, data: Dict[str, Any]) -> None:
        raw = json.dumps(data, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _html(self, status: int, html: str) -> None:
        raw = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _bad_request(self, message: str) -> None:
        self._json(400, {"ok": False, "error": message})

    def _compute_and_respond(self, lat: Optional[float], lng: Optional[float], heading: Optional[float]) -> None:
        if lat is None or lng is None or heading is None:
            self._bad_request("lat, lng, and heading are required numbers")
            return
        if not (-90.0 <= lat <= 90.0):
            self._bad_request("lat must be between -90 and 90")
            return
        if not (-180.0 <= lng <= 180.0):
            self._bad_request("lng must be between -180 and 180")
            return

        result = compass_result(lat, lng, heading)
        self._json(200, {"ok": True, "data": result})

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._json(204, {"ok": True})

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ("/", "/test"):
            self._html(200, TEST_UI_HTML)
            return
        if parsed.path == "/health":
            self._json(200, {"ok": True, "service": "compass-backend"})
            return
        if parsed.path != "/api/compass":
            self._json(404, {"ok": False, "error": "not found"})
            return

        qs = urllib.parse.parse_qs(parsed.query)
        lat = parse_float(qs.get("lat", [None])[0])
        lng = parse_float(qs.get("lng", [None])[0])
        heading = parse_float(qs.get("heading", [None])[0])
        self._compute_and_respond(lat, lng, heading)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/compass":
            self._json(404, {"ok": False, "error": "not found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except ValueError:
            self._bad_request("invalid json body")
            return

        lat = parse_float(payload.get("lat"))
        lng = parse_float(payload.get("lng"))
        heading = parse_float(payload.get("heading"))
        self._compute_and_respond(lat, lng, heading)

    def log_message(self, fmt: str, *args: Any) -> None:
        return


def main() -> None:
    host = os.getenv("COMPASS_HOST", "0.0.0.0")
    port = int(os.getenv("COMPASS_PORT", "8787"))
    server = ThreadingHTTPServer((host, port), CompassHandler)
    print(f"Compass backend running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
