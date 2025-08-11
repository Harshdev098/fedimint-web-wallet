// import { useEffect, useState } from 'react';

// declare global {
//     interface Window {
//         gtranslateSettings?: {
//             default_language: string;
//             detect_browser_language: boolean;
//             wrapper_selector: string;
//             font_size: number;
//         };
//     }
// }

// export default function GTranslateWidget() {
//     const [loaded, setLoaded] = useState(false)
//     const [error, setErrorWithTimeout] = useState('')

//     useEffect(() => {
//         const loadGTranslateScript = (): Promise<void> => {
//             return new Promise((resolve, reject) => {
//                 window.gtranslateSettings = {
//                     default_language: 'en',
//                     detect_browser_language: true,
//                     wrapper_selector: '.gtranslate_wrapper',
//                     font_size: 100,
//                 };

//                 const script = document.createElement('script');
//                 script.src = 'https://cdn.gtranslate.net/widgets/latest/popup.js';
//                 script.defer = true;
//                 script.onload = () => {
//                     setLoaded(true)
//                     resolve();
//                 };
//                 script.onerror = () => {
//                     setErrorWithTimeout("can't load script")
//                     setLoaded(true)
//                     reject()
//                 };
//                 document.body.appendChild(script);
//             });
//         };

//         loadGTranslateScript()
//             .then(() => {
//                 console.log('GTranslate script loaded successfully');
//             })
//             .catch((err) => {
//                 console.error(err);
//             });

//         return () => {
//             // Don’t try to remove anything here — let GTranslate handle cleanup
//             // OR optionally remove script + re-render it if needed on route changes
//         };

//     }, []);

//     return <div className="gtranslate_wrapper" >
//         {loaded === false && <p style={{ padding: '0px', margin: '0px' }}>loading...</p>}
//         {error && <p style={{ padding: '0px', margin: '0px' }}>{error}</p>}
//     </div>;
// }
