const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Basic DOM simulation
const mockDocument = {
    readyState: 'complete',
    getElementById(id) {
        if (id === 'image-home-templates-grid') {
            return {
                innerHTML: '',
                classList: { add() {}, remove() {} },
                appendChild(card) {
                    this.cards.push(card);
                },
                cards: []
            };
        }
        if (id === 'tmpl-empty-state') {
            return { classList: { add() {}, remove() {} } };
        }
        if (id === 'mestrio-admin-studio-root') {
            return {
                classList: {
                    classes: ['hidden'],
                    add(c) { this.classes.push(c); },
                    remove(c) { this.classes = this.classes.filter(x => x !== c); }
                },
                style: {}
            };
        }
        if (id === 'admin-security-lock-screen') {
            return {
                classList: {
                    classes: ['hidden'],
                    add(c) { this.classes.push(c); },
                    remove(c) { this.classes = this.classes.filter(x => x !== c); }
                },
                style: {}
            };
        }
        return null;
    },
    createElement(tag) {
        return {
            tag,
            className: '',
            style: {},
            innerHTML: '',
            querySelector() { return null; },
            querySelectorAll() { return []; },
            addEventListener() {}
        };
    },
    addEventListener() {},
    body: { style: {} }
};

console.log('Simulation environment ready.');
