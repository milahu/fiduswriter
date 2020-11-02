import {Plugin, PluginKey, Selection} from "prosemirror-state"
import {ContentMenu} from '../../common'
import {WRITE_ROLES} from "../"
import {
    CATS
} from "../../schema/i18n"

const key = new PluginKey('table')

class TableView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options
        this.dom = document.createElement("div")
        this.dom.classList.add(`table-${node.attrs.width}`, `table-${node.attrs.aligned}`, 'content-container')
        this.dom.id = node.attrs.id
        this.menuButton = document.createElement("button")
        this.menuButton.classList.add('content-menu-btn')
        this.menuButton.innerHTML = '<span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>'
        this.dom.appendChild(this.menuButton)
        const dom = document.createElement('table')
        if (node.attrs.track.length) {
            dom.dataset.track = JSON.stringify(node.attrs.track)
        }
        dom.id = node.attrs.id
        dom.dataset.width = node.attrs.width
        dom.dataset.aligned = node.attrs.aligned
        dom.dataset.layout = node.attrs.layout
        dom.class = `table-${node.attrs.width} table-${node.attrs.aligned} table-${node.attrs.layout}`
        dom.dataset.category = node.attrs.category
        if (!node.attrs.caption) {
            dom.dataset.captionHidden = true
        }
        this.contentDOM = dom
        this.dom.appendChild(this.contentDOM)
    }

    stopEvent(event) {
        let stopped = false
        if (event.type === 'mousedown' && event.composedPath().includes(this.menuButton)) {
            stopped = true
            console.log('STOPPED')
            if (!isSelectedTableClicked(this.view.state, this.getPos())) {
                console.log('not selected clicked')
                const tr = this.view.state.tr
                const $pos = this.view.state.doc.resolve(this.getPos())
                tr.setSelection(Selection.findFrom($pos, 1, true))
                this.view.dispatch(tr)
            }
            const contentMenu = new ContentMenu({
                menu: this.options.editor.menu.tableMenuModel,
                width: 280,
                page: this.options.editor,
                menuPos: {X: parseInt(event.pageX) + 20, Y: parseInt(event.pageY) - 100},
                onClose: () => {
                    this.view.focus()
                }
            })
            contentMenu.open()
        }
        return stopped
    }

}

class TableCaptionView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options

        this.dom = document.createElement("caption")
        this.dom.innerHTML = '<span class="label" contenteditable="false"></span><span class="text"></span>'
        this.contentDOM = this.dom.lastElementChild
    }
}

const isSelectedTableClicked = (state, $pos) => {
    const pathArr = state.selection.$head.path
    for (let i = 0; i < pathArr.length ; i++) {
        if (pathArr[i].type && pathArr[i].type.name && pathArr[i].type.name === "table" && pathArr[i - 1] === $pos) {
            return true
        }
    }
    return false
}

export const tablePlugin = function(options) {
    return new Plugin({
        key,
        state: {
            init(_config, _state) {
                if (WRITE_ROLES.includes(options.editor.docInfo.access_rights)) {
                    this.spec.props.nodeViews['table'] =
                        (node, view, getPos) => new TableView(node, view, getPos, options)
                }
                this.spec.props.nodeViews['table_caption'] =
                    (node, view, getPos) => new TableCaptionView(node, view, getPos, options)

                return {}
            },
            apply(tr, prev) {
                return prev
            }
        },
        props: {
            nodeViews: {}
        },
        view(view) {
            let userLanguage = options.editor.view.state.doc.firstChild.attrs.language
            view.dom.querySelectorAll('table').forEach(el => {
                const category = el.dataset.category
                const labelEl = el.querySelector('caption span.label')
                if (category === 'none') {
                    labelEl.innerHTML = '&nbsp;'
                    return
                }
                labelEl.innerHTML = CATS[category][userLanguage]
            })
            return {
                update: (view, _prevState) => {
                    let selector = 'caption span.label:empty'
                    if (options.editor.view.state.doc.firstChild.attrs.language !== userLanguage) {
                        selector = 'caption span.label'
                        userLanguage = options.editor.view.state.doc.firstChild.attrs.language
                    }
                    view.dom.querySelectorAll(selector).forEach(el => {
                        const category = el.parentElement.parentElement.dataset.category
                        if (category === 'none') {
                            return
                        }
                        el.innerHTML = CATS[category][userLanguage]
                    })
                }
            }
        }
    })
}
