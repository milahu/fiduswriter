import {KeyFieldForm} from "./key"
import {noSpaceTmp} from "../../../common/common"

export class KeyListForm{
    constructor(dom, initialValue = [''], unused = undefined, fieldType = undefined) {
        this.currentValue = initialValue
        this.dom = dom
        this.fieldType = fieldType
    }

    init() {
        this.drawForm()
    }

    drawForm() {
        this.fields = []
        this.dom.innerHTML = '<table><tbody></tbody></table>'
        this.currentValue.forEach((fieldValue, index) => {
            this.addField(fieldValue, index)
        })
    }

    addField(fieldValue, index) {
        this.dom.firstChild.firstChild.insertAdjacentHTML(
            'beforeend',
            noSpaceTmp`
            <tr>
                <td></td>
                <td>
                    <span class="icon-minus-circle"></span>
                    <span class="icon-plus-circle"></span>
                </td>
            </tr>`
        )
        let fieldDOM = this.dom.firstChild.firstChild.lastChild
        let fieldHandler = new KeyFieldForm(fieldDOM.firstChild, fieldValue, false, this.fieldType)
        fieldHandler.init()
        this.fields.push(fieldHandler)

        // click on plus
        let addItemEl = fieldDOM.querySelector('.icon-plus-circle')
        addItemEl.addEventListener('click', () => {
            this.currentValue = this.value
            this.currentValue.splice(index+1, 0, '')
            this.drawForm()
        })

        // Click on minus
        let removeItemEl = fieldDOM.querySelector('.icon-minus-circle')
        removeItemEl.addEventListener('click', () => {
            this.currentValue = this.value
            this.currentValue.splice(index, 1)
            if (this.currentValue.length === 0) {
                this.currentValue = ['']
            }
            this.drawForm()
        })
    }

    get value() {
        let formValue = this.fields.map(field => {return field.value}).filter(
            value => {return value !== false}
        )
        if (formValue.length === 0) {
            return false
        }
        return formValue
    }

    check() {
        return true
    }
}
