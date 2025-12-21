import requests
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
CSV_PATH = os.path.join(DATA_DIR, 'market_prices.csv')

def download_csv():
    url = "https://data.gov.gh/dataset/xxxx/resource/yyyy/download/market_prices.csv"  # Replace with actual CSV link
    r = requests.get(url)
    with open(CSV_PATH, "wb") as f:
        f.write(r.content)
    print(f"Saved market prices to {CSV_PATH}")

if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    download_csv()