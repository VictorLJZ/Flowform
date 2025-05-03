Error: The result of getServerSnapshot should be cached to avoid an infinite loop
    at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:879:71)
    at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:1052:56)
    at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:1191:56)
    at mountSyncExternalStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:5777:92)
    at Object.useSyncExternalStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:15005:20)
    at exports.useSyncExternalStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:1687:36)
    at useStore (http://localhost:3000/_next/static/chunks/node_modules_e07720f1._.js:55:188)
    at useBoundStore (http://localhost:3000/_next/static/chunks/node_modules_e07720f1._.js:65:39)
    at FormViewerPage (http://localhost:3000/_next/static/chunks/src_6a9105a5._.js:6993:205)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/node_modules_next_dist_1a6ee436._.js:2053:50)


Error: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:879:71)
    at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:1052:56)
    at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js:1191:56)
    at getRootForUpdatedFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:4702:143)
    at enqueueConcurrentRenderForLane (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:4689:16)
    at forceStoreRerender (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:5854:20)
    at updateStoreInstance (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:5836:41)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/node_modules_next_dist_1a6ee436._.js:2053:50)


Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
    at getRootForUpdatedFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:4701:171)
    at enqueueConcurrentRenderForLane (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:4689:16)
    at forceStoreRerender (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:5854:20)
    at updateStoreInstance (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:5836:41)
    at ClientPageRoot (http://localhost:3000/_next/static/chunks/node_modules_next_dist_1a6ee436._.js:2053:50)