const fs = require('fs');

const testHtml = `
<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.tailwindcss.com"></script>
<style>
.composer-stacked #mobile-image-composer-text-view {
    flex-wrap: wrap;
    row-gap: 8px;
}
.composer-stacked #mobile-image-prompt-wrapper {
    order: -1;
    width: 100%;
}
.composer-stacked #mobile-image-attach-btn {
    order: 1;
}
.composer-stacked #mobile-image-right-controls {
    order: 2;
    margin-left: auto;
}
</style>
</head>
<body>
<div id="shell" class="rounded-full bg-white border p-2 flex flex-col">
    <div id="mobile-image-composer-text-view" class="w-full flex items-center gap-2">
        <button id="mobile-image-attach-btn" class="w-9 h-9 rounded-full bg-gray-200">IMG</button>
        <div id="mobile-image-prompt-wrapper" class="flex-1 min-w-0 flex items-center">
            <textarea id="mobile-image-prompt-input" rows="1" class="w-full resize-none border-0 p-0 outline-none"></textarea>
        </div>
        <div id="mobile-image-right-controls" class="flex items-center gap-1 shrink-0">
            <button id="mobile-image-mic-btn" class="w-9 h-9 rounded-full bg-gray-200">MIC</button>
            <button id="mobile-image-submit-btn" class="w-9 h-9 rounded-full bg-blue-600 text-white">UP</button>
        </div>
    </div>
</div>
</body>
</html>
`;

console.log('Flex layout structure defined cleanly.');
