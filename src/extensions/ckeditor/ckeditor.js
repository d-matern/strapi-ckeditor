import Block2 from './ckeditor-plugins/Block2.js'

export default {
  plugin: {
    add: ['Block2'],
  },
  editor: {
    extraPlugins: [Block2],
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        '|',
        'block2',
        '|',
        'undo',
        'redo',
      ],
    },
  },
}
