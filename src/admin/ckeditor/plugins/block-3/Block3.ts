import { Plugin, Command, ButtonView, Widget, toWidget, toWidgetEditable } from 'ckeditor5';
import './Block3.css';

export default class Block3 extends Plugin {
  static get requires() {
    return [ Block3Editing, Block3UI ]
  }
}

class Block3UI extends Plugin {
  init() {
    console.log( 'Block3UI#init() got called' )
    // block3
    const editor = this.editor
    const t = editor.t

    // The "block3" button must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add( 'block3', locale => {
      // The state of the button will be bound to the widget command.
      const command = editor.commands.get( 'insertBlock3' )

      // The button will be an instance of ButtonView.
      const buttonView = new ButtonView( locale )

      buttonView.set( {
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t( 'Block #3' ),
        withText: true,
        tooltip: true
      })

      // Bind the state of the button to the command.
      buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' )

      // Execute the command when the button is clicked (executed).
      this.listenTo( buttonView, 'execute', () => editor.execute( 'insertBlock3' ) )

      return buttonView
    })
  }
}

class Block3Editing extends Plugin {
  static get requires() {
    return [ Widget ]
  }

  init() {
    console.log( 'Block3Editing#init() got called' )

    this._defineSchema()
    this._defineConverters()

    this.editor.commands.add( 'insertBlock3', new InsertBlock3Command( this.editor ) )
  }

  _defineSchema() {
    const schema = this.editor.model.schema

    schema.register( 'block3', {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: '$blockObject',
      allowAttributes: ['class', 'style', 'id', 'data-*']
    })

    schema.register( 'block3Content', {
      // Cannot be split or left by the caret.
      isLimit: true,

      allowIn: 'block3',

      // Allow content which is allowed in the root (e.g. paragraphs).
      allowContentOf: '$root',
      allowAttributes: ['class', 'style', 'id', 'data-*']
    })

    // schema.addChildCheck( ( context, childDefinition ) => {
    //     if ( context.endsWith( 'block3Description' ) && childDefinition.name == 'block3' ) {
    //         return false;
    //     }
    // } );
  }

  _defineConverters() {
    const conversion = this.editor.conversion

    // <block3> converters
    conversion.for( 'upcast' ).elementToElement( {
      model: (viewElement, { writer }) => {
        const attributes = Object.fromEntries(viewElement.getAttributes())
        const classes = Array.from(viewElement.getClassNames())
        return writer.createElement('block3', { ...attributes, class: classes.join(' ') })
      },
      view: {
        name: 'section',
        classes: 'block3'
      }
    })
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'block3',
      view: (modelElement, { writer }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        return writer.createContainerElement('section', attributes)
      },
    })
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'block3',
      view: (modelElement, { writer: viewWriter }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        const section = viewWriter.createContainerElement('section', attributes)
        return toWidget(section, viewWriter, { label: 'block3 widget' })
      },
    })

    // <block3Content> converters
    conversion.for( 'upcast' ).elementToElement( {
      model: (viewElement, { writer }) => {
        const attributes = Object.fromEntries(viewElement.getAttributes())
        const classes = Array.from(viewElement.getClassNames())
        return writer.createElement('block3Content', { ...attributes, class: classes.join(' ') })
      },
      view: {
        name: 'div',
        classes: 'block3-content'
      }
    })
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'block3Content',
      view: (modelElement, { writer }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        return writer.createEditableElement('div', attributes)
      },
    })
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'block3Content',
      view: (modelElement, { writer: viewWriter }) => {
        const attributes = prepareAttributes(Object.fromEntries(modelElement.getAttributes()))
        const div = viewWriter.createEditableElement('div', attributes)
        return toWidgetEditable(div, viewWriter)
      },
    })
  }
}

class InsertBlock3Command extends Command {
  execute() {
    this.editor.model.change( writer => {
      // Insert <block3>*</block3> at the current selection position
      // in a way that will result in creating a valid model structure.
      this.editor.model.insertObject( createBlock3( writer ) )
    })
  }

  refresh() {
    const model = this.editor.model
    const selection = model.document.selection
    const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'block3' )

    this.isEnabled = allowedIn !== null
  }
}

function createBlock3( writer ) {
  const block3 = writer.createElement( 'block3', { class: 'block3' } )

  const block3Content = writer.createElement( 'block3Content', { class: 'block3-content' } )

  writer.append( block3Content, block3 )
  writer.appendElement( 'paragraph', block3Content )

  return block3
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
