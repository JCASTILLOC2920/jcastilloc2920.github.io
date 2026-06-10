import os
import re

replacement = """        <div id="chat-header" class="video-mode">
            <!-- AVATAR VICTORIA (Día) -->
            <div id="avatar-victoria" class="avatar-video-container" style="display: none;">
                <video id="victoria-idle" class="avatar-video active" muted loop playsinline data-src="victoriaidle.mp4"></video>
                <video id="victoria-hablando" class="avatar-video" muted loop playsinline data-src="victoriahablando.mp4"></video>
                <video id="victoria-pensando" class="avatar-video" muted loop playsinline data-src="victoriapensando.mp4"></video>
                <video id="victoria-saludo" class="avatar-video" muted playsinline data-src="victoriasaludo.mp4"></video>
            </div>
            <!-- AVATAR ELENA (Noche) -->
            <div id="avatar-elena" class="avatar-video-container" style="display: none;">
                <video id="elena-idle" class="avatar-video active" muted loop playsinline data-src="elenaidle.mp4"></video>
                <video id="elena-hablando" class="avatar-video" muted loop playsinline data-src="victoriahablando.mp4"></video>
                <video id="elena-pensando" class="avatar-video" muted loop playsinline data-src="victoriapensando.mp4"></video>
                <video id="elena-saludo" class="avatar-video" muted playsinline data-src="victoriasaludo.mp4"></video>
            </div>
            
            <div class="chat-header-content">
                <div class="chat-title-group">
                    <div class="chat-name" id="bot-name-banner">Victoria</div>
                    <span>Especialista JC Path Lab</span>
                </div>
                <div class="chat-header-actions">
                    <button id="switch-avatar-btn" class="header-icon-btn" title="Cambiar Asistente" onclick="switchAvatar()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <div class="preview-avatar-wrapper">
                        <video id="avatar-toggle-preview" muted loop autoplay playsinline data-src="elenaidle.mp4"></video>
                    </div>
                    <span class="close-btn">&times;</span>
                </div>
            </div>
        </div>"""

pattern = re.compile(
    r'<div id="chat-header">\s*<div class="bot-avatar">\s*<i class="fas fa-user-md"></i>\s*</div>\s*<div class="chat-title-group">\s*<div class="chat-name">.*?</div>\s*<span>.*?</span>\s*</div>\s*<span class="close-btn">(?:onclick=".*?")?.*?</span>\s*</div>',
    re.DOTALL | re.IGNORECASE
)

count = 0
for filename in os.listdir('.'):
    if filename.endswith('.html') and filename != 'index.html':
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, num_subs = pattern.subn(replacement, content)
        if num_subs > 0:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
            count += 1
            
print(f"Total files updated: {count}")
