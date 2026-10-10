
import sys

def extract_text(pdf_path, output_path):
    try:
        import PyPDF2
        print("Using PyPDF2")
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            with open(output_path, 'w', encoding='utf-8') as out_f:
                out_f.write(text)
        print(f"Successfully extracted text to {output_path}")
        return
    except ImportError:
        pass

    try:
        import pypdf
        print("Using pypdf")
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(output_path, 'w', encoding='utf-8') as out_f:
            out_f.write(text)
        print(f"Successfully extracted text to {output_path}")
        return
    except ImportError:
        pass
        
    print("Error: Could not import PyPDF2 or pypdf. Please ensure one is installed.")
    sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_pdf.py <input_pdf> <output_txt>")
        sys.exit(1)
        
    extract_text(sys.argv[1], sys.argv[2])
