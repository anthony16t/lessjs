var version = 0.2
export class LessJs{
    constructor(){
        this.document = document
        this.elements={}
        this.data = {}
        this.events=[]
        this.mountOn=this.document
    }

    q(lessName,elementIndex){
        let elements = this.elements
        let element = false
        // check if given less name exists in less elements
        if(lessName in elements){
            let thisLessNameElements = elements[lessName]
            if(thisLessNameElements.length == 1){
                return thisLessNameElements[0]
            }else{
                if(elementIndex==undefined){
                    console.error(thisLessNameElements)
                    console.error(`${thisLessNameElements.length} were found with less name: ${lessName}, please use elementIndex`)
                    return false
                }else{
                    element = elements[lessName][elementIndex]
                }
            }
        }
        return element
    }
    
    run(selector,Data){
        // get all less tags from dom and run for loop to get and insert data
        let mountOn = this.document.querySelector(selector)
        this.mountOn=mountOn
        console.log('LessJs running on ',mountOn)
        let allLessTags = mountOn.querySelectorAll(`[less]`)
        allLessTags.forEach(e=>{
            // less will always take inner value and replace less value if not the same
            let thisElement = e
            let lessAttributes = thisElement.attributes['less']['value'].split(':')
            let [lessName, lessValue, lessInner, tagName] = [lessAttributes[0], this.__cleanStr(lessAttributes[1]), thisElement.innerText, thisElement.tagName]
            // check if key less name is empty, if so return an error
            if(lessName==''){
                console.error(e)
                console.error(`less name can not be empty, use less="keyName:KeyValue"`)
                return
            }
            // check if less value is empty if yes use inner value
            if(tagName === 'INPUT' || tagName === 'TEXTAREA'){
                if(lessValue==''){
                    if(thisElement.value.length > 0){ 
                        lessInner=this.__cleanStr(thisElement.value)
                    }
                }
            }
            else if(tagName == 'IMG' || tagName == 'IMAGE' || tagName == 'IFRAME' || tagName == 'VIDEO'){
                lessInner = thisElement.getAttribute('src')
            }
            else if(tagName == 'A'){
                lessInner = thisElement.getAttribute('href')
            }
            else{ // run un p,h2 and other tags
                if(lessValue==''){
                    if(lessInner.length > 0){
                        lessInner=this.__cleanStr(lessInner)
                    }
                }
            }
            
            // check if current less name was given in Data, if yes use Data value for this less name value
            if(Data){
                // if current less name in given data use given data value
                if(lessName in Data){ lessInner=Data[lessName] }
            }
            // else check if current less name was already assigned in this.data
            else if(lessName in this.data){
                lessInner=this.data[lessName]
            }

            // add less name attribute to current element, it will be use to get all less tags later on
            thisElement.setAttribute(`l-${lessName}`,'')

            // add current element to less elements list
            let lessNameInLess = lessName in this.elements
            if(lessNameInLess==false){
                this.elements[lessName]=[]
                this.elements[lessName].push(thisElement)
            }else{
                this.elements[lessName].push(thisElement)
            }
    
            // run if current element tag name is equal to input or textarea
            if(tagName === 'INPUT' || tagName === 'TEXTAREA'){
                // add to events
                this.events.push({ type:'keyup',element:thisElement,tagName:tagName,lessName:lessName })
                // set attributes
                thisElement.value=lessInner
                thisElement.attributes['less']['value']=[`${lessName}:${lessInner}`]
            }
            else if(tagName == 'IMG' || tagName == 'IMAGE' || tagName == 'IFRAME' || tagName == 'VIDEO'){
                thisElement.src=lessInner
                thisElement.attributes['less']['value']=[`${lessName}:${lessInner}`]
            }
            else if(tagName == 'A'){
                thisElement.href=lessInner
                thisElement.attributes['less']['value']=[`${lessName}:${lessInner}`]
            }
            // else run on h1,p, and other elements tag names
            else{
                // set attributes
                thisElement.innerText=lessInner
                thisElement.attributes['less']['value']=[`${lessName}:${lessInner}`]   
            }

            // add current name and value to this.data if everything went good
            this.data[lessName]=lessInner
            
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
                if(eventTagName === 'INPUT' || eventTagName === 'TEXTAREA'){
                    let eventInputValue = eventElement.value
                    // change inputs value
                    let eventLessLists = this.getAllByData(`l-${eventLessName}`)
                    eventLessLists.forEach(input=>{
                        input.value=eventInputValue
                        input.attributes['less']['value']=[`${eventLessName}:${this.__cleanStr(eventInputValue)}`]
                        this.data[eventLessName]=this.__cleanStr(eventInputValue)
                    })
                    // update other elements not input or textarea
                    this.getAllByData(`l-${eventLessName}`).forEach(e=>{
                        let eTagName=e.tagName
                        // only run if tag name is not input or textarea
                        if(!['TEXTAREA','INPUT'].includes(eTagName)){
                            e.innerText=eventInputValue
                            e.attributes['less']['value']=[`${eventLessName}:${this.__cleanStr(eventInputValue)}`]
                        }
                    })
                }
            })
        })// events loop end here

    }

    // ---- update ----
    update(less_name,new_value){
        if(less_name == undefined){ console.error('Missing less name on .update() ') ; return }
        if(new_value == undefined){ console.error('Missing new value on .update() ') ; return }
        let lessNameFound = less_name in this.data
        if(lessNameFound){
            // get all less tags from dom and change it values for given one
            let LessLists = this.mountOn.querySelectorAll(`[l-${less_name}]`)
            LessLists.forEach(el=>{
                let [thisElement,tagName] = [el,el.tagName]
                if(tagName == 'INPUT' || tagName == 'TEXTAREA'){
                    thisElement.value=new_value
                    thisElement.attributes['less']['value']=[`${less_name}:${this.__cleanStr(new_value)}`]
                }else if(tagName == 'IMG' || tagName == 'IMAGE' || tagName == 'IFRAME' || tagName == 'VIDEO'){
                    thisElement.src=new_value
                    thisElement.attributes['less']['value']=[`${less_name}:${this.__cleanStr(new_value)}`]
                }
                else if(tagName == 'A'){
                    thisElement.href=new_value
                    thisElement.attributes['less']['value']=[`${less_name}:${this.__cleanStr(new_value)}`]
                }
                else{
                    thisElement.innerText=new_value
                    thisElement.attributes['less']['value']=[`${less_name}:${this.__cleanStr(new_value)}`]
                }
            })
            // update this.data
            this.data[less_name]=this.__cleanStr(new_value)
        }else{
            console.error(`Less name >> ${less_name} << not found`) ; return
        }
    }

    // ---- these are javascript functions with sugar on them ----
    async uploadFiles(fileInput,url){
        // make sure fetch response return status:false or True, fileName:img.png and filePath:filepath.png
        // this function will return list of files upload on a promise
        let filesUploaded=[]
        if(!fileInput){ console.error('Images required on .uploadFiles()') }
        // upload
        for(let file of fileInput.files){
            let fileData = new FormData()
            // new FormData().append()
            fileData.append('file',file)
            let fetchReq = await fetch(url,{method:'POST',body:fileData})
            let fetchRes = await fetchReq.json()
            if(fetchRes['status']){
                filesUploaded.push({filePath:fetchRes['filePath'],fileName:fetchRes['fileName']})
            }
        }
        return filesUploaded
    }
    filesPreviewUrl(fileInput){
        let filePaths=[]
        for(let file of fileInput.files){
            filePaths.push(window.URL.createObjectURL(file))
        }
        return filePaths
    }
    async get(url){
        let res = await fetch(url,{ method:'GET'})
        let result = await res.json() ; return result
    }
    async post(url,data){
        let res = await fetch(url,{method:'POST',body:JSON.stringify(data),headers: {'Content-Type': 'application/json'}})
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
    getById(_id){
        let element = this.document.getElementById(_id)
        return element
    }
    getAllById(_id){
        let element = this.document.querySelectorAll(`#${_id}`)
        
        return element
    }
    getByClass(_className){
        let element = this.document.querySelector(`.${_className}`)
        return element
    }
    getAllByClass(_className){
        let element = this.document.querySelectorAll(`.${_className}`)
        return element
    }
    getByData(_dataName){
        let element = this.document.querySelector(`[${_dataName}]`)
        return element
    }
    getAllByData(_dataName){
        let element = this.document.querySelectorAll(`[${_dataName}]`)
        return element
    }

    // ---- these are utilities functions ----
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

}