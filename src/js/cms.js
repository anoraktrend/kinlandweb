import CMS from "decap-cms-app";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.css";

CMS.registerPreviewStyle(styles, {raw: true});

// Register preview templates using dynamic imports for better code splitting
CMS.registerPreviewTemplate("home", () => import("./cms-preview-templates/home.js"));
CMS.registerPreviewTemplate("post", () => import("./cms-preview-templates/post.js"));
CMS.registerPreviewTemplate("products", () => import("./cms-preview-templates/products.js"));
CMS.registerPreviewTemplate("values", () => import("./cms-preview-templates/values.js"));
CMS.registerPreviewTemplate("contact", () => import("./cms-preview-templates/contact.js"));

CMS.init();
