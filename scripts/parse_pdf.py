import pdfplumber

with pdfplumber.open("docs/Sinavlar/mebi/TYT/tyt-2.pdf") as pdf:
    for i in range(len(pdf.pages) - 1, max(-1, len(pdf.pages) - 3), -1):
        page = pdf.pages[i]
        text = page.extract_text()
        if text:
            print(f"--- PAGE {i+1} ---")
            print(text[:500])
