import { Plugin, ButtonView, Command, Widget, toWidget, toWidgetEditable } from 'ckeditor5';

export default class Block2 extends Plugin {
    static get requires() {
        return [ Block2Editing, Block2UI ]
    }
}

class Block2UI extends Plugin {
    init() {
      // block2
        const editor = this.editor
        const t = editor.t

        // The "block2" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'block2', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertBlock2' )

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale )

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Block #2' ),
                withText: true,
                tooltip: true
            })

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' )

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertBlock2' ) )

            return buttonView
        })
    }
}

class Block2Editing extends Plugin {
    static get requires() {
        return [ Widget ]
    }

    init() {
        console.log( 'Block2Editing#init() got called' )

        this._defineSchema()
        this._defineConverters()

        this.editor.commands.add( 'insertBlock2', new InsertBlock2Command( this.editor ))
    }

    _defineSchema() {
        const schema = this.editor.model.schema

        schema.register( 'block2', {
            // Behaves like a self-contained block object (e.g. a block image)
            // allowed in places where other blocks are allowed (e.g. directly in the root).
            inheritAllFrom: '$blockObject',
            allowAttributes: ['class', 'style', 'id', 'data-*']
        })

        schema.register( 'block2Content', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'block2',

            // Allow content which is allowed in the root (e.g. paragraphs).
            allowContentOf: '$root',

            allowAttributes: ['class', 'style', 'id', 'data-*']
        })

        // schema.addChildCheck( ( context, childDefinition ) => {
        //     if ( context.endsWith( 'block2Description' ) && childDefinition.name == 'block2' ) {
        //         return false;
        //     }
        // } );
    }

  _defineConverters() {
    const conversion = this.editor.conversion

    // <block2> converters
    conversion.for('upcast').elementToElement({
      model: (viewElement, { writer }) => {
        const attributes = Object.fromEntries(viewElement.getAttributes())
        const classes = Array.from(viewElement.getClassNames())
        return writer.createElement('block2', { ...attributes, class: classes.join(' ') })
      },
      view: {
        name: 'section',
        classes: 'block2',
      }
    })

    conversion.for('dataDowncast').elementToElement({
      model: 'block2',
      view: (modelElement, { writer }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        return writer.createContainerElement('section', attributes)
      }
    })

    conversion.for('editingDowncast').elementToElement({
      model: 'block2',
      view: (modelElement, { writer: viewWriter }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        const section = viewWriter.createContainerElement('section', attributes)
        return toWidget(section, viewWriter, { label: 'block2 widget' })
      },
    })

    // <block2Content> converters
    conversion.for('upcast').elementToElement({
      model: (viewElement, { writer }) => {
        const attributes = Object.fromEntries(viewElement.getAttributes())
        const classes = Array.from(viewElement.getClassNames())
        return writer.createElement('block2Content', { ...attributes, class: classes.join(' ') })
      },
      view: {
        name: 'div',
        classes: 'block2-content',
      },
    })

    conversion.for('dataDowncast').elementToElement({
      model: 'block2Content',
      view: (modelElement, { writer }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        return writer.createEditableElement('div', attributes)
      },
    })

    conversion.for('editingDowncast').elementToElement({
      model: 'block2Content',
      view: (modelElement, { writer: viewWriter }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        const div = viewWriter.createEditableElement('div', attributes)
        return toWidgetEditable(div, viewWriter)
      },
    })
  }
}

class InsertBlock2Command extends Command {
    execute() {
      this.editor.model.change(writer => {
        // Создаем <block2> элемент
        const block2 = writer.createElement('block2', { class: 'block2' })

        // Создаем <block2Content> внутри <block2>
        const block2Content = writer.createElement('block2Content', { class: 'block2-content' })

        // Вставляем <paragraph> в <block2Content>
        const paragraph = writer.createElement('paragraph')

        // Строим структуру
        writer.append(block2Content, block2)
        writer.append(paragraph, block2Content)

        // Вставляем элемент в модель
        this.editor.model.insertObject(block2)
      })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'block2' )

        this.isEnabled = allowedIn !== null
    }
}

function prepareAttributes( attributes ) {
  const newAttributes = {...attributes}

  // Удаляем атрибуты, которые могут быть объектами(может быть htmldivattributes="[object Object]")
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] === 'object') {
      delete newAttributes[key]
    }
  })

  return newAttributes
}