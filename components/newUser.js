import {LessJs} from '../lessJs/less.js'
let newUser = new LessJs() ; newUser.run('#newUser')

if(newUser.getById('newUser')){
    let newUserBtn = newUser.q('submit')
    newUserBtn.addEventListener('click',(e)=>{
        e.preventDefault()
        delete newUser.data['submit']
        console.log(newUser.data)
    })
}


