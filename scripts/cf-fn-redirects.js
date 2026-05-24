// CloudFront Function (viewer-request): runtime cloudfront-js-2.0
// Purpose:
//   1. /sitemap.xml  -> 301 -> /sitemap-index.xml
//   2. /foo (no trailing slash, no file extension) -> 301 -> /foo/
//
// All other URIs pass through to origin unchanged.
// Notes:
//   - S3's default static-website behavior issues a 302 (temporary) for the
//     missing-trailing-slash case. Converting to 301 here also lets canonical
//     signals consolidate cleanly even when external backlinks omit the slash.
//   - We intentionally do NOT touch URIs that contain a dot AFTER the last
//     slash (asset files like /_astro/foo.js, /og-image.jpg) so static files
//     are passed straight through.

function handler(event) {
    var req = event.request;
    var uri = req.uri;

    // /sitemap.xml -> /sitemap-index.xml (legacy / fallback path)
    if (uri === '/sitemap.xml') {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: '/sitemap-index.xml' },
                'cache-control': { value: 'public, max-age=86400' }
            }
        };
    }

    // Trailing slash enforcement: only for "directory-like" URIs
    // (no dot in the final path segment, not already ending in /)
    if (uri.length > 1 && uri.charAt(uri.length - 1) !== '/') {
        var lastSlash = uri.lastIndexOf('/');
        var lastDot = uri.lastIndexOf('.');
        if (lastDot < lastSlash) {
            var qs = '';
            if (req.querystring && Object.keys(req.querystring).length) {
                // Reconstruct querystring from the keys object
                var pairs = [];
                for (var k in req.querystring) {
                    var v = req.querystring[k];
                    if (v.multiValue) {
                        for (var i = 0; i < v.multiValue.length; i++) {
                            pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v.multiValue[i].value));
                        }
                    } else {
                        pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v.value));
                    }
                }
                if (pairs.length) qs = '?' + pairs.join('&');
            }
            return {
                statusCode: 301,
                statusDescription: 'Moved Permanently',
                headers: {
                    'location': { value: uri + '/' + qs },
                    'cache-control': { value: 'public, max-age=86400' }
                }
            };
        }
    }

    return req;
}
