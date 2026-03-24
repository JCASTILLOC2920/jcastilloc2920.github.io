import os
import re

def gather_data():
    # 1. Get HTML files
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    with open('file_list.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(html_files))
    
    # 2. Extract prices from precios.html
    prices = []
    if os.path.exists('precios.html'):
        with open('precios.html', 'r', encoding='utf-8') as f:
            content = f.read()
            # Look for S/ followed by numbers, and preceding text (item name)
            # Simple heuristic: look for <td> or <li> or <span> containing the price
            matches = re.findall(r'([^<>\n]+).*?S/\s?(\d+(?:\.\d+)?)', content)
            for item, price in matches:
                item = item.strip()
                if item and len(item) < 100:
                    prices.append(f"{item}: S/ {price}")
    
    with open('sample_prices.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(prices))

if __name__ == "__main__":
    gather_data()
