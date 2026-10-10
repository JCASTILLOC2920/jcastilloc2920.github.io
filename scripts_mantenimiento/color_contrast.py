
import sys

def get_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    srgb = [x / 255.0 for x in (r, g, b)]
    
    for i in range(len(srgb)):
        if srgb[i] <= 0.03928:
            srgb[i] = srgb[i] / 12.92
        else:
            srgb[i] = ((srgb[i] + 0.055) / 1.055) ** 2.4
            
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]

def get_contrast_ratio(hex1, hex2):
    l1 = get_luminance(hex1)
    l2 = get_luminance(hex2)
    
    if l1 > l2:
        return (l1 + 0.05) / (l2 + 0.05)
    else:
        return (l2 + 0.05) / (l1 + 0.05)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python color_contrast.py <hex_color1> <hex_color2>")
        sys.exit(1)
        
    color1 = sys.argv[1]
    color2 = sys.argv[2]
    
    ratio = get_contrast_ratio(color1, color2)
    
    print(f"Contrast ratio between {color1} and {color2}: {ratio:.2f}")
    
    if ratio >= 4.5:
        print("AA compliant for normal text.")
    elif ratio >= 3:
        print("AA compliant for large text.")
    else:
        print("Not AA compliant.")
    
