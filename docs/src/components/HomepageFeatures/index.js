"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomepageFeatures;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = __importDefault(require("clsx"));
const Heading_1 = __importDefault(require("@theme/Heading"));
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
const FeatureList = [
    {
        title: 'Lightning Fast Hot Reload',
        icon: '⚡',
        description: ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Edit your UI code and see changes in ", (0, jsx_runtime_1.jsx)("strong", { children: "under 100ms" }), ". No rebuild, no reinstall - just instant updates on your device."] })),
    },
    {
        title: 'Dual Reload System',
        icon: '🔄',
        description: ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Smart DSL-based hot reload for UI changes, with automatic fallback to full Gradle builds for logic changes. Best of both worlds." })),
    },
    {
        title: 'QR Code Connect',
        icon: '📱',
        description: ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Scan a QR code and connect your device instantly. No complex setup, no cables required - just scan and start coding." })),
    },
    {
        title: 'Real Kotlin Compose',
        icon: '💻',
        description: ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Write actual Kotlin Compose code, not configuration files. Full IDE support with autocomplete, type checking, and refactoring." })),
    },
    {
        title: 'WebSocket Real-Time',
        icon: '📡',
        description: ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Real-time communication via WebSocket protocol ensures instant synchronization between your code and running app." })),
    },
    {
        title: 'Session Isolation',
        icon: '🔒',
        description: ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Secure, isolated development sessions with unique tokens. Multiple projects can run simultaneously without interference." })),
    },
];
function Feature({ title, icon, description }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)('col col--4'), children: (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.featureCard, children: [(0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.featureIcon, children: icon }), (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.featureContent, children: [(0, jsx_runtime_1.jsx)(Heading_1.default, { as: "h3", className: styles_module_css_1.default.featureTitle, children: title }), (0, jsx_runtime_1.jsx)("p", { className: styles_module_css_1.default.featureDescription, children: description })] })] }) }));
}
function HomepageFeatures() {
    return ((0, jsx_runtime_1.jsx)("section", { className: styles_module_css_1.default.features, children: (0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsx)(Heading_1.default, { as: "h2", className: styles_module_css_1.default.featuresTitle, children: "Why JetStart?" }), (0, jsx_runtime_1.jsx)("div", { className: "row", children: FeatureList.map((props, idx) => ((0, jsx_runtime_1.jsx)(Feature, { ...props }, idx))) })] }) }));
}
//# sourceMappingURL=index.js.map