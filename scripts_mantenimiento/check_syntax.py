import sys

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    in_single_comment = False
    in_multi_comment = False
    in_string = False
    string_char = ''
    escaped = False
    lines = code.split('\n')
    for line_no, line in enumerate(lines, 1):
        i = 0
        while i < len(line):
            c = line[i]
            if in_single_comment:
                break
            if in_multi_comment:
                if c == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_multi_comment = False
                    i += 2
                    continue
                i += 1
                continue
            if in_string:
                if escaped:
                    escaped = False
                elif c == '\\':
                    escaped = True
                elif c == string_char:
                    in_string = False
                i += 1
                continue
            
            # Not in comment or string
            if c == '/' and i + 1 < len(line):
                if line[i+1] == '/':
                    break # single comment
                elif line[i+1] == '*':
                    in_multi_comment = True
                    i += 2
                    continue
            if c in ('"', "'", '`'):
                in_string = True
                string_char = c
                i += 1
                continue
            if c in ('(', '{', '['):
                stack.append((c, line_no))
            elif c in (')', '}', ']'):
                if not stack:
                    print(f'{filename}: Unmatched closing {c} at line {line_no}')
                    return False
                top, top_line = stack.pop()
                if top != pairs[c]:
                    print(f'{filename}: Mismatched {top} from line {top_line} with {c} at line {line_no}')
                    return False
            i += 1
    if stack:
        print(f'{filename}: Unclosed {stack[-1][0]} from line {stack[-1][1]}')
        return False
    print(f'{filename}: Balanced brackets OK!')
    return True

if __name__ == '__main__':
    for fname in sys.argv[1:]:
        check_brackets(fname)
