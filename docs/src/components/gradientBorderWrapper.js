"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const GradientBorderWrapper = ({ children, style, }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            borderRadius: '6px',
            ...style,
        }, className: `h-fit w-fit p-[1px] bg-gradient-to-tr from-[#25FF79] via-[#1BC759] to-[#25FF79]  `, children: children }));
};
exports.default = GradientBorderWrapper;
//# sourceMappingURL=gradientBorderWrapper.js.map