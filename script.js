document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const overlay = document.getElementById('overlay');
    const avatarHotspot = document.getElementById('avatar-hotspot');
    const nicknameHotspot = document.getElementById('nickname-hotspot');
    const avatarPanel = document.getElementById('avatar-panel');
    const nicknamePanel = document.getElementById('nickname-panel');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // --- 全屏逻辑 ---
    const requestFullScreen = () => {
        const elem = document.documentElement;
        // 最强兼容性全屏 API 调用（包含各主流浏览器内核前缀）
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.warn('全屏请求被拒绝:', err));
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari, Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
        document.body.removeEventListener('click', requestFullScreen, { once: true });
        document.body.removeEventListener('touchstart', requestFullScreen, { once: true });
    };
    document.body.addEventListener('click', requestFullScreen, { once: true });
    document.body.addEventListener('touchstart', requestFullScreen, { once: true });

    // --- 拖拽设置触摸点逻辑 ---
    let isDragging = false;
    let currentHotspot = null;
    let startX, startY, initialLeft, initialTop;

    const startDrag = (e) => {
        if (!document.body.classList.contains('edit-mode')) return;
        if (!e.target.classList.contains('hotspot')) return;
        
        isDragging = true;
        currentHotspot = e.target;
        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = currentHotspot.getBoundingClientRect();
        // 转换为绝对像素定位
        currentHotspot.style.left = rect.left + 'px';
        currentHotspot.style.top = rect.top + 'px';
        currentHotspot.style.transform = 'none';
        
        initialLeft = rect.left;
        initialTop = rect.top;
        
        e.preventDefault(); // 防止滚动
    };

    const doDrag = (e) => {
        if (!isDragging || !currentHotspot) return;
        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        currentHotspot.style.left = (initialLeft + dx) + 'px';
        currentHotspot.style.top = (initialTop + dy) + 'px';
    };

    const endDrag = () => {
        if (isDragging) {
            isDragging = false;
            currentHotspot = null;
        }
    };

    // 绑定拖拽事件
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
    
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // --- 双击进入设置模式 ---
    let lastTap = 0;
    mainContainer.addEventListener('touchend', (e) => {
        if (document.body.classList.contains('edit-mode')) return;
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // 双击触发进入设置模式
            document.body.classList.add('edit-mode');
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    mainContainer.addEventListener('dblclick', (e) => {
        if (document.body.classList.contains('edit-mode')) return;
        document.body.classList.add('edit-mode');
    });

    // --- 保存设置 ---
    saveSettingsBtn.addEventListener('click', () => {
        // 退出设置模式，隐藏红框和按钮
        document.body.classList.remove('edit-mode');
    });

    // --- 点击热区打开全屏面板 ---
    let isMoved = false;
    document.addEventListener('touchmove', () => isMoved = true);
    document.addEventListener('touchstart', () => isMoved = false);

    const openPanel = (panel) => {
        if (document.body.classList.contains('edit-mode')) return;
        panel.classList.add('active');
        overlay.classList.add('active');
    };

    const closePanel = (panel) => {
        panel.classList.remove('active');
        overlay.classList.remove('active');
    };

    // 绑定点击事件 (兼容移动端 tap 和 PC click)
    const bindHotspotClick = (hotspot, panel) => {
        hotspot.addEventListener('touchend', (e) => {
            if (!isMoved && !document.body.classList.contains('edit-mode')) {
                openPanel(panel);
                e.preventDefault();
            }
        });
        hotspot.addEventListener('click', (e) => {
            if (!document.body.classList.contains('edit-mode')) {
                openPanel(panel);
            }
        });
    };

    bindHotspotClick(avatarHotspot, avatarPanel);
    bindHotspotClick(nicknameHotspot, nicknamePanel);

    // 点击全屏面板本身即可关闭返回
    avatarPanel.addEventListener('click', () => closePanel(avatarPanel));
    nicknamePanel.addEventListener('click', () => closePanel(nicknamePanel));
});
