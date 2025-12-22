"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Blogs;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Layout_1 = __importDefault(require("@theme/Layout"));
const sanityClient_1 = require("../services/sanity/sanityClient");
const imageUrl_1 = require("../services/sanity/imageUrl");
function Blogs() {
    const [posts, setPosts] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const postsPerPage = 6;
    (0, react_1.useEffect)(() => {
        sanityClient_1.client
            .fetch(`*[_type == "post"] | order(publishedAt desc) {
            title,
            "slug": slug.current,
            publishedAt,
            mainImage,
            author->{name, image},
            categories[]->{title},
            body
          }`)
            .then((data) => {
            setPosts(data);
            setIsLoading(false);
        })
            .catch(console.error);
    }, []);
    // Pagination Logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Blog", description: "JetStart Blog", children: (0, jsx_runtime_1.jsxs)("div", { className: "container margin-vert--lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text--center margin-bottom--xl", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Latest Articles" }), (0, jsx_runtime_1.jsx)("p", { children: "Insights, tutorials, and updates from the JetStart team." })] }), isLoading ? ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '4rem' }, children: (0, jsx_runtime_1.jsx)("div", { className: "loading-spinner", children: "Loading..." }) })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "row", children: currentPosts.map((post) => ((0, jsx_runtime_1.jsx)("div", { className: "col col--4 margin-bottom--lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "card h-100", style: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [post.mainImage && ((0, jsx_runtime_1.jsx)("div", { className: "card__image", children: (0, jsx_runtime_1.jsx)("img", { src: (0, imageUrl_1.urlFor)(post.mainImage), alt: post.title, style: {
                                                    borderTopLeftRadius: '12px',
                                                    borderTopRightRadius: '12px',
                                                    height: '240px',
                                                    width: '100%',
                                                    objectFit: 'cover'
                                                } }) })), (0, jsx_runtime_1.jsx)("div", { className: "card__header", children: (0, jsx_runtime_1.jsx)("h3", { children: post.title }) }), (0, jsx_runtime_1.jsx)("div", { className: "card__body", style: { flexGrow: 1 }, children: (0, jsx_runtime_1.jsxs)("p", { className: "text--secondary", children: [new Date(post.publishedAt).toLocaleDateString(), post.author && ` • ${post.author.name}`] }) }), (0, jsx_runtime_1.jsx)("div", { className: "card__footer", children: (0, jsx_runtime_1.jsx)("a", { href: `/blog/${post.slug}`, className: "button button--primary button--block", children: "Read Article" }) })] }) }, post.slug))) }), totalPages > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "pagination-controls", style: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }, children: [(0, jsx_runtime_1.jsx)("button", { className: "button button--secondary", onClick: handlePrev, disabled: currentPage === 1, children: "Previous" }), (0, jsx_runtime_1.jsxs)("span", { style: { alignSelf: 'center' }, children: ["Page ", currentPage, " of ", totalPages] }), (0, jsx_runtime_1.jsx)("button", { className: "button button--secondary", onClick: handleNext, disabled: currentPage === totalPages, children: "Next" })] }))] }))] }) }));
}
//# sourceMappingURL=blogs.js.map