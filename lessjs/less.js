var version = 0.1
export function print(data) { console.log(data) }
export class Less{
    constructor(DOCUMENT){
        this.document = DOCUMENT
        this.less=[]
        this.data = {}
        this.events=[]
        this.__on()
    }
    
    run(Data){
        // get all less tag from dom and run loop to get and insert data
        let lessList = this.getAllByData('less')
        lessList.forEach(e=>{

            // less will always take inner value and replace less value if not the same
            let thisElement = e
            let name_and_value = e.attributes['less']['value'].split(':')
            let lessName = name_and_value[0]
            let tagName = thisElement.tagName
            let lessValue = this.__cleanStr(name_and_value[1])
            let lessInner = thisElement.innerText 

            // if Data from user is set and current less name in it set lessInner to that value
            if(Data && lessName in Data){ lessInner=Data[lessName] }

            // check if key name is empty if so return an error
            if(lessName==''){
                console.error(thisElement)
                console.error(`less name can not be empty, use less="keyName:KeyValue"`)
                return
            }

            // add less name attribute to current element
            e.setAttribute(`l-${lessName}`,'')
            // add current less to this.less if everything went good
            this.less.push({ name:lessName,element:thisElement })

            // if tag name is an input tag

            if(tagName === 'INPUT'){
                this.events.push({ type:'keyup',element:thisElement,tagName:tagName,lessName:lessName })
                // if less name already in this.data use that data
                if(lessName in this.data){
                    e.value=this.data[lessName]
                    e.attributes['less']['value']=[`${lessName}:${this.data[lessName]}`]
                    return
                }else{
                    let inputValue = this.__cleanStr(e.value)
                    // if input value is not empty set value on data and inner to input value
                    if(inputValue !== ''){
                        e.value=inputValue
                        e.attributes['less']['value']=[`${lessName}:${this.__cleanStr(inputValue)}`]
                        // change less value
                        lessValue=this.__cleanStr(inputValue)
                    }else{ // else use less value even if it is empty
                        e.value=lessValue
                        e.attributes['less']['value']=[`${lessName}:${lessValue}`]
                    }
                }
            }
            
            // if tag name is not an input tag

            else{
                // if less name already in this.data use that data
                if(lessName in this.data){
                    e.innerText=this.data[lessName]
                    e.attributes['less']['value']=[`${lessName}:${this.data[lessName]}`]
                    return
                }else{
                    // if less inner is not empty set this.data less name value to input
                    if(lessInner !== ''){
                        e.innerText=lessInner
                        e.attributes['less']['value']=[`${lessName}:${this.__cleanStr(lessInner)}`]
                        // change less value
                        lessValue=this.__cleanStr(lessInner)
                    }else{ // else use less value even if it is empty
                        e.innerText=lessValue
                        e.attributes['less']['value']=[`${lessName}:${lessValue}`]
                    }
                }
            }

            // add current name and value to this.data if everything went good
            this.data[lessName]=lessValue
            
        })// loop end here

        // after the the elements loop run events listeners on this.events
        this.events.forEach(event=>{
            let eventType = event['type']
            let eventElement = event['element']
            let eventTagName = event['tagName']
            let eventLessName = event['lessName']
            eventElement.addEventListener(eventType,(e)=>{
                e.preventDefault()
                // run on input elements
                if(eventTagName === 'INPUT'){
                    let eventInputValue = eventElement.value.trim()
                    // change inputs value
                    let eventLessLists = this.getAllByData(`l-${eventLessName}`)
                    eventLessLists.forEach(input=>{
                        input.value=eventInputValue
                        input.attributes['less']['value']=[`${eventLessName}:${this.__cleanStr(eventInputValue)}`]
                    })
                }
            })

        })// events loop end here

    }


    // update
    update(less_name,new_value){
        if(less_name == undefined){
            console.error('Missing less name on .update() ') ; return
        }
        if(new_value == undefined){
            console.error('Missing new value on .update() ') ; return
        }
        let found=false
        // check if name exists in this.data
        if(less_name in this.data){ found=true }
        // if found change
        if(found){
            let oldValue = this.data[less_name]
            // only run is values are different
            if(oldValue !== new_value){
                // change inputs value
                let LessLists = this.getAllByData(`l-${less_name}`)
                LessLists.forEach(el=>{
                    el.innerText=new_value
                    el.attributes['less']['value']=[`${less_name}:${this.__cleanStr(new_value)}`]
                })// loop end
                // update this.data
                this.data[less_name]=this.__cleanStr(new_value)
            }
        }else{
            console.error(`Less name >> ${less_name} << not found`)
            return
        }

    }



    // these are javascript functions with sugar on them ------------------
    async get(url){
        let res = await fetch(url,{ method:'GET'})
        let result = await res.json() ; return result
    }
    newElement(tagName,classNames){
        // separate classes name using a comma classOne,classTow
        if(!tagName){
            console.error('tag name can not be empty newElement(tagName,classNames)')
            return
        }
        let _newElement = this.document.createElement(tagName)
        // if classes names are set add to new element
        if(classNames){
            if(classNames.includes(',')){
                for(let _class of classNames.split(',')){  _newElement.classList.add(_class.trim()) }
            }else{ _newElement.className = classNames.trim()}
        }
        return _newElement
    }
    toggleClass(element,className){ 
        if(!className){ className='active' }
        element.classList.toggle(className)
    }

    addClass(element,className){ 
        if(!className){
            console.error('addClass() className can not be empty')
            return
        }
        element.classList.add(className)
    }

    removeClass(element,className){ element.classList.remove(className) }

    getByLess(less_name){
        let lessElement = this.getByData(`l-${less_name}`)
        if(lessElement){ return lessElement }
        else{
            console.error(`Less name >> ${less_name} << not found`) ; return
        }
    }
    getAllByLess(less_name){
        let lessElement = this.getAllByData(`l-${less_name}`)
        if(lessElement){ return lessElement }
        else{
            console.error(`Less name >> ${less_name} << not found`) ; return
        }
    }

    getById(_id){
        let element = this.document.getElementById(_id)
        if(!element){ return false}
        return element
    }
    getAllById(_id){
        let element = this.document.querySelectorAll(_id)
        if(!element){ return false}
        return element
    }
    getByClass(_className){
        let element = this.document.querySelector(`.${_className}`)
        if(!element){ return false}
        return element
    }
    getAllByClass(_className){
        let element = this.document.querySelectorAll(`.${_className}`)
        if(!element){ return false}
        return element
    }
    getByData(_dataName){
        let element = this.document.querySelector(`[${_dataName}]`)
        if(!element){ return false}
        return element
    }
    getAllByData(_dataName){
        let element = this.document.querySelectorAll(`[${_dataName}]`)
        if(!element){ return false}
        return element
    }
    __cleanStr(data){
        if(typeof data == 'number'){ return data }
        if(data==''){ return ''}
        let numbers = [0,1,2,3,4,5,6,7,8,9,'0','1','2','3','4','5','6','7','8','9','.']
        // check to see data is a number
        for(let str of data){
            // if given data contain a string return data
            if(!numbers.includes(str)){ return data }
        }
        // if the data was not return on loop it is a number
        if(data.includes('.')){ return parseFloat(data)}
        else{ return parseInt(data)}
    }


    __on(){
        Element.prototype.onClick = function(_function){
            this.addEventListener('click',_function)
        }
        Element.prototype.onInputChange = function(_function,liveUpdate=false){
            this.addEventListener('keyup',_function)
            if(liveUpdate){
                print(liveUpdate)
            }
        }
    }
    
}







        // check when inner text change
        // let observer = new MutationObserver(mutationRecords => {
        //     mutationRecords.forEach(m=>{
        //         let mElement = m.target.parentElement
        //         let mOldValue = m.oldValue
        //         let mNewValue = m.target.data
        //         print(mElement)
        //         let name_and_value = mElement.attributes['less']['value'].split(':')
        //         let lessName = name_and_value[0]
        //         let lessValue = this.__cleanStr(name_and_value[1])
        //         print(this.data)
        //         print(lessName in this.data)    
        //     })
        // });
        // // observe everything except attributes
        // observer.observe(document, {
        //     childList: true, // observe direct children
        //     subtree: true, // and lower descendants too
        //     characterDataOldValue: true, // pass old data to callback
        //     attributeFilter: ['attr1', 'attr2'],
        //     attributes: true
        // })
        // check when inner text change end here