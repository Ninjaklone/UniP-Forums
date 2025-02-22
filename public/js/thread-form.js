tinymce.init({
    selector: '.tinymce',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    menubar: false,
    height: 300,
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; }',
    images_upload_handler: function (blobInfo, success, failure) {
        failure('Image upload is not implemented yet');
    },
    setup: function (editor) {
        editor.on('change', function () {
            editor.save();
        });
    },
    skin: document.documentElement.getAttribute('data-theme') === 'dark' ? 'oxide-dark' : 'oxide',
    content_css: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize TinyMCE for new thread form
    if (document.querySelector('.tinymce')) {
        initTinyMCE('.tinymce');
    }
});