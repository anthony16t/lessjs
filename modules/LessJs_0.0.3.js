var version = '0.0.3'
class LessJs{
    constructor(){
        this.values = {}
        this.elements={}
        this.__DOCUMENT__ = document
        this.__ELEMENT_LIST__={}
        this.__TRACK_INPUT__=[] // keep track of any changes on input
    }
    
    run(selector,Data){
        // get all less tags from dom and run for loop to get and insert data
        let mountOn = this.__DOCUMENT__.querySelector(selector)
        console.log('LessJs running on ',mountOn)
        let allLessTags = mountOn.querySelectorAll(`[less]`)
        let allOnEvents = mountOn.querySelectorAll(`[less-on]`)
        allLessTags.forEach(e=>{
            // less will always take inner value and replace less value if not the same
            let thisElement = e
            let thisElementAttributes = thisElement.attributes
            let lessAttributes = thisElementAttributes['less']['value'].split(':')
            
            let [lessName, lessValue, lessInner, tagName] = [lessAttributes[0], this.__cleanStr(lessAttributes[1]), thisElement.innerText, thisElement.tagName]
            // check if key less name is empty, if so return an error
            if(lessName==''){
                console.error(e)
                console.error(`less name can not be empty, use less="keyName:KeyValue"`)
                return
            }
            // check if less value is empty if yes use inner value
            if( ['INPUT','TEXTAREA'].includes(tagName) ){
                lessInner=this.__cleanStr(thisElement.value)
            }
            else if( ['IMG','IMAGE','IFRAME','VIDEO'].includes(tagName) ){
                lessInner = thisElement.getAttribute('src')
            }
            else if(tagName === 'A'){
                lessInner = thisElement.getAttribute('href')
            }
            else{ // run un p,h2 and other tags

                if(lessValue===''){
                    if(lessInner.length > 0){
                        lessInner=this.__cleanStr(lessInner)
                    }
                }else{
                    lessInner=this.__cleanStr(lessValue)
                }
            }


            // check if this less name exists if yes use prev value
            let lessNameExists = lessName in this.values
            if(lessNameExists){
                lessInner=this.values[lessName]
            }else if(Data){if(lessName in Data){
                lessInner=Data[lessName]
            }}

            // add element to element list
            let lessInEList = lessName in this.__ELEMENT_LIST__
            if(!lessInEList){
                this.__ELEMENT_LIST__[lessName]=[]
                this.__ELEMENT_LIST__[lessName].push(thisElement)
            }else{
                this.__ELEMENT_LIST__[lessName].push(thisElement)
            }
    
            // insert value to current element
            if( ['INPUT','TEXTAREA'].includes(tagName) ){
                // add to trackInput events
                this.__TRACK_INPUT__.push({"element":thisElement,"lessName":lessName})
                thisElement.value=lessInner
            }
            else if( ['IMG','IMAGE','IFRAME','VIDEO'].includes(tagName) ){
                thisElement.src=lessInner
            }
            else if(tagName == 'A'){
                thisElement.href=lessInner
            }
            else{ // else run on h1,p, and other elements tag names
                thisElement.innerText=lessInner
            }

            // add element to elements it will be use when updating the dom
            let lessInElements = lessName in this.elements
            if(!lessInElements){
                this.elements[lessName]={}
                this.elements[lessName][tagName]=[]
            }
            let tagNameInElements = tagName in this.elements[lessName]
            if(!tagNameInElements){
                this.elements[lessName][tagName]=[]
            }
            this.elements[lessName][tagName].push(thisElement) 
            
            // remove less tag from current element
            thisElement.removeAttribute('less')

            // add current less name to data
            this.values[lessName]=lessInner

            
        })// loop end here

        // check for events on element
        allOnEvents.forEach(element=>{
            // make sure to add function to LessJs using LessJs.funcName=myFunctionName
            // you will get access to event object and element on your function as the first parameter
            let [eventName,funcName] = element.attributes['less-on'].value.split(':')
            element.addEventListener(eventName,(e)=>{
                window[funcName]=this[funcName](e,element)
            })
            // remove less-on tag
            element.removeAttribute('less-on')
        })

        // after the the elements loop run events listeners to keep track of input changes
        this.__TRACK_INPUT__.forEach(input=>{
            let [thisElement,thisLessName] = [input['element'],input['lessName']]
            thisElement.addEventListener('keyup',(e)=>{
                let newValue = e.target.value
                // check if less name in element list
                let isThisLessInEList = thisLessName in this.__ELEMENT_LIST__
                if(isThisLessInEList){
                    this.__ELEMENT_LIST__[thisLessName].forEach(element=>{
                        let tagName = element.tagName
                        if( ['INPUT','TEXTAREA'].includes(tagName) ){
                            element.value=newValue
                        }
                        else if( ['IMG','IMAGE','IFRAME','VIDEO'].includes(tagName) ){
                            element.src=newValue
                        }
                        else if(tagName == 'A'){
                            element.href=newValue
                        }
                        else{
                            element.innerText=newValue
                        }
                    })
                    // update this.values
                    this.values[thisLessName]=this.__cleanStr(newValue)

                }
            })
        })// events loop end here

    }


    query(lessQuery){
        // use less name example 'lessName>tagNam' or 'lessName>tagNam>indexNumber' if more than one
        let numOfSeparators = this.__count(lessQuery,'>')
        let [lessName,tagName,index] = lessQuery.split('>')
        lessName=lessName.trim()
        tagName=tagName.trim().toUpperCase()
        if(numOfSeparators>2){
            console.error(`Only 2 > max allow ${numOfSeparators} were given`)
            return undefined
        }
        // check if given less name exists in less elements
        if(lessName in this.elements){
            if(tagName in this.elements[lessName]){
                let numOfIndexForTagName = this.elements[lessName][tagName].length
                // if only one index was found return index 0
                if(numOfIndexForTagName == 1){
                    return this.elements[lessName][tagName][0]
                }else if(index){
                    index=parseInt(index.trim())
                    return this.elements[lessName][tagName][index]
                }else{
                    console.error(`${numOfIndexForTagName} index were found for ${tagName} please use 'lessName>tagNam>indexNumber>indexNumber'`,this.elements[lessName])
                    return undefined
                }
            }else{
                console.error(`Tag name ${tagName} was not found in`,this.elements[lessName])
            }
        }else{
            console.error(`Less name ${lessName} was not found in`,this.elements)
        }
        // return element
    }


    // ---- update ----
    update(less_name,newValue){
        if(less_name == undefined){ console.error('Missing less name on .update() ') ; return }
        if(newValue == undefined){ console.error(`Missing new value on .update(${less_name}) use .update(${less_name},'newValue') `) ; return }
        // check if less name in element list
        let isThisLessInEList = less_name in this.__ELEMENT_LIST__
        if(isThisLessInEList){
            this.__ELEMENT_LIST__[less_name].forEach(element=>{
                let tagName = element.tagName
                if( ['INPUT','TEXTAREA'].includes(tagName) ){
                    element.value=newValue
                }
                else if( ['IMG','IMAGE','IFRAME','VIDEO'].includes(tagName) ){
                    element.src=newValue
                }
                else if(tagName == 'A'){
                    element.href=newValue
                }
                else{
                    element.innerText=newValue
                }
            }) // end of loop
            // update this.values
            this.values[less_name]=this.__cleanStr(newValue)
        }// if end here
        else{
            console.error(`Less name: ${less_name}  not found .update(${less_name},${newValue})`) ; return
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
        let _newElement = this.__DOCUMENT__.createElement(tagName)
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
        let element = this.__DOCUMENT__.getElementById(_id)
        return element
    }
    getAllById(_id){
        let element = this.__DOCUMENT__.querySelectorAll(`#${_id}`)
        
        return element
    }
    getByClass(_className){
        let element = this.__DOCUMENT__.querySelector(`.${_className}`)
        return element
    }
    getAllByClass(_className){
        let element = this.__DOCUMENT__.querySelectorAll(`.${_className}`)
        return element
    }
    getByData(_dataName){
        let element = this.__DOCUMENT__.querySelector(`[${_dataName}]`)
        return element
    }
    getAllByData(_dataName){
        let element = this.__DOCUMENT__.querySelectorAll(`[${_dataName}]`)
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

    __count(data,key){
        let numFound=0
        for(let k of data){ if(k.trim()==key.trim()){numFound++}}
        return numFound
    }

}

export default new LessJs()