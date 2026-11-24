
        if (typeof window.MestrioI18n === 'undefined' && (location.protocol === 'file:' || !location.origin)) {
            document.write('<script src="i18n.js"><\/script>');
        }
    