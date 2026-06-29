import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_buildings.json"


def get_buildings():
    with DATA_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def find_building_by_address(address: str):
    buildings = get_buildings()
    normalized_address = address.strip()
    for building in buildings:
        if building["address"] in normalized_address or normalized_address in building["address"]:
            return building
    return buildings[0]
