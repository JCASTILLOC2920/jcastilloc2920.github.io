with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

screens = ['pantalla-wsi', 'pantalla-mapeo3d', 'pantalla-appmovil', 'pantalla-ihq', 'pantalla-tarifario']
for s in screens:
    in_section = f'id="{s}"' in code
    in_nav = f'data-screen="{s}"' in code
    in_dots = f'data-target-screen="{s}"' in code
    print(f'Screen {s:18}: section={in_section}, nav={in_nav}, dot={in_dots}')
