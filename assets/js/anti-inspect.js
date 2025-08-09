// Anti-Inspection Protection Script for NexTrend Innovations
(function() {
    'use strict';
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
    });
    
    // Detect DevTools opening
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtools.open) {
                devtools.open = true;
                devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
                
                // Take action when devtools detected
                document.body.innerHTML = '<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; z-index: 9999;">Developer tools detected. Please close them to continue.</div>';
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = 'about:blank';
                }, 3000);
            }
        } else {
            devtools.open = false;
            devtools.orientation = null;
        }
    }, 500);
    
    // Disable drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable copy/cut/paste
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Debugger loop to make debugging difficult
    setInterval(() => {
        debugger;
    }, 100);
    
    // Obscure console methods
    if (window.console) {
        console.clear = function(){};
        console.log = function(){};
        console.warn = function(){};
        console.error = function(){};
        console.info = function(){};
        console.debug = function(){};
    }
    
    // Disable image drag
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });
    
    // Disable save shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable right-click on images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', e => e.preventDefault());
    });
    
    // Additional protection: Disable middle click
    document.addEventListener('auxclick', function(e) {
        if (e.button === 1) {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable long press on mobile
    let longPressTimer;
    document.addEventListener('touchstart', function(e) {
        longPressTimer = setTimeout(() => {
            e.preventDefault();
        }, 500);
    });
    
    document.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    });
    
    document.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });
    
})();
