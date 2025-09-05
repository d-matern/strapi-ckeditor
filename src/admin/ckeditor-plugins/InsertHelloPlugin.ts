import { Plugin, ButtonView } from 'ckeditor5';

export default class InsertHelloPlugin extends Plugin {
  init() {
    const editor = this.editor;

    // Регистрируем новую кнопку
    editor.ui.componentFactory.add('insertHello', locale => {
      const view = new ButtonView(locale);

      view.set({
        label: 'Insert Hello',
        tooltip: true,
        withText: true, // показывать текст на кнопке
      });

      // Действие по клику на кнопку
      view.on('execute', () => {
        editor.model.change(writer => {
          const insertPosition = editor.model.document.selection.getFirstPosition();
          writer.insertText('Hello from custom plugin!', insertPosition);
        });
      });

      return view;
    });
  }
}
