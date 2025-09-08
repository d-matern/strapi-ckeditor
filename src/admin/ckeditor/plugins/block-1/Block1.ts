import { Plugin, Command, ButtonView, Widget, toWidget, toWidgetEditable } from 'ckeditor5';
import './Block1.css';

export default class TwoColumns extends Plugin {
    static get requires() {
        return [ TwoColumnsEditing, TwoColumnsUI ]
    }
}

class TwoColumnsUI extends Plugin {
    init() {
        console.log( 'TwoColumnsUI#init() got called' )
      // twoColumns
        const editor = this.editor
        const t = editor.t

        // The "twoColumns" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'twoColumns', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertTwoColumns' )

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale )

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Block #1' ),
                withText: true,
                tooltip: true
            } )

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' )

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertTwoColumns' ) )

            return buttonView
        } )
    }
}

class TwoColumnsEditing extends Plugin {
    static get requires() {
        return [ Widget ]
    }

    init() {
        console.log( 'TwoColumnsEditing#init() got called' )

        this._defineSchema()
        this._defineConverters()

        this.editor.commands.add( 'insertTwoColumns', new InsertTwoColumnsCommand( this.editor ) )
    }

    _defineSchema() {
        const schema = this.editor.model.schema

        schema.register( 'twoColumns', {
            // Behaves like a self-contained block object (e.g. a block image)
            // allowed in places where other blocks are allowed (e.g. directly in the root).
            inheritAllFrom: '$blockObject',
            allowAttributes: ['class', 'style', 'id', 'data-*']
        })

      schema.register( 'twoColumnsContent', {
        // Cannot be split or left by the caret.
        // isLimit: true,

        allowIn: 'twoColumns',
        allowAttributes: ['class', 'style', 'id', 'data-*']

        // Allow content which is allowed in blocks (i.e. text with attributes).
        // allowContentOf: '$block'
      })

        schema.register( 'twoColumnsTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'twoColumnsContent',

            // Allow content which is allowed in blocks (i.e. text with attributes).
            allowContentOf: '$block',
            allowAttributes: ['class', 'style', 'id', 'data-*']
        })

        schema.register( 'twoColumnsDescription', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'twoColumnsContent',

            // Allow content which is allowed in the root (e.g. paragraphs).
            allowContentOf: '$root',
            allowAttributes: ['class', 'style', 'id', 'data-*']
        })

        schema.addChildCheck( ( context, childDefinition ) => {
            if ( context.endsWith( 'twoColumnsDescription' ) && childDefinition.name == 'twoColumns' ) {
                return false
            }
        })
    }

    _defineConverters() {
        const conversion = this.editor.conversion

        // <twoColumns> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: (viewElement, { writer }) => {
              const attributes = Object.fromEntries(viewElement.getAttributes())
              const classes = Array.from(viewElement.getClassNames())
              return writer.createElement('twoColumns', { ...attributes, class: classes.join(' ') })
            },
            view: {
                name: 'section',
                classes: 'two-columns'
            }
        })
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'twoColumns',
            view: (modelElement, { writer }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              return writer.createContainerElement('section', attributes)
            },
        })
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'twoColumns',
            view: (modelElement, { writer: viewWriter }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              const section = viewWriter.createContainerElement('section', attributes)
              return toWidget(section, viewWriter, { label: 'two-columns widget' })
            },
        })


      // <twoColumns> converters
      conversion.for( 'upcast' ).elementToElement( {
        model: (viewElement, { writer }) => {
          const attributes = Object.fromEntries(viewElement.getAttributes())
          const classes = Array.from(viewElement.getClassNames())
          return writer.createElement('twoColumnsContent', { ...attributes, class: classes.join(' ') })
        },
        view: {
          name: 'div',
          classes: 'two-columns-content'
        }
      })
      conversion.for( 'dataDowncast' ).elementToElement( {
        model: 'twoColumnsContent',
        view: (modelElement, { writer }) => {
          const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
          return writer.createEditableElement('div', attributes)
        },
      })
      conversion.for( 'editingDowncast' ).elementToElement( {
        model: 'twoColumnsContent',
        view: (modelElement, { writer: viewWriter }) => {
          const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
          const div = viewWriter.createEditableElement('div', attributes)
          return toWidget(div, viewWriter, { label: 'two-columns widget' })
        },
      })

        // <twoColumnsTitle> converters
        conversion.for( 'upcast' ).elementToElement( {
          model: (viewElement, { writer }) => {
            const attributes = Object.fromEntries(viewElement.getAttributes())
            const classes = Array.from(viewElement.getClassNames())
            return writer.createElement('twoColumnsTitle', { ...attributes, class: classes.join(' ') })
          },
            view: {
                name: 'p',
                classes: 'two-columns-title'
            }
        })
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'twoColumnsTitle',
            view: (modelElement, { writer }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              return writer.createEditableElement('p', attributes)
            },
        })
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'twoColumnsTitle',
            view: (modelElement, { writer: viewWriter }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              const div = viewWriter.createEditableElement('p', attributes)
              return toWidgetEditable(div, viewWriter)
            },
        })

        // <twoColumnsDescription> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: (viewElement, { writer }) => {
              const attributes = Object.fromEntries(viewElement.getAttributes())
              const classes = Array.from(viewElement.getClassNames())
              return writer.createElement('twoColumnsDescription', { ...attributes, class: classes.join(' ') })
            },
            view: {
                name: 'div',
                classes: 'two-columns-description'
            }
        })
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'twoColumnsDescription',
            view: (modelElement, { writer }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              return writer.createEditableElement('div', attributes)
            },
        })
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'twoColumnsDescription',
            view: (modelElement, { writer: viewWriter }) => {
              const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
              const div = viewWriter.createEditableElement('div', attributes)
              return toWidgetEditable(div, viewWriter)
            },
        })
    }
}

class InsertTwoColumnsCommand extends Command {
    execute() {
        this.editor.model.change( writer => {
            // Insert <twoColumns>*</twoColumns> at the current selection position
            // in a way that will result in creating a valid model structure.
            this.editor.model.insertObject( createTwoColumns( writer ) )
        })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twoColumns' )

        this.isEnabled = allowedIn !== null
    }
}

function createTwoColumns( writer ) {
    const twoColumns = writer.createElement( 'twoColumns', {class: 'two-columns'} )

  const twoColumnsContent = writer.createElement( 'twoColumnsContent', {class: 'two-columns-content'} )
  const twoColumnsTitle = writer.createElement( 'twoColumnsTitle', {class: 'two-columns-title'} )
  const twoColumnsDescription = writer.createElement( 'twoColumnsDescription', {class: 'two-columns-description'} )

  const twoColumnsContent2 = writer.createElement( 'twoColumnsContent', {class: 'two-columns-content'} )
  const twoColumnsTitle2 = writer.createElement( 'twoColumnsTitle', {class: 'two-columns-title'} )
  const twoColumnsDescription2 = writer.createElement( 'twoColumnsDescription', {class: 'two-columns-description'} )

  writer.append( twoColumnsTitle, twoColumnsContent )
  writer.append( twoColumnsDescription, twoColumnsContent )

  writer.append( twoColumnsTitle2, twoColumnsContent2 )
  writer.append( twoColumnsDescription2, twoColumnsContent2 )

  writer.append( twoColumnsContent, twoColumns )

  writer.append( twoColumnsContent2, twoColumns )

    // There must be at least one paragraph for the description to be editable.
    // See https://github.com/ckeditor/ckeditor5/issues/1464.
  writer.appendElement( 'paragraph', twoColumnsDescription )
  writer.appendElement( 'paragraph', twoColumnsDescription2 )

    return twoColumns
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
