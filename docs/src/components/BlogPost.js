"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlogPost;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Layout_1 = __importDefault(require("@theme/Layout"));
// @ts-ignore
const react_router_dom_1 = require("react-router-dom");
const sanityClient_1 = require("../services/sanity/sanityClient");
const imageUrl_1 = require("../services/sanity/imageUrl");
const react_2 = require("@portabletext/react");
function BlogPost() {
    const { slug } = (0, react_router_dom_1.useParams)();
    const [post, setPost] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!slug)
            return;
        sanityClient_1.client
            .fetch(`*[_type == "post" && slug.current == $slug][0]{
            title,
            publishedAt,
            mainImage,
            author->{name, image},
            body
          }`, { slug })
            .then((data) => {
            if (!data) {
                setError('Post not found');
            }
            else {
                setPost(data);
            }
            setIsLoading(false);
        })
            .catch((err) => {
            console.error(err);
            setError('Failed to load post');
            setIsLoading(false);
        });
    }, [slug]);
    const components = {
        types: {
            image: ({ value }) => {
                if (!value?.asset?._ref) {
                    return null;
                }
                return ((0, jsx_runtime_1.jsx)("div", { className: "text--center margin-vert--md", children: (0, jsx_runtime_1.jsx)("img", { src: (0, imageUrl_1.urlFor)(value), alt: value.alt || 'Blog Image', style: { maxWidth: '100%', borderRadius: '8px' } }) }));
            },
        },
    };
    return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: post?.title || 'Loading...', description: "JetStart Blog", children: (0, jsx_runtime_1.jsx)("div", { className: "container margin-vert--xl", children: isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "text--center padding--xl", children: (0, jsx_runtime_1.jsx)("div", { className: "loading-spinner", children: "Loading..." }) })) : error ? ((0, jsx_runtime_1.jsxs)("div", { className: "text--center padding--xl", children: [(0, jsx_runtime_1.jsx)("h1", { children: error }), (0, jsx_runtime_1.jsx)("a", { href: "/blogs", className: "button button--primary", children: "Back to Blog" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "row justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "col col--8", children: [(0, jsx_runtime_1.jsxs)("header", { className: "margin-bottom--lg", children: [post.mainImage && ((0, jsx_runtime_1.jsx)("img", { src: (0, imageUrl_1.urlFor)(post.mainImage), alt: post.title, style: {
                                        borderRadius: '16px',
                                        marginBottom: '2rem',
                                        width: '100%',
                                        maxHeight: '400px',
                                        objectFit: 'cover'
                                    } })), (0, jsx_runtime_1.jsx)("h1", { children: post.title }), (0, jsx_runtime_1.jsxs)("div", { className: "text--secondary margin-top--sm", children: [new Date(post.publishedAt).toLocaleDateString(), post.author && ` • ${post.author.name}`] })] }), (0, jsx_runtime_1.jsx)("article", { className: "markdown", style: { fontSize: '1.1rem', lineHeight: '1.8' }, children: (0, jsx_runtime_1.jsx)(react_2.PortableText, { value: post.body, components: components }) }), (0, jsx_runtime_1.jsx)("hr", { className: "margin-vert--xl" }), (0, jsx_runtime_1.jsx)("div", { className: "text--center", children: (0, jsx_runtime_1.jsx)("a", { href: "/blogs", className: "button button--secondary", children: "\u2190 Back to All Posts" }) })] }) })) }) }));
}
//# sourceMappingURL=BlogPost.js.map