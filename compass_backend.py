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

