import xml.etree.ElementTree as ET
import os

sitemap_path = r'c:\D\github\pixel-perfect-commerce\public\sitemap.xml'
output_path = r'c:\D\github\pixel-perfect-commerce\public\llms-products.txt'

if not os.path.exists(sitemap_path):
    print(f"Error: {sitemap_path} not found")
    exit(1)

tree = ET.parse(sitemap_path)
root = tree.getroot()

# The namespace for sitemap
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

products = []
for url in root.findall('sm:url', ns):
    loc = url.find('sm:loc', ns).text
    if '/product/' in loc:
        # Extract name from slug (best effort)
        slug = loc.split('/product/')[-1]
        name = slug.replace('-', ' ').title()
        products.append(f"- [{name}]({loc})")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("# AI Bazar Pakistan - Full Product Catalog\n\n")
    f.write("> Total Products: " + str(len(products)) + "\n\n")
    f.write("\n".join(products))

print(f"Extracted {len(products)} products to {output_path}")
